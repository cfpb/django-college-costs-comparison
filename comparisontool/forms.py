from django import forms

from localflavor.us.forms import USZipCodeField

from .validators import validate_uuid4


class FeedbackForm(forms.Form):
    message = forms.CharField(widget=forms.Textarea)


class EmailForm(forms.Form):
    id = forms.CharField(validators=[validate_uuid4])
    email = forms.EmailField()


class SchoolSearchForm(forms.Form):
    q = forms.CharField(max_length=100)


class BAHZipSearchForm(forms.Form):
    zip5 = USZipCodeField()
