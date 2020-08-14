from django.contrib import admin
"""All models that are visible and editable by django admin page are registered here."""
# Register your models here.
from .models import Temperature, Wind, Image

admin.site.register(Temperature)
admin.site.register(Wind)
admin.site.register(Image)
