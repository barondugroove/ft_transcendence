#!/bin/sh
if [ "$DB_NAME" = "transcendence" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

python manage.py migrate

daphne -e ssl:port=8000:interface=$(IP_SERVER):privateKey=./ssl/nginx.key:certKey=./ssl/nginx.crt back.routing:application
