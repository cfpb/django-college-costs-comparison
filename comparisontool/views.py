# Create your views here.
import json
import uuid

from django.middleware import csrf
from django.core.urlresolvers import reverse
from django.views.generic import View, TemplateView
from django.shortcuts import get_object_or_404, render_to_response
from django.core import serializers
from django.core.mail import send_mail
from django.template import RequestContext
from django.template.loader import get_template
from django.http import HttpResponse

from haystack.query import SearchQuerySet

from models import Alias, School, Worksheet, Feedback
from forms import FeedbackForm


class FeedbackView(TemplateView):
    template_name = "comparisontool/feedback.html"

    @property
    def form(self):
        if self.request.method == 'GET':
            return FeedbackForm()

        elif self.request.method == 'POST':
            return FeedbackForm(self.request.POST)

    def get_context_data(self):
        return dict(form=self.form)

    def post(self, request):
        form = self.form
        if form.is_valid():
            feedback = Feedback(message=form.cleaned_data['message'])
            feedback.save()
            return render_to_response("comparisontool/feedback_thanks.html",
                                      locals(),
                                      context_instance=RequestContext(request))
        else:
            return


class BuildComparisonView(View):

    def get(self, request):
        return render_to_response('comparisontool/worksheet.html',
                                  {'data_js': "0"},
                                  context_instance=RequestContext(request))

    def post(self, request):
        # extract id's and in-state information

        index = 1
        schools = {}
        data = {
            "global": {
            "aaprgmlength": 2,
            "yrincollege": 1,
            "gradprgmlength": 2,
            "familyincome": 48,
            "vet": False,
            "serving": "no",
            "tier": 100,
            "program": request.POST.get('school-program', 'ba')

            },
            "schools": {}
        }

        for school_id in [value for key, value in request.POST.iteritems() if key.endswith('-unitid')] + [100000, 100001]:
            if school_id:
                institution = Institution.objects.get(pk=int(school_id))
                in_state = request.POST.get('school-state-%s' % index, 'in')
                field_dict = serializers.serialize(
                    "python", [institution])[0]['fields']
                field_dict["institutionname"] = unicode(
                    institution.primary_alias)
                field_dict['instate'] = True if in_state == 'in' else False
                field_dict['color'] = False
                field_dict['fouryruniv'] = field_dict['four_year']
                field_dict.update({"color": False,
                                   "oncampus": True,
                                   "tuitionfees": 0,
                                   "roombrd": 0,
                                   "books": 0,
                                   "personal": 0,

                                   "pell": 0,
                                   "scholar": 0,
                                   "tuitionassist": 0,
                                   "gibill": 0,
                                   "perkins": 0,
                                   "staffsubsidized": 0,
                                   "staffunsubsidized": 0,
                                   "gradplus": 0,

                                   "savings": 0,
                                   "family": 0,
                                   "state529plan": 0,
                                   "workstudy": 0,

                                   "privateloan": 0,
                                   "institutionalloan": 0,
                                   "parentplus": 0,
                                   "homeequity": 0,
                                   "order": index - 1})

                csrf.get_token(request)
                data['schools'][str(school_id)] = field_dict
                index += 1

        data_js = json.dumps(data)
        csrf.get_token(request)
        return render_to_response('comparisontool/worksheet.html',
                                  locals(),
                                  context_instance=RequestContext(request))


class SchoolRepresentation(View):

    def get_school(self, school_id):
        return get_object_or_404(School, pk=school_id)

    def get(self, request, school_id, **kwargs):
        school = self.get_school(school_id)
        return HttpResponse(school.data_json, mimetype='application/json')


class EmailLink(View):
    def post(self, request):
        worksheet_guid = request.POST['id']
        recipient = request.POST['email']
        subject = "Your Personalized College Financial Aid Information"
        body_template = get_template('comparisontool/email_body.txt')
        body = body_template.render(RequestContext(dict(guid=worksheet_guid)))

        send_mail(subject, body, 'no-reply@cfpb.gov', [recipient],
                  fail_silently=False)

        return HttpResponse('ok')


class CreateWorksheetView(View):
    def post(self, request):
        worksheet_guid = str(uuid.uuid4())
        worksheet = Worksheet(guid=worksheet_guid,
                              saved_data=json.dumps({'id': worksheet_guid})
                              )
        worksheet.save()
        response = HttpResponse(worksheet.saved_data, status=201)
        return response


# TODO: JSON should only allow a whitelist of keys through.
# TODO: Validator should also enforce field value types
class DataStorageView(View):
    def post(self, request, guid):
        worksheet = Worksheet.objects.get(
            guid=guid,
        )
        if request.body:
            worksheet.saved_data = request.body
            worksheet.save()

        return HttpResponse(worksheet.saved_data)


def school_search_api(request):
    sqs = SearchQuerySet().models(Alias)
    sqs = sqs.autocomplete(autocomplete=request.GET.get('q', ''))
    found_aliases = [(result.text, reverse(
        'school-json', args=[result.school_id])) for result in sqs]
    json_doc = json.dumps(found_aliases)
    return HttpResponse(json_doc, mimetype='application/javascript')
