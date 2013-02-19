from django.db import models
import uuid

# Create your models here.

class Institution(models.Model):
    """Represents a school"""
    unitid=models.IntegerField(primary_key=True)
    public=models.BooleanField()
    control=models.IntegerField(null=True)
    gradrate=models.FloatField(null=True)
    otheroffcampus=models.FloatField(null=True)
    roombrdoncampus=models.FloatField(null=True)
    roombrdoffcampus=models.FloatField(null=True)
    bookssupplies=models.FloatField(null=True)
    tuitiongradins=models.FloatField(null=True)
    tuitiongradoss=models.FloatField(null=True)
    tuitionundeross=models.FloatField(null=True)
    tuitionunderins=models.FloatField(null=True)
    otheroncampus=models.FloatField(null=True)
    defaultrate=models.FloatField(null=True)
    retentrate=models.FloatField(null=True)
    netpricegeneral=models.FloatField(null=True)
    bah=models.FloatField(null=True)
    zip=models.CharField(max_length=10, null=True)
    level=models.IntegerField()
    four_year=models.BooleanField()
    active=models.BooleanField()
    enrollment=models.IntegerField(null=True)
    
    def __unicode__(self):
        return  self.primary_alias + u"(%s)" % self.unitid
        
    @property
    def primary_alias(self):
        return self.alias_set.get(is_primary=True).alias
    


class Alias(models.Model):
    institution=models.ForeignKey(Institution)
    alias=models.TextField()
    is_primary=models.BooleanField(default=False)
    
    def __unicode__(self):
        return u"%s (alias for %s)"%(self.alias, unicode(self.institution))
        
        
class SavedState(models.Model):
    guid=models.CharField(max_length=64, default=uuid.uuid4, primary_key=True)
    saved_data=models.TextField()
    created=models.DateTimeField(auto_now_add=True)
    updated=models.DateTimeField(auto_now=True)
    
class Feedback(models.Model):
    created=models.DateTimeField(auto_now_add=True)
    message=models.TextField()

