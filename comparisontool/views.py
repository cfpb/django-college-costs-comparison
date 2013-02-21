# Create your views here.
import json, logging
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.middleware import csrf
from django.core.urlresolvers import reverse
from django.views.generic import TemplateView
from django.shortcuts import get_object_or_404, render_to_response, redirect
from django.core import serializers
from django.core.mail import send_mail

from django.template import RequestContext, loader


from django.http import HttpResponse
from haystack.query import SearchQuerySet

from models import Alias, School, Worksheet, Feedback
from forms import FeedbackForm


def select_schools(request):
    return redirect('payingforcollege')



class IndexView(TemplateView):
    template_name = "comparisontool/index.html"
  
  
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
        form=self.form
        if form.is_valid():
            feedback=Feedback(message=form.cleaned_data['message'])
            feedback.save()
            return render_to_response("comparisontool/feedback_thanks.html",
                                      locals(),
                                      context_instance=RequestContext(request))
        else:
            return
            

class MethodDispatcher(object):
    def __call__(self, request, *args, **kwargs):
        _method=request.method.lower()
        if request.is_ajax():
            _method= 'xhr_'+_method
        if hasattr(self,_method ):
            return getattr(self, _method)(request, *args, **kwargs)
        else:
            response = HttpResponse('Method not allowed: %s' % _method)
            response.status_code = 405
            return response
            
    def get_context_data(self, **kwargs):
            csrf.get_token(self.request)
            return {'name': 'reinout'}
            
            
class BuildComparisonView(MethodDispatcher):

    def get(self, request):
        guid=request.GET.get('restore')
        if guid:
           data = SavedState.objects.get(guid=guid).saved_data
           csrf.get_token(request)
           return render_to_response('comparisontool/worksheet.html',
                                    {'data_js': data},
                                    context_instance=RequestContext(request))
        else:
           return render_to_response('comparisontool/worksheet.html',
                                    {'data_js': "0"},
                                    context_instance=RequestContext(request))

    def post(self, request):
        #extract id's and in-state information
        
        index =1
        schools={}
        data={
        	"global": {
        		"aaprgmlength": 	2,			
        		"yrincollege": 		1,			
        		"gradprgmlength": 	2,			
        		"familyincome": 	48,			
        		"vet": 				False, 		
        		"serving": 			"no", 		
        		"tier": 			100	,
        		"program":          request.POST.get('school-program', 'ba')
                			
        	},
            "schools":{}
            }
        
        
        for school_id in [value for key, value in request.POST.iteritems() if key.endswith('-unitid')] + [100000, 100001]:
            if school_id:
                institution=Institution.objects.get(pk=int(school_id))
                in_state= request.POST.get('school-state-%s' % index, 'in')
                field_dict=serializers.serialize("python", [institution])[0]['fields']
                field_dict["institutionname"]=unicode(institution.primary_alias)
                field_dict['instate']= True if in_state == 'in' else False
                field_dict['color']= False
                field_dict['fouryruniv']= field_dict['four_year']
                field_dict.update({"color":				False, 		
    			"oncampus": 			True,	
    			"tuitionfees": 			0,		
    			"roombrd": 				0, 		
    			"books": 				0, 		
    			"personal": 			0, 		

    			"pell": 				0, 		
    			"scholar": 				0, 		
    			"tuitionassist": 		0, 		
    			"gibill": 				0, 		
    			"perkins": 				0, 		
    			"staffsubsidized": 		0, 		
    			"staffunsubsidized": 	0, 		
    			"gradplus": 			0, 		

    			"savings": 				0, 		
    			"family": 				0, 		
    			"state529plan": 		0, 		
    			"workstudy": 			0, 		

    			"privateloan": 			0, 		
    			"institutionalloan": 	0, 		
    			"parentplus": 			0, 		
    			"homeequity": 			0,
    			"order": index-1})
                
                
                csrf.get_token(request)
                data['schools'][str(school_id)]= field_dict
                index +=1
        
        
        
        
        
        #import pdb;pdb.set_trace()        
        data_js=json.dumps(data)       
        csrf.get_token(request)        
        return render_to_response('comparisontool/worksheet.html',
                                  locals(),
                                  context_instance=RequestContext(request))
                
#TODO: CLASS BASED VIEWS LOL
class SchoolRepresentation(MethodDispatcher):
    
    def __init__(self, format='html', *args, **kwargs):
        self.format=format
        super(SchoolRepresentation, self).__init__()
        
    

    def get_school(self, school_id):
        return get_object_or_404(School, pk=school_id)
        
    def get(self, request, school_id, **kwargs):
        school = self.get_school(school_id)
        return HttpResponse(school.data_json, mimetype='application/json')
        

#TODO: get the email copy out of the view!
class EmailLink(MethodDispatcher):
    def xhr_post(self, request):
        logging.warning("email triggered with %s" % request.POST)
        subject="Your Personalized College Financial Aid Information"
        body= """Thanks for using our tools to compare financial aid and college costs! Here's your personalized college financial aid information

%s

Share
Facebook: http://on.fb.me/HuP5YX
Twitter: http://bit.ly/HvWxyQ

Tell us what you think
This is just the first step in the process of developing a tool that helps students and parents make smarter choices. Your feedback is an important part of this process, and we know that we have more work to do to develop the most useful product. We'll read all of the feedback - weigh in: http://www. consumerfinance.gov/paying-for-college/compare-financial-aid-and-college-cost/feedback/

Thanks!

The CFPB Web Team""" % request.POST['url']
        send_mail(subject, body, 'no-reply@cfpb.gov',[request.POST['email']], fail_silently=False)
        
        
        
        return HttpResponse('ok')

        
class DataStorageView(MethodDispatcher):
    def xhr_post(self, request):
        data=SavedState(saved_data=request.raw_post_data)
        data.save()
        logging.warning(data.guid)
        return HttpResponse(json.dumps({'id': unicode(data.guid)}))
        
    def get(self, request):
        guid=request.GET.get('id')
        data=SavedState.objects.get(guid=guid)
        return HttpResponse(data.saved_data, mimetype='application/json')
        

def school_search_api(request):
    sqs = SearchQuerySet().models(Alias)
    sqs = sqs.autocomplete(autocomplete=request.GET.get('q', ''))
    found_aliases = [(result.text, reverse('school-json', args=[result.school_id])) for result in sqs]
    json_doc = json.dumps(found_aliases)
    return HttpResponse(json_doc, mimetype='application/json')
