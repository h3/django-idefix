# Idefix

## Introduction

Idefix is a django development tool that provides a web interface to edit project fixtures.

Editing fixture is always a PITA, Idefix tries to make it a little more fun.

For the moment this project is just a pet project and it is still in very early stage of development.

Any contributions are more than welcome :)

**Warning**: This project is a development tool, it is **not secured at all: DO NOT expose this service to internet**.

## Features

### Planned

 - add row: populate fields from model
 - delete row
 - add field: constrain with model fields
 - fields, rows: populate with random data with django-faker
 - booleans: click switch
 - support for choice fields
 - close tab
 - save to disk
 - search (fuzzy ?)


### Ideas

 - diff buffer with original
 - foreign keys: link, modify (ensure valid)
 - highlight invalid fields (ex: broken foreign key)
 - raw edit: codemirror
 - drag reorder rows
 - realtime colab
 - offer option to show/hide missing fields (compated to models)

## Stack

 - UI: Vue.js / HTML / SASS
 - Backend: tornado
 - Fonts: Fontawesome
