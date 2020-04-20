from rest_framework import serializers

from .models import Wind, Temperature


class WindSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wind
        fields = '__all__'


class TemperatureSerialzer(serializers.ModelSerializer):
    class Meta:
        model = Temperature
        fields = '__all__'
