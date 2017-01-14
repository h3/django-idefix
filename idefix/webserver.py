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
  def open(self):
    print 'connection opened...'
    self.write_message(json.dumps({
        'data': {
            'browser': {
                'name': 'Fixtures',
                'open': True,
                'children': fixtures.by_apps,
            }
        }
    }))

  def on_message(self, message):
    self.write_message("The server says: " + message + " back at you")
    print 'received:', message

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
