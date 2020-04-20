from rest_framework import viewsets

from .models import Temperature, Wind
from .serializers import TemperatureSerialzer, WindSerializer


# Create your views here.

# viewset for all basic funtions of CRUD
class TemperatureViewSet(viewsets.ModelViewSet):
    serializer_class = TemperatureSerialzer
    queryset = Temperature.objects.all().order_by('time')


class WindViewSet(viewsets.ModelViewSet):
    serializer_class = WindSerializer
    queryset = Wind.objects.all().order_by('time')
