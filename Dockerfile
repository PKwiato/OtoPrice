# Use a slim Node.js image
FROM node:22-bookworm-slim

# Prevent prompts during apt-get and ensure necessary packages for Playwright
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies including devDependencies (needed for tsx and playwright)
RUN npm ci

# Install Playwright browsers and their OS dependencies
# We only need Chromium for the otomoto scraper
RUN npx playwright install --with-deps chromium

# Copy the server configuration and source code
COPY server.ts ./
COPY src/ ./src/

# Expose the port that Fastify runs on
EXPOSE 3000

# Start the server
CMD ["npx", "tsx", "server.ts"]
