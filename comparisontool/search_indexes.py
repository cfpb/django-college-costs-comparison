from haystack.indexes import *
from haystack import site
from comparisontool.models import Alias


class AliasIndex(SearchIndex):
    text = CharField(document=True, model_attr='alias')
    autocomplete = EdgeNgramField(model_attr='alias')
    school_id = IntegerField(model_attr='institution_id')

    def index_queryset(self):
        """Used when the entire index for model is updated."""
        return Alias.objects.all()


site.register(Alias, AliasIndex)
