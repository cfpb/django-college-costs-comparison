import tempfile

from django.core.management import call_command
from django.test import TestCase

from comparisontool.models import School


class LoadSchoolTests(TestCase):
    def test_load_from_csv_creates_school_and_alias_objects(self):
        with tempfile.NamedTemporaryFile() as tf:
            tf.write(
                b'SCHOOL_ID,SCHOOL,ALIAS,CITY,STATE\n'
                b'1,Harvard,Big H|The Harv,Cambridge,MA\n'
                b'2,University of Pennsylvania,UPenn|Penn,Philadelphia,PA\n'
            )
            tf.seek(0)

            call_command('load_school', tf.name)

        self.assertEqual(School.objects.count(), 2)

        harvard = School.objects.first()
        self.assertEqual(harvard.city, 'Cambridge')
        self.assertEqual(harvard.state, 'MA')
        self.assertCountEqual(
            harvard.alias_set.values_list('alias', flat=True),
            ['Harvard', 'Big H', 'The Harv']
        )
