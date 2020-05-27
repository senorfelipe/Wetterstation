from rest_framework import serializers

from .models import Wind, Temperature, Image, MeasurementSession


class MeasurementSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementSession
        fields = '__all__'


class WindSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wind
        fields = '__all__'


class TemperatureSerialzer(serializers.ModelSerializer):
    class Meta:
        model = Temperature
        fields = '__all__'


class ImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(max_length=None, use_url=True)

    class Meta:
        model = Image
        fields = '__all__'
