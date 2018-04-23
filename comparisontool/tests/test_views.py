import json
import uuid

from django.core import mail
from django.core.management import call_command
from django.core.urlresolvers import reverse
from django.http import Http404
from django.test import RequestFactory, TestCase

from comparisontool.models import Alias, BAHRate, School, Worksheet
from comparisontool.views import (
    DataStorageView, WorksheetJsonValidationError, bah_lookup_api,
    school_search_api
)


class BAHLookupAPITests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_valid_request_returns_rate(self):
        rate = BAHRate.objects.create(zip5='22203', value='1234')
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

    def test_post_with_no_body_returns_current_worksheet(self):
        # This test can't use the Django test client because it's not possible
        # to do a POST without a body that way.
        request = RequestFactory().post('/')
        request._body = None

        view = DataStorageView.as_view()
        response = view(request, guid=self.worksheet.guid)
        self.assertEqual(
            json.loads(response.content),
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
        self.client.post(
            self.path(self.worksheet.guid),
            data=json.dumps({
                'id': self.worksheet.guid,
                '1': {
                    'undergrad': '1000',
                },
            }),
            content_type='application/json'
        )

        self.worksheet.refresh_from_db()
        self.assertEqual(
            json.loads(self.worksheet.saved_data)['1'],
            {'undergrad': '1000'}
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
        worksheet = Worksheet.objects.create(guid=guid)
        response = self.client.post(
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


class FeedbackViewTests(TestCase):
    def setUp(self):
        self.path = reverse('pfc-feedback')

    def test_get_uses_template(self):
        response = self.client.get(self.path)
        self.assertTemplateUsed(response, 'comparisontool/feedback.html')

    def test_valid_post_returns_200(self):
        response = self.client.post(self.path, {'message': 'Feedback'})
        self.assertEqual(response.status_code, 200)

    def test_valid_post_uses_template(self):
        response = self.client.post(self.path, {'message': 'Feedback'})
        self.assertTemplateUsed(
            response,
            'comparisontool/feedback_thanks.html'
        )

    def test_invalid_post_returns_400(self):
        response = self.client.post(self.path, {})
        self.assertEqual(response.status_code, 400)


class SchoolRepresentationTests(TestCase):
    def path(self, school_id):
        return reverse('school-json', args=(school_id,))

    def test_nonexistent_school_returns_404(self):
        response = self.client.get(self.path(school_id=123))
        self.assertEqual(response.status_code, 404)

    def test_valid_school_returns_json(self):
        school = School.objects.create(school_id=123)
        response = self.client.get(self.path(school_id=123))
        self.assertEqual(response['Content-type'], 'application/json')

    def test_valid_school_returns_school_data_json(self):
        school = School.objects.create(
            school_id=123,
            data_json='{"foo": "bar"}'
        )

        response = self.client.get(self.path(school_id=123))
        self.assertEqual(response.content, school.data_json)


class SchoolSearchAPITests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_valid_request_returns_matching_school(self):
        school = School.objects.create(
            school_id=123,
            data_json='',
            city='Washington',
            state='DC'
        )

        request = self.factory.get('/?q=s')
        self.assertEqual(
            school_search_api(request).content,
            json.dumps([{
                'schoolname': None,
                'id': 123,
                'city': 'Washington',
                'state': 'DC',
                'url': reverse('school-json', args=(123,)),
            }])
        )

    def test_invalid_request_returns_empty_dict(self):
        request = self.factory.get('/')
        self.assertContains(school_search_api(request), '[]')
