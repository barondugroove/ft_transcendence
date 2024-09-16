# Use an official Python runtime as a parent image
FROM python:3.8-slim

# Install dependencies and update packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /var/www/backend

# Copy the requirements file to the container
COPY ./requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -U 'Twisted[tls,http2]'

# Copy the entrypoint script and set permissions
COPY django-entrypoint.sh /usr/bin
RUN chmod +x /usr/bin/django-entrypoint.sh

# Expose port 8000 for the Django app
EXPOSE 8000

# Set the Django settings environment variable
ENV DJANGO_SETTINGS_MODULE=back.settings

# Command to run when the container starts
CMD ["daphne", "-e", "ssl:port=8000:privateKey=./ssl/nginx.key:certKey=./ssl/nginx.crt", "back.routing:application"]

# Set the entrypoint for the container
ENTRYPOINT ["/usr/bin/django-entrypoint.sh"]
