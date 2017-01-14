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


class WSHandler(tornado.websocket.WebSocketHandler):
    def send(self, msg):
        self.write_message(json.dumps(msg))

    def open(self):
        self.send([{
            'browser': {
                'treeData': {
                    'name': 'Fixtures',
                    'open': True,
                    'children': fixtures.by_apps,
                }
            }
        }])

    def on_message(self, message):
        print 'received:', message
        messages = json.loads(message)
        for msg in messages:
            if msg.get('action') == 'open':
                with open(msg.get('path')) as fd:
                    data = json.load(fd)
                self.send([{
                    'editor': {
                        'openFiles': [{
                            'path': msg.get('path'),
                            'data': data,
                        }]
                    },
                }])

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
