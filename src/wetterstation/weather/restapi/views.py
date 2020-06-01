import datetime

from django.db.models import F
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .forms import ImageUploadForm
from .models import Temperature, Wind, Image, MeasurementSession
from .serializers import TemperatureSerialzer, WindSerializer, ImageSerializer, MeasurementSessionSerializer

# Create your views here.
# viewset for all basic funtions of CRUD and filtering by time


RASPI_TIME_VARIABLE = 'timestamp'
RASPI_SPEED_VARIABLE = 'speed'
RASPI_DIRECTION_VARIABLE = 'deg'
RASPI_DEGREES_VARIABLE = 'deg'
SESSION_ID = 'session_id'


def filter_by_dates(query_params, queryset):
    filtered_queryset = queryset.order_by('time')
    if 'start' in query_params:
        start_date = query_params['start']
        if 'end' in query_params:
            end_date = query_params['end']
        else:
            # this addition needs to be done
            # in order to get values from start_date 00:00 to end_date 23:59
            end_date = datetime.datetime.now() + datetime.timedelta(days=1)
        filtered_queryset = queryset.filter(time__range=(start_date, end_date))
    return filtered_queryset


class TemperatureViewSet(viewsets.ModelViewSet):
    serializer_class = TemperatureSerialzer
    queryset = Temperature.objects.all().order_by('time')

    def get_queryset(self):
        return filter_by_dates(self.request.query_params, Temperature.objects.all())


class WindViewSet(viewsets.ModelViewSet):
    serializer_class = WindSerializer
    queryset = Wind.objects.all().order_by('time')

    def get_queryset(self):
        return filter_by_dates(self.request.query_params, Wind.objects.all())

    @action(detail=False, methods=['GET'])
    def recent(self, request):
        """This method will return the wind data of the last 3 hours by default.
        If query parameter "lastHours" is set it will use this number instead of the default value. """
        last_hours = 3
        if 'lastHours' in request.query_params:
            try:
                last_hours = int(request.query_params['lastHours'])
            except ValueError:
                return Response('Parameter "lastHours" has to be numeric', status=status.HTTP_400_BAD_REQUEST)
        time_threshold = datetime.datetime.now() - datetime.timedelta(hours=last_hours)
        results = self.queryset.filter(time__gte=time_threshold)
        return Response(WindSerializer(results, many=True).data, status=status.HTTP_200_OK)


class ImageUploadView(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all().order_by('time')

    def get_queryset(self):
        return filter_by_dates(self.request.query_params, Image.objects.all())

    def create(self, request, *args, **kwargs):
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            number_of_bytes = int(request.headers.get('Content-Length'))
            session_id = int(form.data['session_id'])
            insert_or_update_measurement_session(session_id, number_of_bytes)
            session = get_measurement_session(session_id)

            new_image = Image()
            new_image.image = form.files['image']
            new_image.time = form.data['time']
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


class MeasurementSessionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MeasurementSessionSerializer
    queryset = MeasurementSession.objects.all().order_by('time')

    def get_queryset(self):
        return filter_by_dates(self.request.query_params, MeasurementSession.objects.all())


def get_measurement_session(session_id):
    try:
        return MeasurementSession.objects.all().get(session_id=session_id)
    except MeasurementSession.DoesNotExist:
        None


def insert_or_update_measurement_session(session_id, number_of_bytes):
    session, created = MeasurementSession.objects.all().get_or_create(session_id=session_id,
                                                                      defaults={'data_volume': number_of_bytes})
    if not created:
        session = MeasurementSession.objects.get(session_id=session_id)
        session.data_volume = F('data_volume') + number_of_bytes
        session.save()


@api_view(['POST'])
def receive_sensor_data(request):
    if request.method == 'POST':
        data = request.data
        number_of_bytes = int(request.headers.get('Content-Length'))
        session_id = int(data['session_id'])
        insert_or_update_measurement_session(session_id=session_id, number_of_bytes=number_of_bytes)
        temp_data = get_temp_data(data, session_id)
        wind_data = get_wind_data(data, session_id)
        store_wind_data(wind_data)
        store_temp_data(temp_data)
        return Response(status=status.HTTP_201_CREATED)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


def get_temp_data(data, session_id):
    temp_data = data['temp']
    temp_data['time'] = temp_data.pop(RASPI_TIME_VARIABLE)
    temp_data['degrees'] = temp_data.pop(RASPI_DEGREES_VARIABLE)
    temp_data['measurement_session'] = session_id
    return temp_data


def get_wind_data(data, session_id):
    wind_data = data['wind']
    wind_data['time'] = wind_data.pop(RASPI_TIME_VARIABLE)
    wind_data['direction'] = wind_data.pop(RASPI_DIRECTION_VARIABLE)
    wind_data['speed'] = wind_data.pop(RASPI_SPEED_VARIABLE)
    wind_data['measurement_session'] = session_id
    return wind_data


def store_temp_data(temp_data):
    temp_serializer = TemperatureSerialzer(data=temp_data)
    if temp_serializer.is_valid():
        temp_serializer.save()


def store_wind_data(wind_data):
    wind_serializer = WindSerializer(data=wind_data)
    if wind_serializer.is_valid():
        wind_serializer.save()
