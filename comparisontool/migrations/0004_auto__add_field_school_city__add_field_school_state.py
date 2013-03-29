# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'School.city'
        db.add_column('comparisontool_school', 'city',
                      self.gf('django.db.models.fields.CharField')(default='Temporary City', max_length=50),
                      keep_default=False)

        # Adding field 'School.state'
        db.add_column('comparisontool_school', 'state',
                      self.gf('django.db.models.fields.CharField')(default='NM', max_length=2),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'School.city'
        db.delete_column('comparisontool_school', 'city')

        # Deleting field 'School.state'
        db.delete_column('comparisontool_school', 'state')


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
            'city': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'data_json': ('django.db.models.fields.TextField', [], {}),
            'school_id': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '2'})
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