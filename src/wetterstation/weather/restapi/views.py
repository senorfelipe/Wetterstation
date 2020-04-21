from rest_framework import viewsets, status
from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Temperature, Wind, Image
from .serializers import TemperatureSerialzer, WindSerializer, ImageSerializer


# Create your views here.

# viewset for all basic funtions of CRUD
class TemperatureViewSet(viewsets.ModelViewSet):
    serializer_class = TemperatureSerialzer
    queryset = Temperature.objects.all().order_by('time')


class WindViewSet(viewsets.ModelViewSet):
    serializer_class = WindSerializer
    queryset = Wind.objects.all().order_by('time')


class ImageUploadView(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all().order_by('uploaded')
