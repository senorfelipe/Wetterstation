from rest_framework import viewsets, status
from rest_framework.response import Response

from .forms import ImageForm
from .models import Temperature, Wind, Image
from .serializers import TemperatureSerialzer, WindSerializer, ImageSerializer


# Create your views here.

# viewset for all basic funtions of CRUD and filtering by time

def get_queryset(model_view_set, model):
    queryset = model.objects.all().order_by('time')
    if 'hour' in model_view_set.request.query_params:
        hour = model_view_set.request.query_params['hour']
        queryset = queryset.filter(time__hour=hour)
    if 'day' in model_view_set.request.query_params:
        day = model_view_set.request.query_params['day']
        queryset = queryset.filter(time__day=day)
    if 'month' in model_view_set.request.query_params:
        month = model_view_set.request.query_params['month']
        queryset = queryset.filter(time__month=month)
    if 'year' in model_view_set.request.query_params:
        year = model_view_set.request.query_params['year']
        queryset = queryset.filter(time__year=year)
    return queryset


class TemperatureViewSet(viewsets.ModelViewSet):
    serializer_class = TemperatureSerialzer
    queryset = Temperature.objects.all().order_by('time')

    def get_queryset(self):
        return get_queryset(self, Temperature)


class WindViewSet(viewsets.ModelViewSet):
    serializer_class = WindSerializer
    queryset = Wind.objects.all().order_by('time')

    def get_queryset(self):
        return get_queryset(self, Wind)


class ImageUploadView(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all().order_by('time')

    def get_queryset(self):
        return get_queryset(self, Image)

    def create(self, request, *args, **kwargs):
        form = ImageForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
