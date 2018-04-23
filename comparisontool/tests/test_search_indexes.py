from django.test import TestCase

from comparisontool.models import Alias, School
from comparisontool.search_indexes import SchoolIndex


class SchoolIndexTests(TestCase):
    def test_no_schools_empty_index(self):
        index = SchoolIndex()
        self.assertFalse(index.index_queryset().exists())

    def test_school_added_to_index_queryset_contains_it(self):
        School.objects.create(
            school_id=1,
            data_json='',
            city='Washington',
            state='DC'
        )

        index = SchoolIndex()
        self.assertEqual(index.index_queryset().count(), 1)

    def test_school_autocomplete_based_on_aliases(self):
        school = School.objects.create(
            school_id=1,
            data_json='',
            city='Washington',
            state='DC'
        )

        Alias.objects.create(institution=school, alias='foo')
        Alias.objects.create(institution=school, alias='bar')

        index = SchoolIndex()
        self.assertEqual(index.prepare_autocomplete(school), 'foo bar')
