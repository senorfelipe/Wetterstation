from django.db import models

"""
This file contains all models for the wetterstation application.
Each model represents a single table in our database.
"""


# Create your models here.


class MeasurementSession(models.Model):
    session_id = models.IntegerField(primary_key=True, unique=True)
    image_size = models.IntegerField(null=True)
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return 'id: ' + str(self.session_id) + ', image_size: ' + str(self.image_size)


class Temperature(models.Model):
    degrees = models.FloatField()
    measure_time = models.DateTimeField()
    measurement_session = models.ForeignKey(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time: ' + str(self.measure_time) + ', temperature: ' + str(
            self.degrees) + ', session_id: ' + str(
            self.measurement_session)


class Wind(models.Model):
    speed = models.FloatField()  # in m/s
    direction = models.FloatField()  # in degrees
    measure_time = models.DateTimeField()
    measurement_session = models.ForeignKey(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time:: ' + str(self.measure_time) + ', speed: ' + str(self.speed) + ', direction: ' + str(
            self.direction) + ', session_id: ' + str(self.measurement_session)


class Image(models.Model):
    image = models.ImageField(upload_to='images/%Y/%m')
    measure_time = models.DateTimeField()
    measurement_session = models.ForeignKey(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.image.name + ', session_id: ' + str(self.measurement_session)


class Battery(models.Model):
    current = models.FloatField()
    voltage = models.FloatField()
    temperature = models.FloatField()
    measure_time = models.DateTimeField()
    measurement_session = models.ForeignKey(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time: ' + str(self.measure_time) + ', current: ' + str(self.current) + ', voltage: ' + str(
            self.voltage) + ', temperature: ' + str(self.temperature)


class SolarCell(models.Model):
    current = models.FloatField()
    voltage = models.FloatField()
    measure_time = models.DateTimeField()
    measurement_session = models.ForeignKey(MeasurementSession, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return 'measure time: ' + str(self.measure_time) + ', current: ' + str(self.current) + ', voltage: ' + str(
            self.voltage)

    # class Configurations(models.Model):
#     res_hight = models.IntegerField
#     res_width = models.IntegerField
#
#     def __str__(self):
#         return 'maintenance: ' + self.maintenance_mode + 'resolution: ' + self.res_hight + 'x' + self.res_width
#
#
# class ConfigSession(models.Model):
#     configuration = models.OneToOneField(Configurations, primary_key=True)
#     start_time = models.TimeField(auto_now_add=True)
#     applied = models.BooleanField
#     # TODO add refrence to user here
