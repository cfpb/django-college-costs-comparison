import os
DEBUG = True
PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))
ROOT_URLCONF = 'example_project.urls'

SITE_ID = 1
STATIC_URL = "/static/"
MEDIA_URL = "http://files.consumerfinance.gov/f/theme/"

TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'templates')
)


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(PROJECT_PATH, 'dev.sqlite3'),
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.request',
)
INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.humanize',
    'south',
    'cfpb_common',
    'comparisontool',
    'haystack',
]

HAYSTACK_SITECONF = 'example_project.search_sites'
HAYSTACK_SEARCH_ENGINE = 'solr'
HAYSTACK_SOLR_URL = 'http://127.0.0.1:8983/solr'
