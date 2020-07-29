from rest_framework import serializers

from .models import Wind, Temperature, Image, MeasurementSession, Battery, SolarCell, Configuration, ConfigSession, \
    Load, Controller


class MeasurementSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementSession
        exclude = ['session_id']


class WindSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wind
        exclude = ['id', 'measurement_session']


class TemperatureSerialzer(serializers.ModelSerializer):
    class Meta:
        model = Temperature
        exclude = ['id', 'measurement_session']


class ImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(max_length=None, use_url=True)

    class Meta:
        model = Image
        exclude = ['id', 'measurement_session']


class BatterySerializer(serializers.ModelSerializer):
    class Meta:
        model = Battery
        exclude = ['id', 'measurement_session']


class SolarCellSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolarCell
        exclude = ['id', 'measurement_session']


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
