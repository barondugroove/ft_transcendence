# Use an official Python runtime as a parent image
FROM python:3.8

# Install system dependencies
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    libpq-dev \
    && apt-get clean

# Set the working directory in the container
WORKDIR /var/www/backend

# Copy the entrypoint script
COPY django-entrypoint.sh /usr/bin

# Ensure the entrypoint script is executable
RUN chmod 755 /usr/bin/django-entrypoint.sh

# Copy the requirements file to the container
COPY ./requirements.txt .

# Install Python dependencies
RUN pip -v install --no-cache-dir -r requirements.txt
RUN pip install -U 'Twisted[tls,http2]'

# Expose port for the application
EXPOSE 8000

# Set the environment variable for Django settings
ENV DJANGO_SETTINGS_MODULE=back.settings

# Set the default command to run the Django application with Daphne
CMD daphne -e ssl:port=8000:privateKey=./ssl/nginx.key:certKey=./ssl/nginx.crt back.routing:application

# Use the entrypoint script
ENTRYPOINT ["/usr/bin/django-entrypoint.sh"]