import datetime
import logging

from django.db import transaction
from django.db.models import Avg, F, Max, Min, Sum, Q
from django.db.models.functions import Ceil
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import databaseutils, costumviews
from .constants import WIND_AGGREGATION_INTERVALL_IN_MIN, RASPI_IP_ADDR
from .databaseutils import calculate_timedelta, UnixTimestamp, FromUnixtime, Date
from .dataprocessing import map_sensor_data, validate
from .forms import ImageUploadForm
from .models import Image, MeasurementSession, Battery, Temperature, SolarCell, Wind, Configuration, ConfigSession, \
    Load, Log
from .serializers import TemperatureSerialzer, WindSerializer, ImageSerializer, BatterySerializer, SolarCellSerializer, \
    MeasurementSessionSerializer, ConfigurationSerializer, ConfigSessionSerializer, LoadSerializer, \
    ControllerSerializer, LogSerializer

"""
This file conatains viewsets for all basic funtions of CRUD and also special views if necessary. 
Additionally it contains the view to receive the sensor-data from the raspi.
"""

last_post_time_raspi = None
logger = logging.getLogger(__name__)


def filter_by_dates(date_range, queryset):
    """
    This method checks if query parameters for filtering by dates are there and then filters on the given queryset.
    If only parameter 'start' was set 'end' will implicitly be today.
    """
    filtered_queryset = queryset
    if 'start' in date_range:
        start_date = date_range['start']
        if 'end' in date_range:
            end_date = date_range['end']
        else:
            # this addition needs to be done
            # in order to get values from start_date 00:00 to today 23:59
            end_date = datetime.datetime.now() + datetime.timedelta(days=1)
        if issubclass(MeasurementSession, queryset.model) or issubclass(ConfigSession, queryset.model) or issubclass(
                Log, queryset.model):
            filtered_queryset = queryset.filter(time__range=(start_date, end_date))
        else:
            filtered_queryset = queryset.filter(measure_time__range=(start_date, end_date))
    return filtered_queryset


class TemperatureViewSet(costumviews.CreateListRetrieveViewSet):
    serializer_class = TemperatureSerialzer
    queryset = Temperature.objects.all()

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))

    def list(self, request, *args, **kwargs):
        return Response(self.get_queryset().values('degrees', 'measure_time'))

    @action(methods=['GET'], detail=False)
    def aggregate(self, request):
        queryset = self.get_queryset()
        if queryset.count() > databaseutils.MAX_DATASET_SIZE:
            timedelta_in_seconds = calculate_timedelta(queryset.aggregate(min=Min('measure_time'))['min'],
                                                       queryset.aggregate(max=Max('measure_time'))['max'])
            queryset = queryset.values(
                time_intervall=Ceil(UnixTimestamp(F('measure_time')) / timedelta_in_seconds)).annotate(
                degrees=Avg('degrees'),
                measure_time=FromUnixtime(Avg(UnixTimestamp(F('measure_time'))))) \
                .order_by('measure_time')
            print(queryset.query)
        return Response(queryset.values('measure_time', 'degrees'), status=status.HTTP_200_OK)


