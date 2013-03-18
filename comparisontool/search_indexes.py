from haystack.indexes import *
from haystack import site
from comparisontool.models import School


class SchoolIndex(SearchIndex):
    text = CharField(document=True, model_attr='primary_alias')
    autocomplete = EdgeNgramField()
    school_id = IntegerField(model_attr='school_id')

    def index_queryset(self):
        """Used when the entire index for model is updated."""
        return School.objects.all()

    def prepare_autocomplete(self, obj):
        alias_strings = [a.alias for a in obj.alias_set.all()]
        return ' '.join(alias_strings)

site.register(School, SchoolIndex)
