# AWS Region Configuration
aws_region = "us-east-1"

# Project Configuration
project_name = "exp-3-2-3"

# VPC Configuration
vpc_cidr       = "10.0.0.0/16"
public_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnets = ["10.0.11.0/24", "10.0.12.0/24"]
availability_zones = ["us-east-1a", "us-east-1b"]

# EC2 Configuration
instance_type = "t3.medium"

# Auto Scaling Configuration
min_instances     = 2
max_instances     = 6
desired_instances = 2

# Application Configuration
app_port    = 80
docker_image = "nginx:latest"

# SSH Configuration
ssh_allowed_cidr = ["0.0.0.0/0"]
