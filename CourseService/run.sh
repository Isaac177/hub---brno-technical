#!/bin/bash

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Load environment variables from .env file
set -a
source .env
set +a

# Run the Spring Boot application with explicit environment variables
SPRING_REDIS_HOST="${SPRING_REDIS_HOST}" \
SPRING_REDIS_PORT="${SPRING_REDIS_PORT}" \
SPRING_REDIS_PASSWORD="${SPRING_REDIS_PASSWORD}" \
./mvnw spring-boot:run
