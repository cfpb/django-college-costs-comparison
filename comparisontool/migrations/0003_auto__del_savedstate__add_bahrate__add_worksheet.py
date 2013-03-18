# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'SavedState'
        db.delete_table('comparisontool_savedstate')

        # Adding model 'BAHRate'
        db.create_table('comparisontool_bahrate', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('zip5', self.gf('django.db.models.fields.CharField')(max_length=5)),
            ('value', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal('comparisontool', ['BAHRate'])

        # Adding model 'Worksheet'
        db.create_table('comparisontool_worksheet', (
            ('guid', self.gf('django.db.models.fields.CharField')(max_length=64, primary_key=True)),
            ('saved_data', self.gf('django.db.models.fields.TextField')()),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
        ))
        db.send_create_signal('comparisontool', ['Worksheet'])


    def backwards(self, orm):
        # Adding model 'SavedState'
        db.create_table('comparisontool_savedstate', (
            ('guid', self.gf('django.db.models.fields.CharField')(default='dummy', max_length=64, primary_key=True)),
            ('updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('saved_data', self.gf('django.db.models.fields.TextField')()),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal('comparisontool', ['SavedState'])

        # Deleting model 'BAHRate'
        db.delete_table('comparisontool_bahrate')

        # Deleting model 'Worksheet'
        db.delete_table('comparisontool_worksheet')


    models = {
        'comparisontool.alias': {
            'Meta': {'object_name': 'Alias'},
            'alias': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'institution': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['comparisontool.School']"}),
            'is_primary': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'comparisontool.bahrate': {
            'Meta': {'object_name': 'BAHRate'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'value': ('django.db.models.fields.IntegerField', [], {}),
            'zip5': ('django.db.models.fields.CharField', [], {'max_length': '5'})
        },
        'comparisontool.feedback': {
            'Meta': {'object_name': 'Feedback'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.TextField', [], {})
        },
        'comparisontool.school': {
            'Meta': {'object_name': 'School'},
            'data_json': ('django.db.models.fields.TextField', [], {}),
            'school_id': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True'})
        },
        'comparisontool.worksheet': {
            'Meta': {'object_name': 'Worksheet'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'guid': ('django.db.models.fields.CharField', [], {'max_length': '64', 'primary_key': 'True'}),
            'saved_data': ('django.db.models.fields.TextField', [], {}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['comparisontool']