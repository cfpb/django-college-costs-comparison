from django.conf.urls.defaults import patterns, url

from comparisontool.views import *

urlpatterns = patterns(
    'comparisontool.views',
    url(r'^$', BuildComparisonView.as_view(), name='worksheet'),
    url(r'^api/email/$', EmailLink.as_view(), name='email'),

    url(r'^feedback/$',
        FeedbackView.as_view(),
        name='pfc-feedback'),

    url(r'^technote/$',
        TemplateView.as_view(template_name="comparisontool/technote.html"),
        name='pfc-technote'),

    url(r'^learnmore/$',
        TemplateView.as_view(template_name="comparisontool/learn_more.html"),
        name='pfc-learnmore'),

    url(r'^api/search-schools.json', school_search_api),
    url(r'^api/bah-lookup.json', bah_lookup_api),

    url(r'^api/school/(\d+).json',
        SchoolRepresentation.as_view(),
        name='school-json'),

    url(r'^api/worksheet/([1-z0-9-]*).json$',
        DataStorageView.as_view(),
        name='worksheet'),

    url(r'^api/worksheet/$',
        CreateWorksheetView.as_view(),
        name='create_worksheet')
)
