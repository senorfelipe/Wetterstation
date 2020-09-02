# Generated by Django 3.0.2 on 2020-08-27 00:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('restapi', '0003_auto_20200819_0050'),
    ]

    operations = [
        migrations.CreateModel(
            name='Log',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('log_level', models.CharField(choices=[('DEBUG', 'Debug'), ('INFO', 'Information'), ('WARN', 'Warning'), ('ERROR', 'Error')], max_length=8)),
                ('time', models.DateTimeField(auto_now_add=True)),
                ('message', models.CharField(max_length=512)),
            ],
        ),
    ]