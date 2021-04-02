# Django College Cost Comparison Tool

# :warning: THIS REPO IS DEPRECATED (April 2, 2021) :warning:

**Description**:  This application allows potential students to compare financial aid offers. You can use the live version at https://www.consumerfinance.gov/paying-for-college/compare-financial-aid-and-college-cost/

This is Javascript application, and the Django API that powers it.

## Installation

We'll assume you have [cfgov-refresh up and running, either in the standalone or Docker configuration](https://cfpb.github.io/cfgov-refresh/installation/).

For the standalone setup, check it out anywhere on your computer, and `pip install -e [path-to-checkout]`,
for example `pip install -e ../django-college-costs-comparison`,
if it was a sibling project to cfgov-refresh.

Restart the webserver and visit
http://localhost:8000/paying-for-college/manage-your-college-money/#o1

For Docker, check the app out into cfgov-refresh/develop-apps.

To populate the search index: `cfgov/manage.py update_index comparisontool`

(this assumes you have a recent database dump)

## Testing

If you have [Tox](https://tox.readthedocs.io/en/latest/) installed (recommended), you can run the specs for this project with the `tox` command.

If not, this command will run the specs on the python version your local environment has installed: `./manage.py test`.

## Getting help

If you have questions, concerns, bug reports, etc, please file an issue in this repository's Issue Tracker.


----

## Open source licensing info
1. [TERMS](TERMS.md)
2. [LICENSE](LICENSE)
3. [CFPB Source Code Policy](https://github.com/cfpb/source-code-policy/)
