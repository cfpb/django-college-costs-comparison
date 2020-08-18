import os
from setuptools import setup, find_packages


install_requires = [
    'Django>=2.1,<3.2',
    'dj-database-url>=0.4.2,<1',
    'django-haystack>=2.7,<2.9',
    'django-localflavor>=1.1,<3.1',
]


setup_requires = [
    'cfgov-setup==1.2',
    'setuptools-git-version==1.0.3',
]


def read_file(filename):
    """Read a file into a string"""
    path = os.path.abspath(os.path.dirname(__file__))
    filepath = os.path.join(path, filename)
    try:
        return open(filepath).read()
    except IOError:
        return ''


setup(
    name='comparisontool',
    version_format='{tag}.dev{commitcount}+{gitsha}',
    author='CFPB',
    author_email='tech@cfpb.gov',
    packages=find_packages(),
    include_package_data=True,
    url='<Include Link to Project>',
    license='<Include License Name>',
    description=u' '.join(__import__('comparisontool').__doc__.splitlines()).strip(),
    classifiers=[
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
        'Intended Audience :: Developers',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Framework :: Django',
        'Development Status :: 4 - Beta',
        'Operating System :: OS Independent',
    ],
    long_description=read_file('README.rst'),
    test_suite="runtests.runtests",
    zip_safe=False,
    python_requires=">=3.6",
    install_requires=install_requires,
    setup_requires=setup_requires,
)
