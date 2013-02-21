from django.db import models


class School(models.Model):
    """Represents a school"""
    school_id = models.IntegerField(primary_key=True)
    data_json = models.TextField()

    def __unicode__(self):
        return self.primary_alias + u"(%s)" % self.school_id

    @property
    def primary_alias(self):
        return self.alias_set.get(is_primary=True).alias


class Alias(models.Model):
    institution = models.ForeignKey(School)
    alias = models.TextField()
    is_primary = models.BooleanField(default=False)

    def __unicode__(self):
        return u"%s (alias for %s)" % (self.alias, unicode(self.institution))


class Worksheet(models.Model):
    guid = models.CharField(max_length=64, primary_key=True)
    saved_data = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)


class Feedback(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
