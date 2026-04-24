#!/bin/bash

# Local development setup script
set -e

PROJECT_DIR="$(dirname "$0")/.."
cd "$PROJECT_DIR" || exit 1

echo "=========================================="
echo "Local Development Environment Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }

# Install Node dependencies
echo ""
echo "Installing Node.js dependencies..."
cd app
npm install
cd ..

# Copy environment file
echo "Setting up environment..."
if [ ! -f app/.env ]; then
  cp app/.env.example app/.env
  echo "Created .env file (please update with your configuration)"
fi

# Build Docker images
echo ""
echo "Building Docker images..."
docker-compose -f docker/docker-compose.yml build

# Generate SSL certificates for development
echo ""
echo "Generating SSL certificates..."
mkdir -p docker/ssl
openssl req -x509 -newkey rsa:4096 -keyout docker/ssl/key.pem -out docker/ssl/cert.pem -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || true

# Start services
echo ""
echo "Starting services..."
docker-compose -f docker/docker-compose.yml up -d

echo ""
echo "=========================================="
echo "Development Environment Ready!"
echo "=========================================="
echo ""
echo "Services:"
echo "  Application: http://localhost:3000"
echo "  NGINX: http://localhost:80 or https://localhost:443"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose -f docker/docker-compose.yml logs -f"
echo "  Stop services: docker-compose -f docker/docker-compose.yml down"
echo "  Rebuild: docker-compose -f docker/docker-compose.yml build --no-cache"
echo ""
echo "Next steps:"
echo "  1. Check docker-compose logs: docker-compose -f docker/docker-compose.yml logs"
echo "  2. Test endpoints: curl http://localhost:3000/health"
echo "  3. View application: http://localhost"
echo ""

sleep 2

# Test health endpoint
echo "Testing application..."
for i in {1..30}; do
  if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "✓ Application is ready!"
    break
  fi
  echo "Waiting for application to start... ($i/30)"
  sleep 1
done

echo ""
echo "Setup complete!"
