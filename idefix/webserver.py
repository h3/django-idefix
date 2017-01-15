# -*- coding: utf-8 -*-

from __future__ import unicode_literals


import os
import sys
import json

import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template
from tornado.log import enable_pretty_logging

from idefix.utils import FixtureManager

BASE_PATH = os.path.dirname(__file__)

fixtures = FixtureManager()


class Idefix(object):
    state = {
        'editor': {
            'openFiles': [],
        },
        'browser': {
            'treeData': {}
        }
    }

    def action_open(self, msg):
        with open(msg.get('path')) as fd:
            data = json.load(fd)
        return [{
            'editor': {
                'openFiles': [{
                    'path': msg.get('path'),
                    'data': data,
                }]
            },
        }]


class WSHandler(tornado.websocket.WebSocketHandler):
    idefix = Idefix()

    def push_state(self, **kwargs):
        self.idefix.state.update(kwargs)
        self.send({'event': 'new-state', 'data': self.idefix.state})

    def send(self, *args):
        msg = json.dumps(args)
        print 'SND >', msg
        self.write_message(msg)

    def open(self):
        self.push_state(
            browser={
                'treeData': {
                    'name': 'Fixtures',
                    'open': True,
                    'children': fixtures.by_apps,
                }
        })

    def on_message(self, message):
        print 'RCV >', message
        messages = json.loads(message)
        for msg in messages:
            action = msg.get('action')
            if action == 'open' and hasattr(self.idefix, 'action_%s' % action):
                self.send(getattr(self.idefix, 'action_%s' % action)(msg))

    def on_close(self):
      print 'connection closed...'


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
        print '^C received, shutting down the web server'
        sys.exit(0)
