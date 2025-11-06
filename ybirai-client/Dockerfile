# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=21.7.3
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Vite"

# Vite app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ARG YARN_VERSION=1.22.22
RUN npm install -g yarn@$YARN_VERSION --force


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy application code
COPY . .

# Build application
RUN yarn run build

# Remove development dependencies
RUN yarn install --production=true


# Final stage for app image
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public /usr/share/nginx/html

# Create nginx configuration
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ { \
        expires 30d; \
        add_header Cache-Control "public, no-transform"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Start the server by default, this can be overwritten at runtime
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
