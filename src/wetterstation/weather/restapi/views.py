import datetime

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .forms import ImageForm
from .models import Temperature, Wind, Image
from .serializers import TemperatureSerialzer, WindSerializer, ImageSerializer


# Create your views here.

# viewset for all basic funtions of CRUD and filtering by time

def filter_by_dates(query_params, queryset):
    resultset = queryset.order_by('time')
    if 'start' in query_params:
        start_date = query_params['start']
        if 'end' in query_params:
            end_date = query_params['end']
        else:
            # this addition needs to be done in order to get values from today
            end_date = datetime.datetime.now() + datetime.timedelta(days=1)
        resultset = queryset.filter(time__range=(start_date, end_date))
    return resultset


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


class ImageUploadView(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all().order_by('time')

    def get_queryset(self):
        return filter_by_dates(self.request.query_params, Image.objects.all())

    def create(self, request, *args, **kwargs):
        form = ImageForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


def get_temp_data(data):
    temp_data = data['temp']
    temp_data['time'] = temp_data.pop('timestamp')
    temp_data['degrees'] = temp_data.pop('deg')
    return temp_data


def get_wind_data(data):
    wind_data = data['wind']
    wind_data['time'] = wind_data.pop('timestamp')
    wind_data['direction'] = wind_data.pop('deg')
    return wind_data


@api_view(['POST'])
def receive_sensor_data(request):
    if request.method == 'POST':
        data = request.data
        temp_data = get_temp_data(data)
        wind_data = get_wind_data(data)
        store_wind_data(wind_data)
        store_temp_data(temp_data)
        return Response(status=status.HTTP_201_CREATED)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


def store_temp_data(temp_data):
    temp_serializer = TemperatureSerialzer(data=temp_data)
    if temp_serializer.is_valid():
        temp_serializer.save()


def store_wind_data(wind_data):
    wind_serializer = WindSerializer(data=wind_data)
    if wind_serializer.is_valid():
        wind_serializer.save()
