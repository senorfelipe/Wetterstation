"""
This file contains all urls related to the REST api.
"""
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import TemperatureViewSet, WindViewSet, ImageUploadView, receive_sensor_data, BatteryViewSet, \
    SolarCellViewSet, DataVolumeViewSet, ConfigSessionViewSet, ConfigurationViewSet, LoadViewSet, GetStates, LogViewSet

router = routers.DefaultRouter()
router.register(r'temps', TemperatureViewSet)
router.register(r'wind', WindViewSet)
router.register(r'images', ImageUploadView)
router.register(r'data-volume', DataVolumeViewSet)
router.register(r'battery', BatteryViewSet)
router.register(r'solarcell', SolarCellViewSet)
router.register(r'load', LoadViewSet)
router.register(r'config', ConfigurationViewSet)
router.register(r'config-session', ConfigSessionViewSet)
router.register(r'logging', LogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('sensor-data/', receive_sensor_data),
    path('states/', GetStates.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
]
