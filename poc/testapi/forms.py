from django.forms import ModelForm

from .models import ImageReferences


class ImageReferencesForm(ModelForm):
    class Meta:
        model = ImageReferences
        fields = "__all__"
