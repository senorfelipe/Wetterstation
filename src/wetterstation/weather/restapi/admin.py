from django.contrib import admin

"""All models that are visible and editable by django admin page are registered here."""
# Register your models here.
from .models import Temperature, Wind, Image, ConfigSession, Configuration, Load, Controller, SolarCell, Battery, \
    MeasurementSession, Log

admin.site.register(Temperature)
admin.site.register(Wind)
admin.site.register(Image)
admin.site.register(Load)
admin.site.register(Configuration)
admin.site.register(ConfigSession)
admin.site.register(Controller)
admin.site.register(SolarCell)
admin.site.register(Battery)
admin.site.register(MeasurementSession)
admin.site.register(Log)
