#!/bin/bash

# Deployment script for AWS infrastructure
set -e

PROJECT_NAME="${1:-exp-3-2-3}"
AWS_REGION="${2:-us-east-1}"
ENVIRONMENT="${3:-dev}"

echo "=========================================="
echo "AWS Infrastructure Deployment Script"
echo "=========================================="
echo "Project: $PROJECT_NAME"
echo "Region: $AWS_REGION"
echo "Environment: $ENVIRONMENT"
echo "=========================================="

# Check prerequisites
echo "Checking prerequisites..."
command -v terraform >/dev/null 2>&1 || { echo "Terraform is required but not installed."; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }

# Configure AWS region
export AWS_REGION=$AWS_REGION

# Navigate to terraform directory
cd "$(dirname "$0")/../terraform" || exit 1

# Initialize Terraform
echo "Initializing Terraform..."
terraform init

# Validate Terraform configuration
echo "Validating Terraform configuration..."
terraform validate

# Plan deployment
echo "Planning deployment..."
terraform plan -out=tfplan \
  -var="project_name=$PROJECT_NAME" \
  -var="aws_region=$AWS_REGION" \
  -var="instance_type=t3.medium"

# Ask for confirmation
read -p "Do you want to proceed with deployment? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "Deployment cancelled."
  rm tfplan
  exit 0
fi

# Apply deployment
echo "Applying Terraform configuration..."
terraform apply tfplan

# Get outputs
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""

ALB_DNS=$(terraform output -raw alb_dns_name 2>/dev/null || echo "N/A")
echo "Load Balancer URL: http://$ALB_DNS"
echo ""

# Display useful information
echo "Next steps:"
echo "1. Build and push Docker image:"
echo "   docker build -f docker/Dockerfile -t myapp:latest ."
echo "   docker tag myapp:latest <account-id>.dkr.ecr.$AWS_REGION.amazonaws.com/myapp:latest"
echo "   docker push <account-id>.dkr.ecr.$AWS_REGION.amazonaws.com/myapp:latest"
echo ""
echo "2. Update Auto Scaling Group with new image:"
echo "   aws autoscaling update-auto-scaling-group --auto-scaling-group-name $PROJECT_NAME-asg --region $AWS_REGION"
echo ""
echo "3. View CloudWatch logs:"
echo "   aws logs tail /aws/autoscaling/$PROJECT_NAME-asg --follow --region $AWS_REGION"
echo ""

# Clean up
rm tfplan

echo "Deployment script completed successfully!"
