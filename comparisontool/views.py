# Create your views here.
import json
import uuid

from django.core.urlresolvers import reverse
from django.views.generic import View, TemplateView
from django.shortcuts import get_object_or_404, render
from django.core.mail import send_mail
from django.template import RequestContext
from django.template.loader import get_template
from django.http import HttpResponse, HttpResponseBadRequest

from haystack.query import SearchQuerySet

from models import School, Worksheet, Feedback, BAHRate
from forms import (FeedbackForm, EmailForm, SchoolSearchForm,
                   BAHZipSearchForm)


class WorksheetJsonValidationError(Exception):
    pass


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
            return render(request, "comparisontool/feedback_thanks.html")

        else:
            return HttpResponseBadRequest('bad request')


class BuildComparisonView(View):

    def get(self, request):
        return render(request, 'comparisontool/worksheet.html',
                      {'data_js': "0"})


class SchoolRepresentation(View):

    def get_school(self, school_id):
        return get_object_or_404(School, pk=school_id)

    def get(self, request, school_id, **kwargs):
        school = self.get_school(school_id)
        return HttpResponse(school.data_json, content_type='application/json')


class EmailLink(View):
    def post(self, request):
        form = EmailForm(request.POST)
        if form.is_valid():

            worksheet_guid = form.cleaned_data['id']
            worksheet = Worksheet.objects.get(guid=worksheet_guid)
            recipient = form.cleaned_data['email']
            subject = "Your Personalized College Financial Aid Information"
            body_template = get_template('comparisontool/email_body.txt')
            context = {'guid': worksheet.guid}
            body = body_template.render(context, request)

            send_mail(subject, body, 'no-reply-cfgov@cfpb.gov', [recipient],
                      fail_silently=False)

        document = {'status': 'ok'}
        return HttpResponse(json.dumps(document),
                            content_type='application/javascript')


class CreateWorksheetView(View):
    def post(self, request):
        worksheet_guid = str(uuid.uuid4())
        worksheet = Worksheet(guid=worksheet_guid,
                              saved_data=json.dumps({'id': worksheet_guid})
                              )
        worksheet.save()
        response = HttpResponse(worksheet.saved_data, status=201)
        return response


class DataStorageView(View):
    def validate_json(self, worksheet_raw):
        data = json.loads(worksheet_raw)
        allowed_keys = ['id', '1', '2', '3']
        allowed_fields = [u'netprice75k', u'gradrate', u'netprice', u'roombrd',
                          u'state529plan', u'roombrdoncampus',
                          u'institutionalloangrad', u'avgstuloandebtrank',
                          u'personal', u'program', u'staffsubsidizedwithfee',
                          u'borrowingtotal', u'defaultrate', u'tuitionfees',
                          u'gibilltf', u'offeraa', u'school', u'scholar',
                          u'parentpluswithfee', u'undergrad',
                          u'staffunsubsidizeddep_max',
                          u'institutionalloanrate', u'bah', u'tuitionassist',
                          u'books', u'otherexpenses', u'gibillinstatetuition',
                          u'offergrad', u'gradpluswithfee', u'privateloangrad',
                          u'overborrowing', u'badalias', u'perkins_max',
                          u'yrincollege', u'avgstuloandebt', u'state',
                          u'instate', u'parentplus', u'loandebt1yr',
                          u'loanlifetime', u'netpriceok', u'tuitiongradins',
                          u'tuitiongradindis', u'transportation',
                          u'moneyforcollege', u'grantstotal',
                          u'otheroffcampus', u'tfinstate',
                          u'staffunsubsidizedindep_max', u'institutionalloan',
                          u'avgmonthlypay', u'gradplus', u'privateloanrate',
                          u'netpricegeneral', u'institutionalloan_max',
                          u'tuitionunderindis', u'family', u'offerba',
                          u'perkinsgrad', u'perkins', u'privateloan',
                          u'workstudy', u'gradplusgrad', u'city',
                          u'loanmonthly', u'zip', u'staffunsubsidized_max',
                          u'staffsubsidizedgrad', u'savingstotal',
                          u'otheroncampus', u'firstyrcostattend',
                          u'federaltotal', u'school_id', u'pell_max',
                          u'tuitiongradoss', u'staffsubsidized_max', u'gap',
                          u'salaryneeded', u'homeequity', u'gradplus_max',
                          u'tuitionunderins', u'homeequitygrad',
                          u'netprice48k', u'pell', u'salarymonthly',
                          u'unsubsidizedrate', u'control',
                          u'staffunsubsidizedgrad', u'parentplusgrad',
                          u'indicatorgroup', u'gradraterank', u'riskofdefault',
                          u'privatetotal', u'totalgrantsandsavings', u'alias',
                          u'savings', u'totaldebtgrad', u'remainingcost',
                          u'online', u'roombrdoffcampus',
                          u'salaryexpected25yrs', u'loanmonthlyparent',
                          u'staffsubsidized', u'privateloan_max',
                          u'staffunsubsidizedwithfee', u'staffunsubsidized',
                          u'tuitionassist_max', u'tuitionundeross', u'gibill',
                          u'gibillla', u'retentrate', u'otherwfamily',
                          u'oncampusavail', u'netprice110k', u'prgmlength',
                          u'firstyrnetcost', u'gibillbs', u'repaymentterm',
                          u'totaloutofpocket', u'kbyoss', u'origin',
                          u'netprice3ok']
        for index in data.keys():
            if index not in allowed_keys:
                raise WorksheetJsonValidationError
            if index == 'id':
                try:
                    # if the index is 'id', value must be a
                    # valid UUID
                    uuid.UUID(data[index])
                except ValueError:
                    raise WorksheetJsonValidationError

            else:
                for fieldname in data[index].keys():
                    if fieldname not in allowed_fields:
                        raise WorksheetJsonValidationError("field: %s"
                                                           % fieldname)

    def post(self, request, guid):
        worksheet = Worksheet.objects.get(
            guid=guid,
        )
        if request.body:
            self.validate_json(request.body)
            worksheet.saved_data = request.body
            worksheet.save()
        else:
            self.validate_json(worksheet.saved_data)

        return HttpResponse(worksheet.saved_data)


def bah_lookup_api(request):
    form = BAHZipSearchForm(request.GET)
    if form.is_valid():
        zip5 = form.cleaned_data['zip5'][:5]
        rate = BAHRate.objects.filter(zip5=zip5).get()
        document = {'rate': rate.value}
        document_as_json = json.dumps(document)
    else:
        document_as_json = json.dumps({})
    return HttpResponse(document_as_json,
                        content_type='application/javascript')


def school_search_api(request):
    form = SchoolSearchForm(request.GET)
    if form.is_valid():
        sqs = SearchQuerySet().models(School)
        sqs = sqs.autocomplete(autocomplete=form.cleaned_data['q'])

        document = [{'schoolname': school.text,
                     'id': school.school_id,
                     'city': school.city,
                     'state': school.state,
                     'url': reverse('school-json',
                                    args=[school.school_id])}
                    for school in sqs]
    else:
        document = []

    json_doc = json.dumps(document)

    return HttpResponse(json_doc, content_type='application/json')
