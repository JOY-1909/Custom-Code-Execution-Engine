# Code Execution Engine - Production Dockerfile
FROM node:20-slim

# Install language runtimes
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    default-jdk \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN python3 --version && java -version && g++ --version

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create temp directory for code execution
RUN mkdir -p /app/temp && chmod 777 /app/temp

# Create non-root user for security
RUN useradd -m appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start server
CMD ["node", "src/server.js"]
