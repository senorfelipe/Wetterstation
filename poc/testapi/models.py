from django.db import models


# Create your models here.

class Temperature(models.Model):
    value = models.DecimalField(max_digits=5, decimal_places=2)
    unit = models.CharField(max_length=20)

    def __str__(self):
        return str(self.value) + ' ' + self.unit
