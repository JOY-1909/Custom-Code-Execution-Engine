FROM gcc:13-bookworm

# Create non-root user for security
RUN useradd -m -s /bin/bash sandbox

# Set working directory
WORKDIR /sandbox

# Switch to non-root user
USER sandbox

# Default command
CMD ["g++", "--version"]
