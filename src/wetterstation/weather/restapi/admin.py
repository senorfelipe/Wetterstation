from django.contrib import admin

# Register your models here.
from .models import Temperature, Wind, Image, Battery, SolarCell, Configuration, Load, Controller

admin.site.register(Temperature)
admin.site.register(Wind)
admin.site.register(Image)
admin.site.register(Battery)
admin.site.register(Load)
admin.site.register(Configuration)
admin.site.register(Controller)
admin.site.register(SolarCell)
