import csv
from glob import glob

from django.core.management.base import BaseCommand

from comparisontool.models import BAHRate


class Command(BaseCommand):
    help = 'Load the specified CSV into the BAH database'

    def add_arguments(self, parser):
        parser.add_argument('path_spec')

    def handle(self, *args, **options):
        path_spec = options['path_spec']
        for path in glob(path_spec):
            self.stdout.write("loading BAH file:" + path)
            with open(path) as csv_file:
                reader = csv.DictReader(csv_file)
                BAHRate.objects.all().delete()
                for record in reader:
                    new_rate = BAHRate(zip5=record['ZIP'], value=record['BAH'])
                    new_rate.save()
