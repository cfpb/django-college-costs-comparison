import os
DEBUG = True
PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))
ROOT_URLCONF = 'example_project.urls'

STATIC_URL = "/static/"

TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'templates')
)


TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
    'cfpb_common.context.request_context',
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
    'cfpb_common',
    'comparisontool',
    'haystack',
]

HAYSTACK_SITECONF = 'example_project.search_sites'
HAYSTACK_SEARCH_ENGINE = 'whoosh'
HAYSTACK_WHOOSH_PATH = os.path.join(os.path.dirname(__file__), 'whoosh_index')
