# Generated by Django 3.0.2 on 2020-05-18 10:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('restapi', '0006_auto_20200518_1058'),
    ]

    operations = [
        migrations.RenameField(
            model_name='image',
            old_name='image_url',
            new_name='image',
        ),
    ]
