# Generated by Django 3.2.10 on 2024-01-22 17:32

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_match_duration_match_lscore_match_wscore_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='id',
            field=models.UUIDField(default=uuid.UUID('f022fef1-a192-469a-952c-4e3a190b6c9a'), editable=False, primary_key=True, serialize=False),
        ),
    ]
