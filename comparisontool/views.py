# Create your views here.
import json
import uuid

from django.core.mail import send_mail
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.template.loader import get_template
from django.urls import reverse
from django.views.generic import View

from comparisontool.forms import BAHZipSearchForm, EmailForm, SchoolSearchForm
from comparisontool.models import BAHRate, School, Worksheet
from haystack.query import SearchQuerySet


class WorksheetJsonValidationError(Exception):
    pass


class BuildComparisonView(View):

    def get(self, request):
        return render(request, 'comparisontool/worksheet.html',
                      {'data_js': '0'})


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
            subject = 'Your Personalized College Financial Aid Information'
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
        data_starter = {'id': worksheet_guid}
        worksheet = Worksheet(guid=worksheet_guid,
                              saved_data=json.dumps(data_starter)
                              )
        worksheet.save()
        response = JsonResponse(data_starter, status=201)
        return response


class DataStorageView(View):
    def validate_json(self, worksheet_raw):
        data = json.loads(worksheet_raw)
        allowed_keys = ['id', '1', '2', '3']
        allowed_fields = ['netprice75k', 'gradrate', 'netprice', 'roombrd',
                          'state529plan', 'roombrdoncampus',
                          'institutionalloangrad', 'avgstuloandebtrank',
                          'personal', 'program', 'staffsubsidizedwithfee',
                          'borrowingtotal', 'defaultrate', 'tuitionfees',
                          'gibilltf', 'offeraa', 'school', 'scholar',
                          'parentpluswithfee', 'undergrad',
                          'staffunsubsidizeddep_max',
                          'institutionalloanrate', 'bah', 'tuitionassist',
                          'books', 'otherexpenses', 'gibillinstatetuition',
                          'offergrad', 'gradpluswithfee', 'privateloangrad',
                          'overborrowing', 'badalias', 'perkins_max',
                          'yrincollege', 'avgstuloandebt', 'state',
                          'instate', 'parentplus', 'loandebt1yr',
                          'loanlifetime', 'netpriceok', 'tuitiongradins',
                          'tuitiongradindis', 'transportation',
                          'moneyforcollege', 'grantstotal',
                          'otheroffcampus', 'tfinstate',
                          'staffunsubsidizedindep_max', 'institutionalloan',
                          'avgmonthlypay', 'gradplus', 'privateloanrate',
                          'netpricegeneral', 'institutionalloan_max',
                          'tuitionunderindis', 'family', 'offerba',
                          'perkinsgrad', 'perkins', 'privateloan',
                          'workstudy', 'gradplusgrad', 'city',
                          'loanmonthly', 'zip', 'staffunsubsidized_max',
                          'staffsubsidizedgrad', 'savingstotal',
                          'otheroncampus', 'firstyrcostattend',
                          'federaltotal', 'school_id', 'pell_max',
                          'tuitiongradoss', 'staffsubsidized_max', 'gap',
                          'salaryneeded', 'homeequity', 'gradplus_max',
                          'tuitionunderins', 'homeequitygrad',
                          'netprice48k', 'pell', 'salarymonthly',
                          'unsubsidizedrate', 'control',
                          'staffunsubsidizedgrad', 'parentplusgrad',
                          'indicatorgroup', 'gradraterank', 'riskofdefault',
                          'privatetotal', 'totalgrantsandsavings', 'alias',
                          'savings', 'totaldebtgrad', 'remainingcost',
                          'online', 'roombrdoffcampus',
                          'salaryexpected25yrs', 'loanmonthlyparent',
                          'staffsubsidized', 'privateloan_max',
                          'staffunsubsidizedwithfee', 'staffunsubsidized',
                          'tuitionassist_max', 'tuitionundeross', 'gibill',
                          'gibillla', 'retentrate', 'otherwfamily',
                          'oncampusavail', 'netprice110k', 'prgmlength',
                          'firstyrnetcost', 'gibillbs', 'repaymentterm',
                          'totaloutofpocket', 'kbyoss', 'origin',
                          'netprice3ok']
        keys = list(data.keys())
        for index in keys:
            if index not in allowed_keys:
                raise WorksheetJsonValidationError(f"Illegal json key {index}")
            if index == 'id':
                _id = data[index]
                try:
                    # if the index is 'id', the value must be a valid UUID
                    uuid.UUID(_id)
                except ValueError:
                    raise WorksheetJsonValidationError(
                        f'GUID {_id} is not valid')
            else:
                for fieldname in data[index].keys():
                    if fieldname not in allowed_fields:
                        raise WorksheetJsonValidationError(
                            f'Invalid field: {fieldname}'
                        )

    def post(self, request, guid):
        worksheet = get_object_or_404(Worksheet, guid=guid)

        if request.body:
            self.validate_json(request.body.decode('utf-8'))
            worksheet.saved_data = request.body.decode('utf-8')
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
