from django import forms


class ImageUploadForm(forms.Form):
    time = forms.DateTimeField
    image = forms.ImageField
