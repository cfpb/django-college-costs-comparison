from django.core.management.base import BaseCommand, CommandError
from comparisontool.models import *
from glob import glob
from json import loads





class Command(BaseCommand):
    args = '<path>'
    help = 'Load the specified JSON\'s into the schools database'

    def handle(self, *args, **options):
        for path_spec in args:
            for path in glob(path_spec):
                print "loading %s" % path
                aliases=[]
                with open(path) as jsonfile:
                    data=loads(jsonfile.read())
                    school=Institution()
                    for key, value in data.iteritems():
                        if not key.startswith('alias'):
                            if value in ('NR', 'EXCLUDE', '-'):
                                value=None
                            if type(value) == str and value.startswith('$'):
                                value=float(value[1:])
                            
                            setattr(school, key, value)
                            
                        else:
                            if value:
                               aliases.append(value)
                        
                    school.save()
                    school.alias_set.all().delete()
                    school_name=Alias(alias=data['institution name'], institution=school, is_primary=True)
                    school_name.save()
                    for school_alias in aliases:
                        alias=Alias(alias=school_alias, institution=school)
                        alias.save()
                    
