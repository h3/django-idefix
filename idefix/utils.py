# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import os
import glob
import gzip

from itertools import product

from django.apps import apps
from django.conf import settings
from django.utils import lru_cache
from django.utils._os import upath
from django.core import serializers
from django.db import DEFAULT_DB_ALIAS
from django.utils.glob import glob_escape
from django.utils.functional import cached_property
from django.core.exceptions import ImproperlyConfigured
from django.core.management.commands.loaddata import SingleZipReader, humanize


class FixtureManager(object):
    verbosity = 1
    app_label = None
    serialization_formats = serializers.get_public_serializer_formats()
    compression_formats = {
        None: (open, 'rb'),
        'gz': (gzip.GzipFile, 'rb'),
        'zip': (SingleZipReader, 'r'),
    }

    def parse_name(self, fixture_name):
        """
        Splits fixture name in name, serialization format, compression format.
        """
        parts = fixture_name.rsplit('.', 2)

        if len(parts) > 1 and parts[-1] in self.compression_formats:
            cmp_fmt = parts[-1]
            parts = parts[:-1]
        else:
            cmp_fmt = None

        if len(parts) > 1:
            if parts[-1] in self.serialization_formats:
                ser_fmt = parts[-1]
                parts = parts[:-1]
            else:
                raise Exception(
                    "Problem installing fixture '%s': %s is not a known "
                    "serialization format." % (''.join(parts[:-1]), parts[-1]))
        else:
            ser_fmt = None

        name = '.'.join(parts)

        return name, ser_fmt, cmp_fmt

    @lru_cache.lru_cache(maxsize=None)
    def find_fixtures(self, fixture_label):
        """
        Finds fixture files for a given label.
        """
        fixture_name, ser_fmt, cmp_fmt = self.parse_name(fixture_label)
        databases = [DEFAULT_DB_ALIAS, None]
        cmp_fmts = list(self.compression_formats.keys()) if cmp_fmt is None else [cmp_fmt]
        ser_fmts = serializers.get_public_serializer_formats() if ser_fmt is None else [ser_fmt]

        if self.verbosity >= 2:
            self.stdout.write("Loading '%s' fixtures..." % fixture_name)

        if os.path.isabs(fixture_name):
            fixture_dirs = [os.path.dirname(fixture_name)]
            fixture_name = os.path.basename(fixture_name)
        else:
            fixture_dirs = self.fixture_dirs
            if os.path.sep in os.path.normpath(fixture_name):
                fixture_dirs = [os.path.join(dir_, os.path.dirname(fixture_name))
                                for dir_ in fixture_dirs]
                fixture_name = os.path.basename(fixture_name)

        suffixes = (
            '.'.join(ext for ext in combo if ext)
            for combo in product(databases, ser_fmts, cmp_fmts)
        )
        targets = set('.'.join((fixture_name, suffix)) for suffix in suffixes)

        fixture_files = []
        for fixture_dir in fixture_dirs:
            if self.verbosity >= 2:
                self.stdout.write("Checking %s for fixtures..." % humanize(fixture_dir))
            fixture_files_in_dir = []
            path = os.path.join(fixture_dir, fixture_name)
            for candidate in glob.iglob(glob_escape(path) + '*'):
                if os.path.basename(candidate) in targets:
                    # Save the fixture_dir and fixture_name for future error messages.
                    fixture_files_in_dir.append((candidate, fixture_dir, fixture_name))

            if self.verbosity >= 2 and not fixture_files_in_dir:
                self.stdout.write("No fixture '%s' in %s." %
                                  (fixture_name, humanize(fixture_dir)))

            # Check kept for backwards-compatibility; it isn't clear why
            # duplicates are only allowed in different directories.
            if len(fixture_files_in_dir) > 1:
                raise Exception(
                    "Multiple fixtures named '%s' in %s. Aborting." %
                    (fixture_name, humanize(fixture_dir)))
            fixture_files.extend(fixture_files_in_dir)

        if not fixture_files:
            raise Exception("No fixture named '%s' found." % fixture_name)

        return fixture_files


    def list_fixtures(self, mod, _dir):
        fixture_files_in_dir = []
        for candidate in glob.iglob(glob_escape(_dir) + '/*'):
            print candidate
            fixture_files_in_dir.append({'name': os.path.basename(candidate), 'path': candidate})


    @cached_property
    def by_apps(self):
        apps_fixtures = {}
        for app_config in apps.get_app_configs():
            app_dir = os.path.join(app_config.path, 'fixtures')
            if os.path.isdir(app_dir):
                path = upath(os.path.abspath(os.path.realpath(app_dir)))
                if '.' in app_config.name:
                    mod, app = app_config.name.split('.')
                    if mod not in apps_fixtures.keys():
                        apps_fixtures[mod] = {'name': mod, 'open': True, 'children': []}
                    apps_fixtures[mod]['children'].append({'path': path, 'name': app, 'open': True, 'children': self.list_fixtures(app, path)})
                else:
                    mod = app_config.name
                    if mod not in apps_fixtures.keys():
                        apps_fixtures[mod] = {'name': app_config.name, 'open': True, 'children': []}
                    apps_fixtures[mod]['children'].append({'name': mod, 'path': path})

        print "+++++++++++++++++"
        print apps_fixtures.values()
        print "+++++++++++++++++"
        return apps_fixtures.values()
