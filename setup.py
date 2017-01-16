from setuptools import setup, find_packages
import sys

idefix = __import__('idefix')

readme_file = 'README.md'
try:
    long_description = open(readme_file).read()
except IOError:
    sys.stderr.write(
        "[ERROR] Cannot find file specified as "
        "``long_description`` (%s)\n" % readme_file
    )
    sys.exit(1)

install_requires = [
    'tornado==4.4.2',
    'django-faker==0.2.1',
]

setup(name='django-idefix',
      version=idefix.get_version(),
      description='Idefix is a django development tool that provides a web interface to edit project fixtures.',
      long_description=long_description,
      zip_safe=False,
      author='Maxime Haineault',
      author_email='haineault@3ejoueur.com',
      url='https://gitlab.com/h3/django-idefix',
      download_url='https://gitlab.com/h3/django-idefix/repository/archive.tar.gz?ref=master',
      packages=find_packages(exclude=['demo', 'demo.*']),
      include_package_data=True,
      install_requires = install_requires,
      classifiers=[
          'Development Status :: 4 - Beta',
          'Environment :: Web Environment',
          'Framework :: Django',
          'Framework :: Django :: 1.10',
          'Intended Audience :: Developers',
          'License :: OSI Approved :: MIT License',
          'Operating System :: OS Independent',
          'Programming Language :: Python',
          'Programming Language :: Python :: 2',
          'Programming Language :: Python :: 2.6',
          'Programming Language :: Python :: 2.7',
          'Programming Language :: Python :: 3',
          'Programming Language :: Python :: 3.2',
          'Programming Language :: Python :: 3.3',
          'Programming Language :: Python :: 3.4',
          'Programming Language :: Python :: 3.5',
          'Topic :: Utilities'
      ],
      )
