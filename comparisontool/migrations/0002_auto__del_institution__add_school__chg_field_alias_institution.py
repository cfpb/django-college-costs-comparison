# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'Institution'
        db.delete_table('comparisontool_institution')

        # Adding model 'School'
        db.create_table('comparisontool_school', (
            ('school_id', self.gf('django.db.models.fields.IntegerField')(primary_key=True)),
            ('data_json', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal('comparisontool', ['School'])


        # Changing field 'Alias.institution'
        db.alter_column('comparisontool_alias', 'institution_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['comparisontool.School']))

    def backwards(self, orm):
        # Adding model 'Institution'
        db.create_table('comparisontool_institution', (
            ('control', self.gf('django.db.models.fields.IntegerField')(null=True)),
            ('gradrate', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('retentrate', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('roombrdoncampus', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('zip', self.gf('django.db.models.fields.CharField')(max_length=10, null=True)),
            ('otheroncampus', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('roombrdoffcampus', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('bookssupplies', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('public', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('tuitiongradins', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('tuitiongradoss', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('tuitionundeross', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('defaultrate', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('unitid', self.gf('django.db.models.fields.IntegerField')(primary_key=True)),
            ('otheroffcampus', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('four_year', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('level', self.gf('django.db.models.fields.IntegerField')()),
            ('enrollment', self.gf('django.db.models.fields.IntegerField')(null=True)),
            ('tuitionunderins', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('netpricegeneral', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('bah', self.gf('django.db.models.fields.FloatField')(null=True)),
        ))
        db.send_create_signal('comparisontool', ['Institution'])

        # Deleting model 'School'
        db.delete_table('comparisontool_school')


        # Changing field 'Alias.institution'
        db.alter_column('comparisontool_alias', 'institution_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['comparisontool.Institution']))

    models = {
        'comparisontool.alias': {
            'Meta': {'object_name': 'Alias'},
            'alias': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'institution': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['comparisontool.School']"}),
            'is_primary': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'comparisontool.feedback': {
            'Meta': {'object_name': 'Feedback'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.TextField', [], {})
        },
        'comparisontool.savedstate': {
            'Meta': {'object_name': 'SavedState'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'guid': ('django.db.models.fields.CharField', [], {'default': "UUID('baca72d4-a31f-4dd3-9890-27331d9f188d')", 'max_length': '64', 'primary_key': 'True'}),
            'saved_data': ('django.db.models.fields.TextField', [], {}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        'comparisontool.school': {
            'Meta': {'object_name': 'School'},
            'data_json': ('django.db.models.fields.TextField', [], {}),
            'school_id': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True'})
        }
    }

    complete_apps = ['comparisontool']