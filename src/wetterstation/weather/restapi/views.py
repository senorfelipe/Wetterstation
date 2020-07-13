import datetime

from django.db import transaction
from django.db.models import Avg, F, Max, Min
from django.db.models.functions import Ceil
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import databaseutils, costumviews
from .databaseutils import calculate_timedelta, UnixTimestamp, FromUnixtime
from .forms import ImageUploadForm
from .models import Image, MeasurementSession, Battery, Temperature, SolarCell, Wind, Configuration, ConfigSession
from .serializers import TemperatureSerialzer, WindSerializer, ImageSerializer, BatterySerializer, SolarCellSerializer, \
    MeasurementSessionSerializer, ConfigurationSerializer, ConfigSessionSerializer

"""
This file conatains viewsets for all basic funtions of CRUD and also special views if necessary. 
Additionally it contains the view to receive the sensor-data from the raspi.
"""
# constants to ensure data mapping
RASPI_SOLAR_CELL_KEY = 'pv'
RASPI_BATTERY_KEY = 'battery'
RASPI_WIND_KEY = 'wind'
RASPI_TEMPERATURE_KEY = 'temp'
RASPI_SESSION_ID_KEY = 'session_id'

KEY_MAPPING_DICT = {
    'timestamp': 'measure_time',
    'deg': 'degrees',
    'dir': 'direction'
}

WIND_AGGREGATION_INTERVALL_IN_MIN = 15


def filter_by_dates(query_params, queryset):
    """
    This method checks if query parameters for filtering by dates are there and then filters on the given queryset.
    If only parameter 'start' was set 'end' will implicitly be today.
    """
    filtered_queryset = queryset
    if 'start' in query_params:
        start_date = query_params['start']
        if 'end' in query_params:
            end_date = query_params['end']
        else:
            # this addition needs to be done
            # in order to get values from start_date 00:00 to today 23:59
            end_date = datetime.datetime.now() + datetime.timedelta(days=1)
        if issubclass(MeasurementSession, queryset.model) or issubclass(ConfigSession, queryset.model):
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

    def dispatch(self, *args, **kwargs):
        response = super().dispatch(*args, **kwargs)
        # For debugging purposes only.
        from django.db import connection
        print('# of Queries: {}'.format(len(connection.queries)))
        return response

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

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))

    def create(self, request, *args, **kwargs):
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            number_of_bytes = int(request.headers.get('Content-Length'))
            session_id = int(form.data['session_id'])
            session = update_or_create_measurement_session(session_id, number_of_bytes)

            new_image = Image()
            new_image.image = form.files['image']
            new_image.measure_time = form.data['measure_time']
            new_image.measurement_session = session
            new_image.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['GET'])
    def recent(self, request):
        """This method returns the 5 latest images."""
        recent_images = self.queryset.reverse()[:5]
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


@api_view(['POST'])
@permission_classes([AllowAny])
def receive_sensor_data(request):
    if request.method == 'POST':
        post_data = request.data
        for data in post_data:
            with transaction.atomic():
                session_id = int(data['session_id'])
                session = get_or_create_measurement_session(session_id)
                map_sensor_data(data, session)
                store_wind_data(data[RASPI_WIND_KEY])
                store_temp_data(data[RASPI_TEMPERATURE_KEY])
                store_battery_data(data[RASPI_BATTERY_KEY])
                store_solar_cell_data(data[RASPI_SOLAR_CELL_KEY])
        return Response(status=status.HTTP_201_CREATED)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


def map_sensor_data(data, session=None):
    for key, value in list(data.items()):
        if key in KEY_MAPPING_DICT:
            data[KEY_MAPPING_DICT[key]] = data.pop(key)
        if isinstance(value, dict):
            value['measurement_session'] = session.session_id
            map_sensor_data(value)
    return


def store_temp_data(temp_data):
    temp_serializer = TemperatureSerialzer(data=temp_data)
    if temp_serializer.is_valid():
        temp_serializer.save()


def store_wind_data(wind_data):
    wind_serializer = WindSerializer(data=wind_data)
    if wind_serializer.is_valid():
        wind_serializer.save()


def store_battery_data(battery_data):
    battery_serializer = BatterySerializer(data=battery_data)
    if battery_serializer.is_valid():
        battery_serializer.save()


def store_solar_cell_data(solar_cell_data):
    solar_serializer = SolarCellSerializer(data=solar_cell_data)
    if solar_serializer.is_valid():
        solar_serializer.save()


# Viewsets regarding AdminPanel

class ConfigurationViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Configuration.objects.all()
    serializer_class = ConfigurationSerializer

    def perform_create(self, serializer):
        print(serializer.validated_data())
        created = serializer.save()
        config_session = ConfigSession()
        config_session.configuration = created
        config_session.time = datetime.datetime.now()
        config_session.user = self.request.user
        config_session.save()


class ConfigSessionViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = ConfigSession.objects.all()
    serializer_class = ConfigSessionSerializer

    def get_queryset(self):
        filter_by_dates(self.request.query_params, self.queryset.order_by('time'))


class BatteryViewSet(costumviews.CreateListRetrieveViewSet):
    serializer_class = BatterySerializer
    queryset = Battery.objects.all()

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))

    @action(methods=['GET'], detail=False)
    def aggregate(self, request):
        queryset = self.get_queryset()
        if queryset.count() > databaseutils.MAX_DATASET_SIZE:
            timedelta_in_seconds = calculate_timedelta(queryset.aggregate(min=Min('time'))['min'],
                                                       queryset.aggregate(max=Max('time'))['max'])
            queryset = queryset.values(
                time_intervall=Ceil(UnixTimestamp(F('time')) / timedelta_in_seconds)).annotate(
                time=FromUnixtime(Avg(UnixTimestamp(F('time')))),
                image_size=Avg()
                    .order_by('measure_time').values('time', 'image_size'))
            print(queryset.query)
        return Response(queryset, status=status.HTTP_200_OK)


class SolarCellViewSet(costumviews.CreateListRetrieveViewSet):
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
                current=Avg('current'),
                voltage=Avg('voltage')) \
                .order_by('measure_time').values('measure_time', 'current', 'voltage')
            print(queryset.query)
        return Response(queryset, status=status.HTTP_200_OK)


class DataVolumeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MeasurementSessionSerializer
    queryset = MeasurementSession.objects.all()

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('time')).exclude(
            image_size__isnull=True)

    @action(methods=['GET'], detail=False)
    def aggregate(self, request):
        queryset = self.get_queryset()
        if queryset.count() > databaseutils.MAX_DATASET_SIZE:
            timedelta_in_seconds = calculate_timedelta(queryset.aggregate(min=Min('time'))['min'],
                                                       queryset.aggregate(max=Max('time'))['max'])
            queryset = queryset.values(
                time_intervall=Ceil(UnixTimestamp(F('time')) / timedelta_in_seconds)).annotate(
                image_size=Avg('image_size'),
                time=FromUnixtime(Avg(UnixTimestamp(F('time'))))) \
                .order_by('time')
            print(queryset.query)
        return Response(queryset.values('time', 'image_size'), status=status.HTTP_200_OK)
