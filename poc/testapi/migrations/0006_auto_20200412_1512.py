# Generated by Django 3.0.2 on 2020-04-12 13:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('testapi', '0005_auto_20200412_1443'),
    ]

    operations = [
        migrations.AlterField(
            model_name='imagereferences',
            name='image',
            field=models.ImageField(upload_to='images'),
        ),
    ]