"""
This file contains all urls related to the REST api.
"""

from django.urls import path, include
from rest_framework import routers

from .views import TemperatureViewSet, WindViewSet

router = routers.DefaultRouter()
router.register(r'temps', TemperatureViewSet)
router.register(r'wind', WindViewSet)

urlpatterns = [
    path('', include(router.urls))
]
