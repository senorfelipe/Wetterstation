from django.contrib.auth.models import User
from django.db import models

"""
This file contains all models for the wetterstation application.
Each model represents a single table in our database.
"""


# Create your models here.


class MeasurementSession(models.Model):
    session_id = models.BigIntegerField(primary_key=True, unique=True)
    image_size = models.IntegerField(null=True)
    time = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return 'id: ' + str(self.session_id) + ', image_size: ' + str(self.image_size)


class Temperature(models.Model):
    degrees = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    measure_time = models.DateTimeField(db_index=True, null=True)
    measurement_session = models.OneToOneField(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time: ' + str(self.measure_time) + ', temperature: ' + str(
            self.degrees) + ', session_id: ' + str(
            self.measurement_session)


class Wind(models.Model):
    speed = models.DecimalField(max_digits=6, decimal_places=2, null=True)  # in m/s
    direction = models.DecimalField(max_digits=6, decimal_places=2, null=True)  # in degrees
    measure_time = models.DateTimeField(db_index=True, null=True)
    measurement_session = models.OneToOneField(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time:: ' + str(self.measure_time) + ', speed: ' + str(self.speed) + ', direction: ' + str(
            self.direction) + ', session_id: ' + str(self.measurement_session)


class Image(models.Model):
    image = models.ImageField(upload_to='images/%Y/%m')
    measure_time = models.DateTimeField(db_index=True, null=True)
    measurement_session = models.OneToOneField(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.image.name + ', session_id: ' + str(self.measurement_session)


class Battery(models.Model):
    current = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    voltage = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    temperature = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    measure_time = models.DateTimeField(db_index=True)
    measurement_session = models.OneToOneField(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time: ' + str(self.measure_time) + ', current: ' + str(self.current) + ', voltage: ' + str(
            self.voltage) + ', temperature: ' + str(self.temperature)


class SolarCell(models.Model):
    power = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    voltage = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    measure_time = models.DateTimeField(db_index=True, null=True)
    measurement_session = models.OneToOneField(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time: ' + str(self.measure_time) + ', current: ' + str(self.current) + ', voltage: ' + str(
            self.voltage)


class Load(models.Model):
    current = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    voltage = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    measure_time = models.DateTimeField(db_index=True, null=True)
    measurement_session = models.OneToOneField(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time: ' + str(self.measure_time) + ', current: ' + str(self.current) + ', voltage: ' + str(
            self.voltage)


class Controller(models.Model):
    mode = models.CharField(max_length=2, null=True)
    measure_time = models.DateTimeField(db_index=True)
    measurement_session = models.OneToOneField(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time: ' + str(self.measure_time) + ', mode: ' + str(self.mode)


class Configuration(models.Model):
    res_height = models.IntegerField()
    res_width = models.IntegerField()
    measure_intervall_sensors = models.IntegerField()
    measure_intervall_cam = models.IntegerField()
    post_intervall_sensor_data = models.IntegerField()
    post_intervall_image_data = models.IntegerField()

    def __str__(self):
        return 'resolution: ' + str(self.res_height) + 'x' + str(self.res_width)


class ConfigSession(models.Model):
    configuration = models.OneToOneField(Configuration, primary_key=True, on_delete=models.CASCADE)
    time = models.TimeField(auto_now_add=True)
    applied = models.BooleanField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
