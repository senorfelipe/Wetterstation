from rest_framework import serializers

from .models import Wind, Temperature, Image, MeasurementSession, Battery, SolarCell, Configuration, ConfigSession, \
    Load, Controller, Log

"""
This file contains all Serializers to serialize and deserialize data.
For more information check: https://www.django-rest-framework.org/api-guide/serializers/
"""


class MeasurementSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementSession
        exclude = ['session_id']


class WindSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wind
        exclude = ['id']


class TemperatureSerialzer(serializers.ModelSerializer):
    class Meta:
        model = Temperature
        exclude = ['id']


class ImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(max_length=None, use_url=True)

    class Meta:
        model = Image
        exclude = ['id']


class BatterySerializer(serializers.ModelSerializer):
    class Meta:
        model = Battery
        exclude = ['id']


class SolarCellSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolarCell
        exclude = ['id']


class LoadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Load
        exclude = ['id']


class ControllerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Controller
        exclude = ['id']


class ConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuration
        exclude = ['id']


class ConfigSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigSession
        fields = '__all__'


class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        exclude = ['id']
