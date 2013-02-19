comparisontool
========================

Making it go (preliminary)
------------------------------------

Prerequisites: working virtualenv and virtualenvwrapper

    # check out https://github.cfpb.gov/rosskarchner/cfpb_common and make note of where you put it
    # checkout this repo, and cd into it
    mkvirtualenv comparisontool
    add2virtualenv <path to the cfpb_common checkout>
    pip install -r requirements.txt
    
    django-admin.py runserver --settings=example_project.settings
    # open http://127.0.0.1:8000/comparisontool/ in your browser!


Running the Tests
------------------------------------

You can run the tests with via::

    python setup.py test

or::

    python runtests.py
