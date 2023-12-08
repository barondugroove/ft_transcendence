# Generated by Django 4.2.6 on 2023-11-27 14:37

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_user_lostmatchescount_user_winmatchescount'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='friends',
            field=models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='FriendRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fromUser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sentRequests', to=settings.AUTH_USER_MODEL)),
                ('toUser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='receivedRequests', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
