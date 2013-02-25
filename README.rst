comparisontool
========================

Making it go (preliminary)
------------------------------------

Prerequisites: working virtualenv and virtualenvwrapper::

    # check out https://github.cfpb.gov/rosskarchner/cfpb_common and make note of where you put it
    # checkout this repo, and cd into it
    mkvirtualenv comparisontool
    add2virtualenv <path to the cfpb_common checkout>
    add2virtualenv .
    pip install -r requirements.txt
    django-admin.py runserver --settings=example_project.settings
    # open http://127.0.0.1:8000/comparisontool/ in your browser!


Setting up Solr
------------------------------------

- Download the latest release of Solr 3.x and unzip it somewhere
- Generate the solr schema with::

    django-admin.py build_solr_schema --settings=example_project.settings >  schema.xml

put that schema.xml whereever you unpacked Solr: example/solr/conf/schema.xml

Start solr by::

    cd <whereever you put solr>/example
    java -jar start.jar


Loading the data
------------------------------------
use the load_school command::

    django-admin.py load_school_json data/schools.csv

Shove it into Solr::
    
    django-admin.py rebuild_index

The school search API
------------------------------------

Search the schools with search_schools.json:
http://localhost:8000/comparisontool/api/search-schools.json?q=Harrisburg

The search results include the URL for more data on each school::

    [
    [
    "Harrisburg Area Community College-Harrisburg",
    "/comparisontool/api/school/212878.json"
    ],
    [
    "ITT Technical Institute-Harrisburg",
    "/comparisontool/api/school/430351.json"
    ],
    [
    "Kaplan Career Institute-Harrisburg",
    "/comparisontool/api/school/251075.json"
    ],
    [
    "Empire Beauty School-Harrisburg",
    "/comparisontool/api/school/212382.json"
    ],
    [
    "Widener University-Harrisburg Campus",
    "/comparisontool/api/school/402828.json"
    ],
    [
    "Harrisburg University of Science and Technology",
    "/comparisontool/api/school/446640.json"
    ],
    [
    "Pennsylvania State University-Penn State Harrisburg",
    "/comparisontool/api/school/214713.json"
    ],
    [
    "University of Phoenix-Harrisburg Campus",
    "/comparisontool/api/school/448831.json"
    ]
    ]

The school detail json files are simply a dictionary of keys from the CSV.

The worksheet API
-----------------------------------
*api/worksheet*

Accepts an otherwise-empyt post request, responds with a JSON dictionary that includes a WORKSHEET ID.

*api/worksheet/WORKSHEET ID.json*

Accepts only POST requests.

Returns the current saved worksheet as JSON

If you include data in your POST request, it will be saved (and reflected back to you in the response)


The email API
------------------------------------
*api/email*

Accepts post requests with two parameters: 'id' and 'email'.

'id' is a WORKSHEET ID

'email' is the recipients email.

example_project.settings is now configured to use the "console" backend, as described here:
https://docs.djangoproject.com/en/dev/topics/email/#console-backend

Running the Tests
------------------------------------

You can run the tests with via::

    python setup.py test

or::

    python runtests.py
