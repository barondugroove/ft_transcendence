#!/bin/sh

# Check if we are using the 'transcendence' database
if [ "$DB_NAME" = "transcendence" ]; then
    echo "Waiting for PostgreSQL..."

    # Wait for PostgreSQL to be ready (add a timeout of 30 seconds to avoid infinite loops)
    timeout=30
    while ! nc -z "$DB_HOST" "$DB_PORT"; do
        timeout=$((timeout - 1))
        if [ $timeout -eq 0 ]; then
            echo "PostgreSQL is not available after waiting. Exiting..."
            exit 1
        fi
        sleep 1
    done

    echo "PostgreSQL started"
fi

# Run Django database migrations
python manage.py migrate

# Start Daphne server with SSL options
# daphne -e ssl:port=8000:interface=10.13.249.37:privateKey=./ssl/nginx.key:certKey=./ssl/nginx.crt back.routing:application

# Execute the CMD instruction from the Dockerfile (e.g., Daphne)
exec "$@"
