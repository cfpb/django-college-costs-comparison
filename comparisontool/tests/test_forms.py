from unittest import TestCase
from uuid import uuid4

from comparisontool.forms import BAHZipSearchForm, EmailForm, SchoolSearchForm


class BAHZipSearchFormTests(TestCase):
    def test_zip5_required(self):
        form = BAHZipSearchForm({})
        self.assertFalse(form.is_valid())

    def test_valid_zipcode(self):
        form = BAHZipSearchForm({'zip5': '22203'})
        self.assertTrue(form.is_valid())

    def test_invalid_zipcode(self):
        form = BAHZipSearchForm({'zip5': 'foo'})
        self.assertFalse(form.is_valid())


class EmailFormTests(TestCase):
    def test_id_and_email_required(self):
        form = EmailForm({})
        self.assertFalse(form.is_valid())

    def test_valid_fields(self):
        form = EmailForm({'id': uuid4(), 'email': 'foo@bar.com'})
        self.assertTrue(form.is_valid())

    def test_invalid_id_not_uuid4(self):
        form = EmailForm({'id': 'not-uuid', 'email': 'foo@bar.com'})
        self.assertFalse(form.is_valid())

    def test_invalid_email(self):
        form = EmailForm({'id': uuid4(), 'email': 'not-email'})
        self.assertFalse(form.is_valid())


class SchoolSearchFormTests(TestCase):
    def test_q_required(self):
        form = SchoolSearchForm({})
        self.assertFalse(form.is_valid())

    def test_q_provided(self):
        form = SchoolSearchForm({'q': 'my search'})
        self.assertTrue(form.is_valid())
