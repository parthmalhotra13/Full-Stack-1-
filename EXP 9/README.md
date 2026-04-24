# Experiment 3.2.3: AWS Deployment with Load Balancing

Full-stack application deployment on AWS with load balancing and auto-scaling.

## Overview

This experiment demonstrates a complete AWS deployment architecture including:

- **VPC Configuration**: Public and private subnets across multiple availability zones
- **Load Balancing**: Application Load Balancer (ALB) with health checks
- **Auto Scaling**: Dynamic scaling based on CPU and request metrics
- **Containerization**: Docker containers deployed to EC2 instances
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- **Monitoring**: CloudWatch alarms and metrics

## Objectives

1. ✅ Configure AWS infrastructure (VPC, EC2, ALB)
2. ✅ Set up auto-scaling group
3. ✅ Deploy Docker containers to EC2
4. ✅ Configure application load balancer
5. ✅ Implement CI/CD pipeline

## Architecture

```
Internet
    |
    v
[ALB - Application Load Balancer]
    |
    +---> [Availability Zone 1]
    |        |
    |        +---> [EC2 Instance 1] (Docker Container)
    |        +---> [EC2 Instance 2] (Docker Container)
    |
    +---> [Availability Zone 2]
            |
            +---> [EC2 Instance 3] (Docker Container)
            +---> [EC2 Instance 4] (Docker Container)

[Auto Scaling Group] - Manages EC2 instances
[CloudWatch] - Monitors metrics and triggers scaling
```

## Prerequisites

### Required Tools
- **Terraform** 1.5.0+
- **AWS CLI** 2.0+
- **Docker** 20.10+
- **Node.js** 18.0+
- **Git** 2.0+

### AWS Account Setup

1. Create an AWS account or use existing one
2. Set up AWS credentials:
   ```bash
   aws configure
   ```
3. Create IAM user with appropriate permissions or use root account (not recommended)

### Required AWS Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "elasticloadbalancing:*",
        "autoscaling:*",
        "cloudwatch:*",
        "logs:*",
        "iam:PassRole",
        "iam:CreateRole",
        "iam:PutRolePolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # GitHub Actions CI/CD pipeline
├── app/                            # Application source code
│   ├── src/
│   │   └── index.ts               # Express.js application
│   ├── package.json               # Node dependencies
│   ├── tsconfig.json              # TypeScript configuration
│   └── .env.example               # Environment variables template
├── docker/
│   ├── Dockerfile                 # Multi-stage Docker build
│   ├── docker-compose.yml         # Development environment
│   └── nginx.conf                 # NGINX reverse proxy config
├── terraform/
│   ├── main.tf                    # VPC, EC2, ALB configuration
│   ├── autoscaling.tf             # Auto Scaling configuration
│   ├── variables.tf               # Terraform variables
│   ├── outputs.tf                 # Terraform outputs
│   ├── terraform.tfvars           # Variable values
│   └── user_data.sh               # EC2 initialization script
├── scripts/
│   ├── deploy.sh                  # Deployment script
│   ├── cleanup.sh                 # Infrastructure cleanup
│   └── setup-dev.sh               # Local development setup
└── README.md                      # This file
```

## Quick Start

### Local Development

1. **Clone and setup**:
   ```bash
   cd "x:\EXP 9"
   bash scripts/setup-dev.sh
   ```

2. **Access services**:
   - Application: http://localhost:3000
   - NGINX: http://localhost
   - API Documentation: http://localhost:3000/api/docs

3. **Test endpoints**:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/version
   curl "http://localhost:3000/api/echo?message=HelloWorld"
   ```

### AWS Deployment

1. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

2. **Update Terraform variables** (optional):
   ```bash
   # Edit terraform/terraform.tfvars
   nano terraform/terraform.tfvars
   ```

3. **Deploy infrastructure**:
   ```bash
   bash scripts/deploy.sh exp-3-2-3 us-east-1 prod
   ```

4. **Get ALB DNS**:
   ```bash
   cd terraform
   terraform output alb_dns_name
   ```

5. **Test application**:
   ```bash
   curl http://<ALB_DNS>/health
   ```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp app/.env.example app/.env
```

**Key variables**:
- `NODE_ENV`: Development or production
- `DB_HOST`: PostgreSQL host
- `REDIS_HOST`: Redis host
- `AWS_REGION`: AWS region for deployment

### Terraform Variables

Edit `terraform/terraform.tfvars`:

```hcl
project_name      = "exp-3-2-3"
aws_region         = "us-east-1"
instance_type      = "t3.medium"
min_instances      = 2
max_instances      = 6
desired_instances  = 2
```

## Deployment Guide

### Step 1: Local Testing

```bash
# Start local environment
bash scripts/setup-dev.sh

# Run tests
cd app
npm test

# Build Docker image
docker build -f ../docker/Dockerfile -t myapp:latest .
```

### Step 2: Push to Registry

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag myapp:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/myapp:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/myapp:latest
```

### Step 3: Deploy Infrastructure

