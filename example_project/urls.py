from django.conf.urls.defaults import patterns, include, url
from django.views.decorators.csrf import csrf_exempt 

from comparisontool.views import *

urlpatterns = patterns('',
    url(r'^comparisontool/', include('comparisontool.urls')),
)
