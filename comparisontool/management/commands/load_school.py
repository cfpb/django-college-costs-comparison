from glob import glob
from json import dumps
import csv

from django.core.management.base import BaseCommand, CommandError

from comparisontool.models import *


class Command(BaseCommand):
    args = '<path>'
    help = 'Load the specified CSV into the schools database'

    def handle(self, *args, **options):
        for path_spec in args:
            for path in glob(path_spec):
                print "loading %s" % path
                with open(path) as csv_file:
                    reader = csv.DictReader(csv_file)
                    for record in reader:
                        aliases = set()
                        primary_school_name = record.get("SCHOOL")
                        aliases.add(primary_school_name)
                        aliases_packed = record.get('ALIAS')  # pipe delimited
                        if aliases_packed:
                            aliases = aliases.union(aliases_packed.split('|'))

                        school_id = int(record['SCHOOL_ID'])
                        data_json = dumps(record)
                        school = School(school_id=school_id,
                                        data_json=data_json)
                        school.save()
                        school.alias_set.all().delete()
                        for (index, alias_str) in enumerate(aliases):
                            alias = Alias(institution=school,
                                          alias=alias_str,
                                          is_primary=(index == 0))
                            alias.save()
