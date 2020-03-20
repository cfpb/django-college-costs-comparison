from django.views.generic import TemplateView

from comparisontool.views import (
    BuildComparisonView,
    CreateWorksheetView,
    DataStorageView,
    EmailLink,
    SchoolRepresentation,
    bah_lookup_api,
    school_search_api,
)

try:
    from django.urls import re_path
except ImportError:
    from django.conf.urls import url as re_path


urlpatterns = [
    re_path(
        r'^$',
        TemplateView.as_view(
            template_name='comparisontool/landing.html'
        ),
        name='pfc-landing'
    ),
    re_path(
        r'^choose-a-student-loan/$',
        TemplateView.as_view(
            template_name='comparisontool/choose_a_loan.html'
        ),
        name='pfc-choose'
    ),
    re_path(
        r'^manage-your-college-money/$',
        TemplateView.as_view(
            template_name='comparisontool/manage_your_money.html'
        ),
        name='pfc-manage'
    ),
    re_path(
        r'^repay-student-debt/$',
        TemplateView.as_view(
            template_name='comparisontool/repay_student_debt.html'
        ),
        name='pfc-repay'
    ),
    re_path(
        r'^compare-financial-aid-and-college-cost/$',
        BuildComparisonView.as_view(),
        name='worksheet'
    ),
    re_path(
        r'^compare-financial-aid-and-college-cost/api/email/$',
        EmailLink.as_view(),
        name='email'
    ),
    re_path(
        r'^compare-financial-aid-and-college-cost/technote/$',
        TemplateView.as_view(template_name="comparisontool/technote.html"),
        name='pfc-technote'
    ),
    re_path(
        r'^compare-financial-aid-and-college-cost/api/search-schools.json',
        school_search_api
    ),
    re_path(
        r'^compare-financial-aid-and-college-cost/api/bah-lookup.json',
        bah_lookup_api
    ),
    re_path(
        r'^compare-financial-aid-and-college-cost/api/school/(\d+).json',
        SchoolRepresentation.as_view(),
        name='school-json'
    ),
    re_path(
        r'^compare-financial-aid-and-college-cost/api/worksheet/([1-z0-9-]*)'
        r'.json$',
        DataStorageView.as_view(),
        name='worksheet'
    ),
    re_path(
        r'^compare-financial-aid-and-college-cost/api/worksheet/$',
        CreateWorksheetView.as_view(),
        name='create_worksheet'
    )
]
