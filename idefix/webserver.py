# -*- coding: utf-8 -*-

from __future__ import unicode_literals


import os
import sys
import json

from django.apps import AppConfig
from django.apps import apps
from django.db.models.fields import NOT_PROVIDED

import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template
from tornado.log import enable_pretty_logging

from idefix.utils import FixtureManager

BASE_PATH = os.path.dirname(__file__)

fixtures = FixtureManager()


def get_fixtures_list(fixture):
    out = []
    if type(fixture) is list:
        for f in fixture:
            if f.get('children'):
                out = out + get_fixtures_list(f.get('children'))
            else:
                out.append(f.get('path'))
        return out
    elif fixture and fixture.get('path'):
        return fixture.get('path')
    return out


def collect_models_from_fixtures(fixture):
    out = []
    malformed = []
    fixture_files = get_fixtures_list(fixture)
    for path in fixture_files:
        with open(path) as fd:
            # Trying to load an empty file will trigger an Exception that
            # I can't seem to trap inside Tornado .. so let's avoid that.
            if os.stat(path).st_size != 0:
                try:
                    data = json.load(fd)
                except ValueError:
                    malformed.append(path)
                out = out + list(set(r.get('model') for r in data))
    return list(set(out)), malformed


def get_field_map_as_dict(model):
    fields = {}
    for f in model._meta.fields:
       #_def = None if f.default is NOT_PROVIDED else f.default
       #if callable(_def):
       #    _def = str(_def())
        fields[f.name] = {
            'attname': f.attname,
            'verbose_name': str(f.verbose_name),
            'is_relation': f.is_relation,
            'auto_created': f.auto_created,
            'blank': f.blank,
            'max_length': f.max_length,
            'help_text': str(f.help_text),
            'unique': f.unique,
            'concrete': f.concrete,
            'empty_strings_allowed': f.empty_strings_allowed,
            'description': str(f.description),
       #    'dedault': _def,
            'choices': dict([(str(c[0]), str(c[1])) for c in f.choices]),
        }
    return fields


def get_model_map_as_dict(fixture):
    models = {}
    _models, _malformed_files = collect_models_from_fixtures(fixture)
    for m in _models:
        app_name, model_name = m.split('.')
        if app_name not in models.keys():
            models[app_name] = {}
        if apps.all_models.get(app_name) and apps.all_models.get(app_name).get(model_name):
            model = apps.all_models.get(app_name).get(model_name)
            models[app_name][model_name] = get_field_map_as_dict(model)
    return {
        'malformed': _malformed_files,
        'models': models,
    }


class Idefix(object):
    state = {
        'tabs': {
            'active': 0,
            'items': [],
        },
        'editor': {
            'openFiles': [],
        },
        'browser': {
            'treeData': {}
        },
        'models': {}
    }

    def action_open(self, msg):
        path = msg.get('path')
        with open(path) as fd:
            data = json.load(fd)
        tab_count = len(self.state.get('tabs').get('items'))
        tab_list = self.state.get('tabs').get('items')
        for t in tab_list:
            t['is_open'] = False
        tab_list.append({
            'path': path,
            'label': os.path.basename(path),
            'original': data,
            'buffer': data,  # TODO: optimize
            'is_changed': False,
            'is_open': True,
        })
        return {
            'tabs': {
                'active': tab_count + 1,
                'items': tab_list,
            }
        }


class WSHandler(tornado.websocket.WebSocketHandler):
    idefix = Idefix()

    def push_state(self, **kwargs):
        full = False
        if kwargs.get('full'):
            full = kwargs.pop('full')
        self.idefix.state.update(kwargs)
        self.send({
            'event': 'new-state',
            'data': self.idefix.state if full else kwargs,
        })

    def send(self, *args):
        msg = json.dumps(args)
        print('SND > %s ...' % msg[0:200])
        self.write_message(msg)

    def open(self):
        self.push_state(
            models=get_model_map_as_dict(fixtures.by_apps),
            browser={
                'treeData': {
                    'name': 'Fixtures',
                    'open': True,
                    'children': fixtures.by_apps,
                }
        }, full=True)

    def on_message(self, message):
        print('RCV > %s ...' % message[0:200])
        messages = json.loads(message)
        for msg in messages:
            action = msg.get('action')
            if action == 'open' and hasattr(self.idefix, 'action_%s' % action):
                newstate = getattr(self.idefix, 'action_%s' % action)(msg)
                self.push_state(**newstate)

    def on_close(self):
      print('connection closed...')


enable_pretty_logging()
application = tornado.web.Application([
  ('/ws', WSHandler),
  ('/(.*)', tornado.web.StaticFileHandler, {
      "path": os.path.join(BASE_PATH, 'static/idefix/')}),
])


def start_webserver(host, port):
    try:
        print('Starting idefix webserver on http://%s:%s' % (host, port))
        application.listen(port, address=host)
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        print('^C received, shutting down the web server')
        sys.exit(0)
