from django import forms

from .models import Image


class ImageUploadForm(forms.Form):
    time = forms.DateTimeField
    image = forms.ImageField
