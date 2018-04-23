#!/usr/bin/env python

import dj_database_url

from django import setup
from django.conf import settings
from django.core.management import call_command


if not settings.configured:
    settings.configure(
        DATABASES={
            'default': dj_database_url.config(),
        },
        HAYSTACK_CONNECTIONS={
            'default': {
                'ENGINE': 'haystack.backends.simple_backend.SimpleEngine',
            },
        },
        INSTALLED_APPS=(
            'django.contrib.staticfiles',
            'comparisontool',
        ),
        ROOT_URLCONF='comparisontool.urls',
        SECRET_KEY='this-is-just-for-tests-so-not-that-secret',
        SITE_ID=1,
        TEMPLATES = [
            {
                'BACKEND': 'django.template.backends.django.DjangoTemplates',
                'APP_DIRS': True,
                'DIRS': [
                    'comparisontool/tests/templates',
                ]
            },
        ]
    )

setup()


def runtests():
    call_command('test', 'comparisontool.tests')


if __name__ == '__main__':
    runtests()
