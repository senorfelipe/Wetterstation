from rest_framework import viewsets
from.serializers import TemperatureSerializer
from .models import Temperature
from rest_framework import viewsets

from .models import Temperature
from .serializers import TemperatureSerializer


# Create your views here.

class TemperatureViewSet(viewsets.ModelViewSet):
    queryset = Temperature.objects.all().order_by('value')
    serializer_class = TemperatureSerializer

