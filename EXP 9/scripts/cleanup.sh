#!/bin/bash

# Script to destroy AWS infrastructure
set -e

PROJECT_NAME="${1:-exp-3-2-3}"
AWS_REGION="${2:-us-east-1}"

echo "=========================================="
echo "AWS Infrastructure Cleanup Script"
echo "=========================================="
echo "Project: $PROJECT_NAME"
echo "Region: $AWS_REGION"
echo "=========================================="
echo ""
echo "WARNING: This will destroy all AWS resources!"
echo ""

# Ask for confirmation
read -p "Are you sure you want to destroy all resources? (type 'yes' to continue): " -r
if [[ ! $REPLY == "yes" ]]; then
  echo "Cleanup cancelled."
  exit 0
fi

# Configure AWS region
export AWS_REGION=$AWS_REGION

# Navigate to terraform directory
cd "$(dirname "$0")/../terraform" || exit 1

# Initialize Terraform
echo "Initializing Terraform..."
terraform init

# Destroy infrastructure
echo "Destroying infrastructure..."
terraform destroy \
  -var="project_name=$PROJECT_NAME" \
  -var="aws_region=$AWS_REGION" \
  -auto-approve

echo ""
echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo ""
echo "All AWS resources have been destroyed."
