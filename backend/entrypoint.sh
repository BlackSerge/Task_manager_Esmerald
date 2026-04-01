#!/bin/sh
set -e

while ! nc -z db 5432; do sleep 1; done
while ! nc -z redis 6379; do sleep 1; done

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec daphne -b 0.0.0.0 -p 8000 config.asgi:application
