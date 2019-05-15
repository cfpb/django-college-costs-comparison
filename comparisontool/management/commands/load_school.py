import csv
from glob import glob
from json import dumps

from django.core.management.base import BaseCommand

from comparisontool.models import Alias, School


class Command(BaseCommand):
    help = 'Load the specified CSV into the schools database'

    def add_arguments(self, parser):
        parser.add_argument('path_spec')

    def handle(self, *args, **options):
        path_spec = options['path_spec']
        for path in glob(path_spec):
            self.stdout.write("loading schools:" + path)
            with open(path) as csv_file:
                reader = csv.DictReader(csv_file)
                self.stdout.write("Schools loaded: ", ending="")
                for record in reader:
                    # Last load took 14 minutes, this will add a visual
                    # indicator that something is happening
                    self.stdout.write(record['SCHOOL_ID'], ending=", ")
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
                    school = School(
                        school_id=school_id,
                        city=city,
                        state=state,
                        data_json=data_json
                    )
                    school.save()
                    school.alias_set.all().delete()
                    for (index, alias_str) in enumerate(aliases):
                        alias = Alias(
                            institution=school,
                            alias=alias_str,
                            is_primary=(alias_str == primary_school_name)
                        )
                        alias.save()
                self.stdout.write("... done!")
