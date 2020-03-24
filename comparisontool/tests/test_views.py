import json
import uuid

import django
from django.core import mail
from django.test import RequestFactory, TestCase
from django.utils.encoding import force_text

from comparisontool.models import BAHRate, School, Worksheet
from comparisontool.views import (
    DataStorageView,
    WorksheetJsonValidationError,
    bah_lookup_api,
    school_search_api,
)

try:
    from django.urls import reverse
except ImportError:
    from django.core.urlresolvers import reverse


class BAHLookupAPITests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_valid_request_returns_rate(self):
        BAHRate.objects.create(zip5='22203', value='1234')
        request = self.factory.get('/?zip5=22203')
        self.assertContains(bah_lookup_api(request), '{"rate": 1234}')

    def test_invalid_request_returns_empty_dict(self):
        request = self.factory.get('/?zip5=foo')
        self.assertContains(bah_lookup_api(request), '{}')


class BuildComparisonViewTests(TestCase):
    def test_get_uses_template(self):
        response = self.client.get(reverse('worksheet'))
        self.assertTemplateUsed(response, 'comparisontool/worksheet.html')


class CreateWorksheetViewTests(TestCase):
    def setUp(self):
        self.path = reverse('create_worksheet')

    def test_get_method_not_allowed(self):
        response = self.client.get(self.path)
        self.assertEqual(response.status_code, 405)

    def test_creates_worksheet_with_new_guid(self):
        response = self.client.post(self.path)
        guid = json.loads(response.content)['id']
        self.assertTrue(Worksheet.objects.filter(guid=guid).exists())


class DataStorageViewTests(TestCase):
    def setUp(self):
        self.client.post(reverse('create_worksheet'))
        self.worksheet = Worksheet.objects.last()

    def path(self, guid):
        return reverse('worksheet', args=(guid,))

    def test_get_method_not_allowed(self):
        response = self.client.get(self.path('1234'))
        self.assertEqual(response.status_code, 405)

    def test_post_to_nonexistent_worksheet_returns_404(self):
        response = self.client.post(self.path('invalid'))
        self.assertEqual(response.status_code, 404)

    def test_post_with_no_body_returns_current_worksheet(self):
        # This test can't use the Django test client because it's not possible
        # to do a POST without a body that way.
        request = RequestFactory().post('/')
        request._body = None

        view = DataStorageView.as_view()
        response = view(request, guid=self.worksheet.guid)
        self.assertJSONEqual(
            force_text(response.content),
            {'id': self.worksheet.guid}
        )

    def test_post_with_invalid_index_raises_error(self):
        with self.assertRaises(WorksheetJsonValidationError):
            self.client.post(
                self.path(self.worksheet.guid),
                data=json.dumps({'foo': 'bar'}),
                content_type='application/json'
            )

    def test_post_with_invalid_id_raises_error(self):
        with self.assertRaises(WorksheetJsonValidationError):
            self.client.post(
                self.path(self.worksheet.guid),
                data=json.dumps({'id': 'not-a-valid-guid'}),
                content_type='application/json'
            )

    def test_post_with_valid_field_adds_to_worksheet(self):
        saved_data_json = {'undergrad': '1000'}
        self.client.post(
            self.path(self.worksheet.guid),
            data=json.dumps({
                'id': self.worksheet.guid,
                '1': saved_data_json,
            }),
            content_type='application/json'
        )

        self.worksheet.refresh_from_db()
        if django.VERSION < (2, 0):
            self.assertEqual(
                json.loads(self.worksheet.saved_data)['1'],
                saved_data_json
            )

    def test_post_with_invalid_field_raises_error(self):
        with self.assertRaises(WorksheetJsonValidationError):
            self.client.post(
                self.path(self.worksheet.guid),
                data=json.dumps({
                    'id': self.worksheet.guid,
                    '1': {
                        'bad-key': 'foo',
                    },
                }),
                content_type='application/json'
            )


class EmailLinkTests(TestCase):
    def setUp(self):
        self.path = reverse('email')

    def test_get_method_not_allowed(self):
        response = self.client.get(self.path)
        self.assertEqual(response.status_code, 405)

    def test_valid_post_sends_email(self):
        guid = uuid.uuid4()
        Worksheet.objects.create(guid=guid)
        self.client.post(
            self.path,
            {'id': guid, 'email': 'foo@bar.com'}
        )

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(
            mail.outbox[0].subject,
            'Your Personalized College Financial Aid Information'
        )

    def test_invalid_post_still_returns_ok(self):
        response = self.client.post(self.path)
        self.assertContains(response, '{"status": "ok"}')


class SchoolRepresentationTests(TestCase):
    def path(self, school_id):
        return reverse('school-json', args=(school_id,))

    def test_nonexistent_school_returns_404(self):
        response = self.client.get(self.path(school_id=123))
        self.assertEqual(response.status_code, 404)

    def test_valid_school_returns_json(self):
        School.objects.create(school_id=123)
        response = self.client.get(self.path(school_id=123))
        self.assertEqual(response['Content-type'], 'application/json')

    def test_valid_school_returns_school_data_json(self):
        school = School.objects.create(
            school_id=123,
            data_json=b'{"foo": "bar"}'
        )

        response = self.client.get(self.path(school_id=123))
        if django.VERSION < (2, 0):
            self.assertEqual(response.content, school.data_json)
        else:
            school_data_json = b'b\'{"foo": "bar"}\''
            self.assertEqual(response.content, school_data_json)


class SchoolSearchAPITests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_valid_request_returns_matching_school(self):
        School.objects.create(
            school_id=123,
            data_json='',
            city='Washington',
            state='DC'
        )

        request = self.factory.get('/?q=s')
        self.assertJSONEqual(
            force_text(school_search_api(request).content),
            [{
                'schoolname': None,
                'id': 123,
                'city': 'Washington',
                'state': 'DC',
                'url': reverse('school-json', args=(123,)),
            }]
        )

    def test_invalid_request_returns_empty_dict(self):
        request = self.factory.get('/')
        self.assertContains(school_search_api(request), '[]')
