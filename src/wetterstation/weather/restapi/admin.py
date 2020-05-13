from django.contrib import admin

# Register your models here.
from .models import Temperature, Wind, Image

admin.site.register(Temperature)
admin.site.register(Wind)
admin.site.register(Image)
