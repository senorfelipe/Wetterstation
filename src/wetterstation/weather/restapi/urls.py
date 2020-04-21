"""
This file contains all urls related to the REST api.
"""
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework import routers

from django.conf import settings
from .views import TemperatureViewSet, WindViewSet, ImageUploadView

router = routers.DefaultRouter()
router.register(r'temps', TemperatureViewSet)
router.register(r'wind', WindViewSet)
router.register(r'images', ImageUploadView)

urlpatterns = [
    path('', include(router.urls)),
]
static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
