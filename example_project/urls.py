from django.conf.urls import patterns, include, url
from django.views.decorators.csrf import csrf_exempt 

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^comparisontool/', include('comparisontool.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
