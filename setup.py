import os

from setuptools import find_packages, setup

install_requires = [
    'Django>=2.1,<3.2',
    'dj-database-url>=0.4.2,<1',
]


setup_requires = [
    'cfgov-setup==1.2',
    'setuptools-git-version==1.0.3',
]


setup(
    name='comparisontool',
    version_format='{tag}.dev{commitcount}+{gitsha}',
    author='CFPB',
    author_email='tech@cfpb.gov',
    packages=find_packages(),
    include_package_data=True,
    url='https://github.com/cfpb/django-college-costs-comparison',
    license='CCO',
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
    long_description=open("README.md", "r", encoding="utf-8").read(),
    test_suite="runtests.runtests",
    zip_safe=False,
    python_requires=">=3.6",
    install_requires=install_requires,
    setup_requires=setup_requires,
)
