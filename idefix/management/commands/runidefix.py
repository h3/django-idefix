# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import sys

from django.apps import apps
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.migrations.autodetector import MigrationAutodetector
from django.db.migrations.executor import MigrationExecutor
from django.db.migrations.state import ProjectState
from django.db.utils import OperationalError

from idefix.webserver import start_webserver
from idefix.utils import FixtureManager


class Command(BaseCommand):
    """
    python manage.py runidefix
    """
    help = "Run idefix webserver"

    def add_arguments(self, parser):
        parser.add_argument(
            '--port',
            dest='port',
            default=8100,
            type=int)
        parser.add_argument(
            '--host',
            dest='host',
            default='127.0.0.1',
            type=str)

    def handle(self, *args, **opts):
        fixtures = FixtureManager()
        url = 'http://%s:%s' % (opts.get('host'), opts.get('port'))
        start_webserver(opts.get('host'), opts.get('port'))
        sys.exit(0)
