import datetime

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .forms import ImageUploadForm
from .models import Temperature, Wind, Image, MeasurementSession, Battery, SolarCell
from .serializers import TemperatureSerialzer, WindSerializer, ImageSerializer, MeasurementSessionSerializer, \
    BatterySerializer, SolarCellSerializer

'''
This file conatains viewsets for all basic funtions of CRUD and also special views if necessary. 
Additionally it contains the view to receive the sensor-data from the raspi.
'''

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


def filter_by_dates(query_params, queryset):
    filtered_queryset = queryset
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


def group_queryset_by_session_id(queryset):
    queryset.values('measurement_session__session_id')


class MeasurementSessionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MeasurementSessionSerializer
    queryset = MeasurementSession.objects.all().order_by('time')

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('time'))


class TemperatureViewSet(viewsets.ModelViewSet):
    serializer_class = TemperatureSerialzer
    queryset = Temperature.objects.all().order_by('measure_time')

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))


class BatteryViewSet(viewsets.ModelViewSet):
    serializer_class = BatterySerializer
    queryset = Battery.objects.all().order_by('measure_time')

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))


class SolarCellViewSet(viewsets.ModelViewSet):
    serializer_class = SolarCellSerializer
    queryset = SolarCell.objects.all().order_by('measure_time')

    def get_queryset(self):
        # extra order_by call needs to be done in order to refresh the queryset
        return filter_by_dates(self.request.query_params, self.queryset.order_by('measure_time'))


class WindViewSet(viewsets.ModelViewSet):
    serializer_class = WindSerializer
    queryset = Wind.objects.all().order_by('measure_time')
    query_param_recent = 'last_hours'

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
        return Response(WindSerializer(results, many=True).data, status=status.HTTP_200_OK)


class ImageUploadView(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all().order_by('measure_time')

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
def receive_sensor_data(request):
    if request.method == 'POST':
        data = request.data
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
