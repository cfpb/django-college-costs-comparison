import os
from setuptools import setup, find_packages


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
    author='<Include Your Name Here>',
    author_email='<Include Your Email Here>',
    packages=find_packages(),
    include_package_data=True,
    url='<Include Link to Project>',
    license='<Include License Name>',
    description=u' '.join(__import__('comparisontool').__doc__.splitlines()).strip(),
    classifiers=[
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
        'Intended Audience :: Developers',
        'Programming Language :: Python',      
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Framework :: Django',
        'Development Status :: 4 - Beta',
        'Operating System :: OS Independent',
    ],
    long_description=read_file('README.rst'),
    test_suite="runtests.runtests",
    zip_safe=False,
    setup_requires=['setuptools-git-version'],
    install_requires=[
        'dj-database-url==0.4.2',
        'Django>=1.8,<1.12',
        'django-haystack==2.7.0',
        'django-localflavor==1.1',
    ]
)
