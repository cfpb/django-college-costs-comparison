from django.urls import re_path
from django.views.generic import TemplateView

urlpatterns = [
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
]
