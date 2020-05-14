import datetime

from rest_framework import viewsets, status
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
            end_date = datetime.datetime.now()
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
        return filter_by_dates(self, Wind)


class ImageUploadView(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all().order_by('time')

    def get_queryset(self):
        return filter_by_dates(self, Image)

    def create(self, request, *args, **kwargs):
        form = ImageForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
