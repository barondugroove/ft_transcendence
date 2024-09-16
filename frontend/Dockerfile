# Stage 1: Build Angular Application
FROM node:18.17.1 AS build
WORKDIR /app

# Copy only package.json and package-lock.json first for efficient caching
COPY ./angular/package*.json ./

# Install dependencies (using npm ci for a clean install in production mode)
RUN npm ci --omit=dev

# Now copy the rest of the app source code
COPY ./angular .

# Build the Angular app
RUN npm run build

# Stage 2: Setup NGINX
FROM nginx:alpine

# Copy the built Angular app from the build stage
COPY --from=build /app/dist/your-app-name /usr/share/nginx/html/

# Copy the NGINX configuration
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Expose ports for HTTP and HTTPS
EXPOSE 80
EXPOSE 443

# Run NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
