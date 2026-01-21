# Generated migration for Notification model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('realestate', '0005_add_buyer_search_model'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('NEW_CHAT', 'New Chat Message'), ('NEW_LEAD', 'New Lead'), ('PROPERTY_INQUIRY', 'Property Inquiry'), ('AGENT_RESPONSE_DELAY', 'Agent Response Delay')], max_length=30)),
                ('priority', models.CharField(choices=[('NORMAL', 'Normal'), ('HIGH', 'High')], default='NORMAL', max_length=10)),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('action_url', models.CharField(blank=True, max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('contact_message', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='realestate.message')),
                ('conversation', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='realestate.conversation')),
                ('property', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='realestate.property')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
