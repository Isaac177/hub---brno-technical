# Specify the base image with platform argument
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

# Set build arguments for multi-arch support
ARG BUILDPLATFORM
ARG TARGETPLATFORM

# Install required dependencies for builder stage
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code to the container
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript files
RUN yarn build

# Start a new stage for a smaller production image
FROM --platform=$TARGETPLATFORM node:18-alpine

# Install required dependencies for production stage
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install production dependencies
RUN yarn install --frozen-lockfile --production

# Copy node_modules and built assets from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Copy swagger.yaml file
COPY swagger.yaml ./

# Copy locales directory for i18next translations
COPY locales ./locales

# Expose the application port
EXPOSE 3003

# Set environment variables
ENV NODE_ENV=production

# Run the application
CMD ["node", "dist/index.js"]