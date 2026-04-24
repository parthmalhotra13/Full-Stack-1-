#!/bin/bash

# Update system packages
yum update -y

# Install Docker
amazon-linux-extras install docker -y
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

# Create docker-compose.yml
cat > /home/ec2-user/docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    image: ${docker_image}
    ports:
      - "${app_port}:80"
    restart: always
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${app_port}/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF

# Start the application
cd /home/ec2-user
docker-compose up -d

# Log deployment
echo "Application deployed successfully at $(date)" >> /var/log/deployment.log
