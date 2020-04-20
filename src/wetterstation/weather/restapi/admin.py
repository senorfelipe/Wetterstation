from django.contrib import admin

# Register your models here.
from .models import Temperature, Wind

admin.site.register(Temperature)
admin.site.register(Wind)
