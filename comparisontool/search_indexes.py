from haystack import indexes

from comparisontool.models import School


class SchoolIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, model_attr='primary_alias')
    autocomplete = indexes.EdgeNgramField()
    school_id = indexes.IntegerField(model_attr='school_id')
    city = indexes.CharField(model_attr='city')
    state = indexes.CharField(model_attr='state')

    def get_model(self):
        return School

    def index_queryset(self, using=None):
        return self.get_model().objects.all()

    def prepare_autocomplete(self, obj):
        alias_strings = [a.alias for a in obj.alias_set.all()]
        return ' '.join(alias_strings)
