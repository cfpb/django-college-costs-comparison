from django.test import TestCase

from comparisontool.models import Alias, School


class AliasTests(TestCase):
    def test_unicode(self):
        school = School.objects.create(
            school_id=1,
            data_json='',
            city='Washington',
            state='DC'
        )
        alias = Alias.objects.create(
            institution=school,
            alias='foo',
            is_primary=True
        )

        self.assertEqual(str(alias), 'foo (alias for foo(1))')


class SchoolTests(TestCase):
    def test_unicode_no_alias(self):
        school = School.objects.create(
            school_id=1,
            data_json='',
            city='Washington',
            state='DC'
        )

        self.assertEqual(str(school), 'Not Available(1)')

    def test_unicode_alias(self):
        school = School.objects.create(
            school_id=1,
            data_json='',
            city='Washington',
            state='DC'
        )
        Alias.objects.create(
            institution=school,
            alias='foo',
            is_primary=True
        )

        self.assertEqual(str(school), 'foo(1)')
