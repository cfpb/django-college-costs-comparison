#!/usr/bin/env python

from django import setup
from django.conf import settings
from django.core.management import call_command

if not settings.configured:
    settings.configure(
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        },
        INSTALLED_APPS=(
            'comparisontool',
        ),
        SITE_ID=1,
        SECRET_KEY='this-is-just-for-tests-so-not-that-secret',
    )

setup()


def runtests():
    call_command('test', 'comparisontool.tests')


if __name__ == '__main__':
    runtests()
