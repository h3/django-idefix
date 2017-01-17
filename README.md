# Idefix

Idefix is a django development tool that provides a web interface to edit project fixtures.

![UI demo](http://i.imgur.com/LAWpi2p.png "First semi-working draft of the UI")

## Why ?

Editing fixture is always a PITA, Idefix tries to make it a little more fun.

For the moment this project is just a pet project and it is still in very early stage of development.

Any contributions are more than welcome :)

**Warning**: This project is a development tool, it is **not secured at all: DO NOT expose this service to internet**.

## Features

### Planned

 - add row: populate fields from model, use defaults, accept and parse raw copy paste input
 - delete row
 - add field: constrain with model fields
 - fields, rows: populate with random data with django-faker
 - booleans: click switch
 - support for choice fields
 - close tab
 - save to disk
 - search (fuzzy ?)
 - date/time picker
 - use npm/bower
 - [refactor to single-file-components](https://vuejs.org/v2/guide/single-file-components.html)

### Ideas

 - crypt password fields
 - diff buffer with original
 - foreign keys: link, modify (ensure valid)
 - highlight invalid fields (ex: broken foreign key)
 - raw edit: codemirror
 - drag reorder rows
 - realtime colab
 - offer option to show/hide missing fields (compated to models)
 - create fixture from existing database object
 - dump model fixtures to file (with custom query)

## Installation

```sh
(venv)$ pip install https://gitlab.com/h3/django-idefix.git
```

## Usage

```sh
(venv)$ python manage.py runidefix
Starting idefix webserver on http://127.0.0.1:8100
```

## Stack

 - UI: Vue.js / HTML / SASS
 - Backend: tornado
 - Fonts: Fontawesome
