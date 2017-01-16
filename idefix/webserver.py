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
        'tabs': {
            'active': 0,
            'items': [],
        },
        'editor': {
            'openFiles': [],
        },
        'browser': {
            'treeData': {}
        }
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
        }, full=True)

    def on_message(self, message):
        print 'RCV >', message
        messages = json.loads(message)
        for msg in messages:
            action = msg.get('action')
            if action == 'open' and hasattr(self.idefix, 'action_%s' % action):
                newstate = getattr(self.idefix, 'action_%s' % action)(msg)
                self.push_state(**newstate)

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
