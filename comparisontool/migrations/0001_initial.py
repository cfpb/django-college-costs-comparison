# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Institution'
        db.create_table('comparisontool_institution', (
            ('unitid', self.gf('django.db.models.fields.IntegerField')(primary_key=True)),
            ('public', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('control', self.gf('django.db.models.fields.IntegerField')(null=True)),
            ('gradrate', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('otheroffcampus', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('roombrdoncampus', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('roombrdoffcampus', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('bookssupplies', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('tuitiongradins', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('tuitiongradoss', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('tuitionundeross', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('tuitionunderins', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('otheroncampus', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('defaultrate', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('retentrate', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('netpricegeneral', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('bah', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('zip', self.gf('django.db.models.fields.CharField')(max_length=10, null=True)),
            ('level', self.gf('django.db.models.fields.IntegerField')()),
            ('four_year', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('enrollment', self.gf('django.db.models.fields.IntegerField')(null=True)),
        ))
        db.send_create_signal('comparisontool', ['Institution'])

        # Adding model 'Alias'
        db.create_table('comparisontool_alias', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('institution', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['comparisontool.Institution'])),
            ('alias', self.gf('django.db.models.fields.TextField')()),
            ('is_primary', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal('comparisontool', ['Alias'])

        # Adding model 'SavedState'
        db.create_table('comparisontool_savedstate', (
            ('guid', self.gf('django.db.models.fields.CharField')(max_length=64, primary_key=True)),
            ('saved_data', self.gf('django.db.models.fields.TextField')()),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
        ))
        db.send_create_signal('comparisontool', ['SavedState'])

        # Adding model 'Feedback'
        db.create_table('comparisontool_feedback', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('message', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal('comparisontool', ['Feedback'])


    def backwards(self, orm):
        # Deleting model 'Institution'
        db.delete_table('comparisontool_institution')

        # Deleting model 'Alias'
        db.delete_table('comparisontool_alias')

        # Deleting model 'SavedState'
        db.delete_table('comparisontool_savedstate')

        # Deleting model 'Feedback'
        db.delete_table('comparisontool_feedback')


    models = {
        'comparisontool.alias': {
            'Meta': {'object_name': 'Alias'},
            'alias': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'institution': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['comparisontool.Institution']"}),
            'is_primary': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'comparisontool.feedback': {
            'Meta': {'object_name': 'Feedback'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.TextField', [], {})
        },
        'comparisontool.institution': {
            'Meta': {'object_name': 'Institution'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'bah': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'bookssupplies': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'control': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'defaultrate': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'enrollment': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'four_year': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'gradrate': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'level': ('django.db.models.fields.IntegerField', [], {}),
            'netpricegeneral': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'otheroffcampus': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'otheroncampus': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'public': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'retentrate': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'roombrdoffcampus': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'roombrdoncampus': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'tuitiongradins': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'tuitiongradoss': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'tuitionunderins': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'tuitionundeross': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'unitid': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True'}),
            'zip': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True'})
        },
        'comparisontool.savedstate': {
            'Meta': {'object_name': 'SavedState'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'guid': ('django.db.models.fields.CharField', [], {'max_length': '64', 'primary_key': 'True'}),
            'saved_data': ('django.db.models.fields.TextField', [], {}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['comparisontool']
