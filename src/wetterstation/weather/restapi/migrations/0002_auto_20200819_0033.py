# Generated by Django 3.0.2 on 2020-08-19 00:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('restapi', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='configuration',
            old_name='post_intervall_image_data',
            new_name='post_intervall_cam_data',
        ),
    ]