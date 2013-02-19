from django.conf.urls.defaults import patterns, include, url
from django.views.decorators.csrf import csrf_exempt 

from comparisontool.views import *

urlpatterns = patterns('comparisontool.views',
    url(r'^$', BuildComparisonView(), name='worksheet'),
    url(r'^email/$', EmailLink(), name='email'),
    url(r'^$', BuildComparisonView(), name='worksheet'),
    url(r'^$', BuildComparisonView(), name='select_school'),
    url(r'^$', BuildComparisonView(), name='payingforcollege'),
    # url(r'^$', IndexView.as_view(), name='payingforcollege'),
    url(r'^feedback/$', csrf_exempt(FeedbackView.as_view()), name='pfc-feedback'),
    url(r'^technote/$', TemplateView.as_view(template_name="comparisontool/technote.html"), name='pfc-technote'),
    url(r'^learnmore/$', TemplateView.as_view(template_name="comparisontool/learn_more.html"), name='pfc-learnmore'),
    url(r'autocomplete.json', AutoCompleteView()),
    url(r'^institutions/(?P<unitid>[^.]+).json$', SchoolRepresentation('json')),
    url(r'^storage/$', DataStorageView())
)
