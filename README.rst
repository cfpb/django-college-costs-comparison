College Cost Comparion tool
========================

This Django application allows students to compare financial aid offers. You can see the live version at:

http://www.consumerfinance.gov/paying-for-college/compare-financial-aid-and-college-cost/

Installation and Usage
------------------------------------

Install the requirements::

    pip install -r requirements.txt

Add 'comparisontools' to your project's INSTALLED_APPS_, and add a URL to your
urls_ that includes `comparisontool.urls`::


.. _INSTALLED_APPS: https://docs.djangoproject.com/en/1.6/ref/settings/#installed-apps
.. _urls: https://docs.djangoproject.com/en/1.6/topics/http/urls/#including-other-urlconfs

Create the database and tables
----------------------------------------

    
    django-admin.py syncdb  --settings=example_project.settings
    django-admin.py migrate comparisontool   --settings=example_project.settings


Setting up Solr
----------------------------------------

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

    django-admin.py load_school data/schools.csv --settings=example_project.settings

Load it into Solr::
    
    django-admin.py rebuild_index --settings=example_project.settings

Load the BAH Rates::

    django-admin.py load_bah data/bah-lookup.csv --settings=example_project.settings



Run the app
-----------------------------------

    django-admin.py runserver --settings=example_project.settings
    # open http://127.0.0.1:8000/comparisontool/ in your browser!

The URL may be different, depending on what you set in urls.py

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

The BAH Lookup API
----------------------------------

As simple as could be:

/comparisontool/api/bah-lookup.json?zip5=17033

If the zip code is found, it returns a dictionary with a single 'rate' member representing the BAH rate.

If the zip code was not found, it returns an empty dictionary.

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