```bash
# Navigate to workspace
cd "x:\EXP 9"

# Deploy
bash scripts/deploy.sh exp-3-2-3 us-east-1 prod
```

### Step 4: Verify Deployment

```bash
# Get ALB DNS
ALB_DNS=$(cd terraform && terraform output -raw alb_dns_name)

# Test endpoints
curl http://$ALB_DNS/health
curl http://$ALB_DNS/version
curl http://$ALB_DNS/api/stats
```

## CI/CD Pipeline

The GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) includes:

1. **Build Stage**:
   - Install dependencies
   - Run linting
   - Run tests
   - Build Docker image

2. **Security Scan**:
   - Trivy vulnerability scanning
   - SARIF upload to GitHub Security

3. **Terraform Plan**:
   - Validate configuration
   - Show deployment plan

4. **Deploy Development** (on develop branch):
   - Apply Terraform to dev environment

5. **Deploy Production** (on main branch):
   - Apply Terraform to prod environment
   - Run smoke tests

### Setup GitHub Actions Secrets

Add these secrets to your GitHub repository:

- `AWS_ROLE_TO_ASSUME_DEV`: ARN of IAM role for dev deployment
- `AWS_ROLE_TO_ASSUME_PROD`: ARN of IAM role for prod deployment
- `DOCKER_REGISTRY_USERNAME`: Docker registry username
- `DOCKER_REGISTRY_PASSWORD`: Docker registry password

## Monitoring and Scaling

### CloudWatch Metrics

Monitor application performance:

```bash
# View CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 300 \
  --statistics Average
```

### Auto Scaling Policies

Two scaling policies are configured:

1. **CPU-based scaling**: Scale when CPU > 70%
2. **Request count scaling**: Scale when ALB requests > 1000/target

### CloudWatch Alarms

Configured alarms:

- `exp-3-2-3-asg-min-instances`: Alert when ASG below minimum
- `exp-3-2-3-alb-unhealthy-hosts`: Alert when unhealthy targets exist

## Troubleshooting

### Instances not launching

```bash
# Check Auto Scaling Group
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names exp-3-2-3-asg \
  --region us-east-1

# View launch errors
aws autoscaling describe-scaling-activities \
  --auto-scaling-group-name exp-3-2-3-asg \
  --region us-east-1
```

### Application not responding

```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --region us-east-1

# View EC2 instance logs
aws ssm start-session --target i-xxxxx
sudo tail -f /var/log/deployment.log
```

### Terraform errors

```bash
# Validate configuration
cd terraform
terraform validate

# Format check
terraform fmt -check -recursive .

# Plan with verbose output
terraform plan -var="project_name=exp-3-2-3" -var="aws_region=us-east-1"
```

## Cost Optimization

### Recommended Settings for Cost Savings

```hcl
instance_type      = "t3.small"      # Use t3 burstable instances
min_instances      = 1               # Reduce minimum
desired_instances  = 1               # Reduce desired
max_instances      = 3               # Reduce maximum
```

### Estimated Monthly Costs (us-east-1)

- **EC2 (t3.medium × 2)**: ~$60
- **ALB**: ~$20
- **Data Transfer**: ~$10
- **CloudWatch**: ~$5
- **Total**: ~$95/month

## Security Best Practices

### Implemented

✅ EC2 instances in private subnets
✅ NAT Gateway for outbound traffic
✅ Security groups with minimal permissions
✅ HTTPS/TLS support
✅ Health checks and auto-recovery
✅ IAM roles with least privilege

### Recommendations

1. Enable AWS WAF on ALB
2. Use AWS Secrets Manager for credentials
3. Enable VPC Flow Logs
4. Implement CloudTrail logging
5. Use AWS KMS for encryption
6. Enable S3 versioning for Terraform state

## Cleanup

To destroy all resources and stop incurring charges:

```bash
bash scripts/cleanup.sh exp-3-2-3 us-east-1
```

This will destroy all AWS resources created by Terraform.

## API Endpoints

### Health & Status

- `GET /health`: Application health status
- `GET /ready`: Readiness probe
- `GET /version`: Application version

### API

- `GET /api/echo?message=text`: Echo service
- `GET /api/stats`: Application statistics
- `POST /api/init`: Initialize database

### Example Requests

```bash
# Health check
curl http://localhost:3000/health

# Echo endpoint
curl "http://localhost:3000/api/echo?message=HelloWorld"

# Get statistics
curl http://localhost:3000/api/stats

# Initialize database
curl -X POST http://localhost:3000/api/init
```

## Documentation

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Auto Scaling](https://docs.aws.amazon.com/autoscaling/)
- [Docker Documentation](https://docs.docker.com/)
- [Express.js Guide](https://expressjs.com/)

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `npm test`
4. Submit pull request

## License

MIT License - See LICENSE file

## Support

For issues or questions:
1. Check troubleshooting section
2. Review CloudWatch logs
3. Check AWS console for resource status
4. Open GitHub issue

---

**Last Updated**: April 2026
**Version**: 1.0.0
