from django.db import models


# Create your models here.

class Temperature(models.Model):
    time = models.DateTimeField(auto_now=True)
    value = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return str(self.time) + ' ' + str(self.value)


class ImageReferences(models.Model):
    time = models.DateTimeField(auto_now_add=True)
    file_path = models.CharField(max_length=60)

    def __str__(self):
        return self.file_path
