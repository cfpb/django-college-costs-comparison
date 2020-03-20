# -*- coding: utf-8 -*-
import django
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Alias',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('alias', models.TextField()),
                ('is_primary', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='BAHRate',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('zip5', models.CharField(max_length=5)),
                ('value', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Feedback',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('message', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='School',
            fields=[
                ('school_id', models.IntegerField(serialize=False, primary_key=True)),
                ('data_json', models.TextField()),
                ('city', models.CharField(max_length=50)),
                ('state', models.CharField(max_length=2)),
            ],
        ),
        migrations.CreateModel(
            name='Worksheet',
            fields=[
                ('guid', models.CharField(max_length=64, serialize=False, primary_key=True)),
                ('saved_data', models.TextField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AddField(
            model_name='alias',
            name='institution',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comparisontool.School'),
        ),
    ]
