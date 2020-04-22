from rest_framework import viewsets
from rest_framework.response import Response

from .forms import ImageReferencesForm
from .serializers import TemperatureSerializer, ImageReferencesSerializer
from .models import Temperature, ImageReferences
from rest_framework import viewsets

from .models import Temperature
from .serializers import TemperatureSerializer


# Create your views here.

class TemperatureViewSet(viewsets.ModelViewSet):
    queryset = Temperature.objects.all().order_by('value')
    serializer_class = TemperatureSerializer


@api_view(['GET', 'POST'])
def image_refereces(request):
    if request.method == 'GET':
        images = ImageReferences.objects.all().order_by('time')
        serializer = ImageReferencesSerializer(images, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        form = ImageReferencesForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return Response({"message": "Received File"}, status=201)
