from django.db import models

"""
This file contains all models for the wetterstation application.
Each model represents a single table in our database.
"""


# Create your models here.


class Temperature(models.Model):
    value = models.DecimalField(max_digits=5, decimal_places=1)
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return 'created: ' + str(self.time) + ', temperature: ' + str(self.value)


class Wind(models.Model):
    # TODO ask costumer which foramt to use
    speed = models.DecimalField(max_digits=5, decimal_places=1)  # in m/s
    direction = models.DecimalField(max_digits=5, decimal_places=1)  # in degrees
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return 'created: ' + str(self.time) + ', speed: ' + self.speed + ', direction: ' + str(self.direction)


class Image(models.Model):
    image = models.ImageField(upload_to='images/%Y/%m/%d')
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image.name
