from django.db import models


class School(models.Model):
    """
    Represents a school
    """
    school_id = models.IntegerField(primary_key=True)
    data_json = models.TextField()
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=2)

    def __str__(self):
        return self.primary_alias + "(%s)" % self.school_id

    @property
    def primary_alias(self):
        if len(self.alias_set.values()) != 0:
            return self.alias_set.get(is_primary=True).alias
        else:
            return 'Not Available'


class Alias(models.Model):
    """
    One of potentially several names for a school
    """
    institution = models.ForeignKey(School, on_delete=models.CASCADE)
    alias = models.TextField()
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return "%s (alias for %s)" % (self.alias, self.institution)


class BAHRate(models.Model):
    """
    Basic Allowance for Housing (BAH) rates are zipcode-specific.
    """
    zip5 = models.CharField(max_length=5)
    value = models.IntegerField()


class Worksheet(models.Model):
    """
    The saved state of a students comparison worksheet
    """
    guid = models.CharField(max_length=64, primary_key=True)
    saved_data = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)


class Feedback(models.Model):
    """
    User-submitted feedback
    """
    created = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
