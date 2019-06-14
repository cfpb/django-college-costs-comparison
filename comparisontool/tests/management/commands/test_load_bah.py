import tempfile

from django.core.management import call_command
from django.test import TestCase

from comparisontool.models import BAHRate


class LoadBAHTests(TestCase):
    def test_load_from_csv_creates_bahrate_objects(self):
        with tempfile.NamedTemporaryFile() as tf:
            tf.write(b'ZIP,BAH\n22203,123\n22205,0\n22207,456\n')
            tf.seek(0)

            call_command('load_bah', tf.name)

        self.assertEqual(BAHRate.objects.count(), 3)

        first = BAHRate.objects.first()
        self.assertEqual((first.zip5, first.value), ('22203', 123))

        last = BAHRate.objects.last()
        self.assertEqual((last.zip5, last.value), ('22207', 456))
