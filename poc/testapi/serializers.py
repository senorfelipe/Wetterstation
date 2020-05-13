from rest_framework import serializers

from .models import Temperature, ImageReferences


class TemperatureSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Temperature
        fields = ('time', 'value')


class ImageReferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageReferences
        fields = '__all__'
