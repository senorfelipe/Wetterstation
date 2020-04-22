from rest_framework import viewsets, status
from rest_framework.response import Response

from .forms import ImageForm
from .models import Temperature, Wind, Image
from .serializers import TemperatureSerialzer, WindSerializer, ImageSerializer


# Create your views here.

# viewset for all basic funtions of CRUD and filtering by time
class TimeFilteringModelViewSet(viewsets.ModelViewSet):
    queryset = []

    def get_queryset(self):
        queryset = self.queryset
        if 'month' in self.request.query_params:
            month = self.request.query_params['month']
            queryset = queryset.filter(time__month=month)
        if 'day' in self.request.query_params:
            day = self.request.query_params['day']
            queryset = queryset.filter(time__day=day)
        if 'year' in self.request.query_params:
            year = self.request.query_params['year']
            queryset = queryset.filter(time__year=year)
        return queryset


class TemperatureViewSet(TimeFilteringModelViewSet):
    serializer_class = TemperatureSerialzer
    queryset = Temperature.objects.all().order_by('time')


class WindViewSet(TimeFilteringModelViewSet):
    serializer_class = WindSerializer
    queryset = Wind.objects.all().order_by('time')


class ImageUploadView(TimeFilteringModelViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all().order_by('time')

    def create(self, request, *args, **kwargs):
        form = ImageForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
