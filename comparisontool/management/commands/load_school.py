from __future__ import print_function

from glob import glob
from json import dumps
import csv

from django.core.management.base import BaseCommand, CommandError

from comparisontool.models import *


class Command(BaseCommand):
    help = 'Load the specified CSV into the schools database'

    def add_arguments(self, parser):
        parser.add_argument('path_spec')

    def handle(self, *args, **options):
        path_spec = options['path_spec']
        for path in glob(path_spec):
            print("loading schools:", path)
            with open(path) as csv_file:
                reader = csv.DictReader(csv_file)
                print("Schools loaded: ", end="")
                for record in reader:
                    # Last load took 14 minutes, this will add a visual indicator
                    #  that something is happening
                    print(record['SCHOOL_ID'], end=", ")
                    aliases = set()
                    primary_school_name = record.get("SCHOOL")
                    aliases.add(primary_school_name)
                    aliases_packed = record.get('ALIAS')  # pipe delimited
                    if aliases_packed:
                        aliases = aliases.union(aliases_packed.split('|'))
                    city = record.get('CITY')
                    state = record.get('STATE')
                    school_id = int(record['SCHOOL_ID'])
                    data_json = dumps(record)
                    school = School(school_id=school_id,
                            city=city,
                            state=state,
                            data_json=data_json)
                    school.save()
                    school.alias_set.all().delete()
                    for (index, alias_str) in enumerate(aliases):
                        alias = Alias(institution=school,
                                alias=alias_str,
                                is_primary=(alias_str == primary_school_name))
                        alias.save()
                print("... done!")