class WindViewSet(costumviews.CreateListRetrieveViewSet):
    serializer_class = WindSerializer
    queryset = Wind.objects.all()
    query_param_recent = 'lasthours'

    def get_queryset(self):
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))

    @action(detail=False, methods=['GET'])
    def recent(self, request):
        """This method will return the wind data of the last 3 hours by default.
        If query parameter "lasthours" is set it will use this number instead of the default value. """
        last_hours = 3
        if self.query_param_recent in request.query_params:
            try:
                last_hours = int(request.query_params[self.query_param_recent])
            except ValueError:
                return Response('Parameter "lastHours" has to be numeric', status=status.HTTP_400_BAD_REQUEST)
        time_threshold = datetime.datetime.now() - datetime.timedelta(hours=last_hours)
        results = self.queryset.filter(measure_time__range=(time_threshold, datetime.datetime.now()))
        results = self.aggregate_on_queryset(results)
        return Response(results.values('measure_time', 'speed', 'direction'), status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def aggregate(self, request):
        queryset = self.get_queryset()
        queryset = self.aggregate_on_queryset(queryset)
        return Response(queryset.values('measure_time', 'speed', 'direction'), status=status.HTTP_200_OK)

    @staticmethod
    def aggregate_on_queryset(queryset):
        if queryset.count() > databaseutils.MAX_DATASET_SIZE:
            timedelta_in_seconds = WIND_AGGREGATION_INTERVALL_IN_MIN * 60
            queryset = queryset.values(
                time_intervall=Ceil(UnixTimestamp(F('measure_time')) / timedelta_in_seconds)).annotate(
                measure_time=FromUnixtime(Avg(UnixTimestamp(F('measure_time')))),
                speed=Avg('speed'),
                direction=Avg('direction')) \
                .order_by('measure_time')
            print(queryset.query)
        return queryset


class ImageUploadView(costumviews.CreateListRetrieveViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all()
    permission_classes = [AllowAny]

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))

    def create(self, request, *args, **kwargs):
        """
        This method receives posted images, validates them, saves the size of the image and writes the image to the
        file system and its referenece into the database.
        """
        if get_client_ip(request) == RASPI_IP_ADDR:
            form = ImageUploadForm(request.POST, request.FILES)
            if form.is_valid():
                number_of_bytes = int(request.headers.get('Content-Length'))
                session_id = None
                if form.data['session_id'] is not None:
                    session_id = int(form.data['measurement_session'])
                session = update_or_create_measurement_session(session_id, number_of_bytes)

                new_image = Image()
                new_image.image = form.files['image']
                new_image.measure_time = form.data['measure_time']
                new_image.measurement_session = session
                new_image.save()
                return Response(status=status.HTTP_201_CREATED)
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['GET'])
    def recent(self, request):
        """This method returns the 5 latest images."""
        recent_images = self.queryset.order_by('measure_time').reverse()[:5]
        # context 'request' is set here in order to return the absolute url of the image
        serializer = ImageSerializer(recent_images, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


def update_or_create_measurement_session(session_id, number_of_bytes):
    session, created = MeasurementSession.objects.update_or_create(session_id=session_id,
                                                                   defaults={'image_size': number_of_bytes})
    return session


def get_or_create_measurement_session(session_id):
    session, created = MeasurementSession.objects.get_or_create(session_id=session_id)
    return session


def update_last_post_time():
    global last_post_time_raspi
    last_post_time_raspi = datetime.datetime.now()


@api_view(['POST'])
@permission_classes([AllowAny])
def receive_sensor_data(request):
    """
    This API view is resposible to receive the sensor data from the raspi.
    Therefore it mappes and validates the data and saves it to the specific tables in the database.
    """
    if request.method == 'POST' and get_client_ip(request) == RASPI_IP_ADDR:
        post_data = request.data
        update_last_post_time()
        for data in post_data:
            session_id = int(data['session_id'])
            session = get_or_create_measurement_session(session_id)
            mapped_data = map_sensor_data(data, session.session_id)
            validate(mapped_data)

            with transaction.atomic():
                wind_was_stored = store_data(WindSerializer(data=mapped_data['wind']))
                temp_was_stored = store_data(TemperatureSerialzer(data=mapped_data['temperature']))
                bat_was_stored = store_data(BatterySerializer(data=mapped_data['battery']))
                sc_was_stored = store_data(SolarCellSerializer(data=mapped_data['solar_cell']))
                load_was_stored = store_data(LoadSerializer(data=mapped_data['load']))
                controller_was_stored = store_data(ControllerSerializer(data=mapped_data['controller']))
        if len(
                post_data) != 0 and wind_was_stored and temp_was_stored and bat_was_stored and sc_was_stored and controller_was_stored and load_was_stored:
            logger.info('Received sensor data and stored it sucessfully.')
            return Response(status=status.HTTP_201_CREATED)
        else:
            msg = "Ressources could not be created properly."
            logger.warning(msg=msg)
            return Response(data=msg, status=status.HTTP_409_CONFLICT)

    else:
        return Response(status=status.HTTP_401_UNAUTHORIZED)


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def store_data(serializer):
    created = False
    if serializer.is_valid():
        serializer.save()
        created = True
    else:
        logger.error(
            "Could not store data of " + str(serializer) + " with error: " + str(serializer.errors))
    return created


# -------------------------------
# Viewsets regarding AdminPanel
# -------------------------------

class ConfigurationViewSet(costumviews.CreateListRetrieveViewSet):
    queryset = Configuration.objects.all()
    serializer_class = ConfigurationSerializer

    def perform_create(self, serializer):
        created = serializer.save()
        config_session = ConfigSession()
        config_session.configuration = created
        config_session.applied = False
        config_session.time = datetime.datetime.now()
        config_session.user = self.request.user
        config_session.save()

    @action(methods=['GET'], detail=False)
    def latest(self, request, *args, **kwargs):
        latest = Configuration.objects.latest('time')
        return Response(self.get_serializer(latest).data)


class ConfigSessionViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = ConfigSession.objects.all()
    serializer_class = ConfigSessionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return filter_by_dates(self.request.query_params, self.queryset.order_by('time'))

    def list(self, request, *args, **kwargs):
        result = self.queryset.values('configuration_id', 'user__username', 'time', 'applied')
        return Response(result)

    @action(methods=['POST', 'GET'], detail=False)
    def latest(self, request, *args, **kwargs):
        try:
            latest = ConfigSession.objects.latest('time')
        except ConfigSession.DoesNotExist as e:
            logger.warning('No latest ConfigSession was found.', str(e))
        if request.method == 'GET':
            return Response(self.get_serializer(latest).data)
        elif self.request.method == 'POST':
            if len(self.request.data) == 1 and request.data['applied']:
                latest.applied = True
                latest.save()
                return Response(status=status.HTTP_200_OK)
            return Response(status=status.HTTP_204_NO_CONTENT)


class GetStates(APIView):
    """This API View queries all error values of the last week for each Sensor-Data Table."""

    def get_errors_dict(self):
        start_7_days_ago = {'start': datetime.datetime.now() - datetime.timedelta(days=7)}
        temp_errors = filter_by_dates(start_7_days_ago, Temperature.objects.all()).filter(degrees__isnull=True).count()
        wind_dir_errors = filter_by_dates(start_7_days_ago, Wind.objects.all()).filter(direction__isnull=True).count()
        wind_speed_errors = filter_by_dates(start_7_days_ago, Wind.objects.all()).filter(speed__isnull=True).count()
        pv_errors = filter_by_dates(start_7_days_ago, SolarCell.objects.all()).filter(
            Q(voltage__isnull=True) | Q(power__isnull=True)).count()
        battery_errors = filter_by_dates(start_7_days_ago, Battery.objects.all()).filter(
            Q(current__isnull=True) | Q(voltage__isnull=True) | Q(temperature__isnull=True)).count()
        load_errors = filter_by_dates(start_7_days_ago, Load.objects.all()).filter(
            Q(current__isnull=True) | Q(voltage__isnull=True)).count()
        states = {'temp': temp_errors, 'wind_speed': wind_speed_errors, 'wind_dir': wind_dir_errors,
                  'pv_errors': pv_errors, 'battery_errors': battery_errors, 'load_errors': load_errors}
        return states

    @method_decorator(cache_page(60 * 20))
    def get(self, request, format=None):
        states = {'lastPostTime': last_post_time_raspi, 'states': self.get_errors_dict()}
        return Response(states, status=status.HTTP_200_OK)


class BatteryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BatterySerializer
    queryset = Battery.objects.all()

    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))

    @action(methods=['GET'], detail=False)
    def aggregate(self, request):
        queryset = self.get_queryset()
        if queryset.count() > databaseutils.MAX_DATASET_SIZE:
            timedelta_in_seconds = calculate_timedelta(queryset.aggregate(min=Min('measure_time'))['min'],
                                                       queryset.aggregate(max=Max('measure_time'))['max'])
            queryset = queryset.values(
                time_intervall=Ceil(UnixTimestamp(F('measure_time')) / timedelta_in_seconds)).annotate(
                measure_time=FromUnixtime(Avg(UnixTimestamp(F('measure_time')))),
                current=Avg('current'),
                voltage=Avg('voltage'),
                temperature=Avg('temperature')) \
                .order_by('measure_time')
        return Response(queryset.values('measure_time', 'current', 'voltage', 'temperature'), status=status.HTTP_200_OK)


class SolarCellViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SolarCellSerializer
    queryset = SolarCell.objects.all()

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))

    @action(methods=['GET'], detail=False)
    def aggregate(self, request):
        queryset = self.get_queryset()
        if queryset.count() > databaseutils.MAX_DATASET_SIZE:
            timedelta_in_seconds = calculate_timedelta(queryset.aggregate(min=Min('measure_time'))['min'],
                                                       queryset.aggregate(max=Max('measure_time'))['max'])
            queryset = queryset.values(
                time_intervall=Ceil(UnixTimestamp(F('measure_time')) / timedelta_in_seconds)).annotate(
                measure_time=FromUnixtime(Avg(UnixTimestamp(F('measure_time')))),
                power=Avg('power'),
                voltage=Avg('voltage')) \
                .order_by('measure_time')
        return Response(queryset.values('measure_time', 'power', 'voltage'), status=status.HTTP_200_OK)


class LoadViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LoadSerializer
    queryset = Load.objects.all()

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))

    @action(methods=['GET'], detail=False)
    def aggregate(self, request):
        queryset = self.get_queryset()
        if queryset.count() > databaseutils.MAX_DATASET_SIZE:
            timedelta_in_seconds = calculate_timedelta(queryset.aggregate(min=Min('measure_time'))['min'],
                                                       queryset.aggregate(max=Max('measure_time'))['max'])
            queryset = queryset.values(
                time_intervall=Ceil(UnixTimestamp(F('measure_time')) / timedelta_in_seconds)).annotate(
                measure_time=FromUnixtime(Avg(UnixTimestamp(F('measure_time')))),
                current=Avg('current'),
                voltage=Avg('voltage')) \
                .order_by('measure_time')
        return Response(queryset.values('measure_time', 'current', 'voltage'), status=status.HTTP_200_OK)


class DataVolumeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MeasurementSessionSerializer
    queryset = MeasurementSession.objects.all()

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('time')).exclude(
            image_size__isnull=True)

    @action(methods=['GET'], detail=False)
    def aggregate_by_day(self, request):
        """
        This method sums up the data volume per day.
        It returns the data volume for every day of the current month.
        """
        queryset = self.get_queryset()
        queryset = queryset.values(date=Date(F('time'))).annotate(data_volume=Sum('image_size'), time=Date('time'))
        return Response(queryset.values('date', 'data_volume'), status=status.HTTP_200_OK)


class LogViewSet(costumviews.CreateListRetrieveViewSet):
    serializer_class = LogSerializer
    queryset = Log.objects.all()
    permission_classes = [AllowAny]

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('time'))
