# Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [AWS Deployment](#aws-deployment)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Cost Management](#cost-management)

## Prerequisites

### Software Requirements

```bash
# Check versions
terraform version        # 1.5.0+
aws --version           # 2.0+
docker version          # 20.10+
docker-compose version  # 1.29+
node --version          # 18.0+
npm --version           # 9.0+
git --version           # 2.0+
```

### AWS Account Setup

1. **Create AWS Account**
   - Go to https://aws.amazon.com/
   - Sign up for new account or use existing

2. **Create IAM User** (recommended for security)
   - Go to IAM console
   - Create new user with programmatic access
   - Attach policy: `AdministratorAccess` (or more restrictive)
   - Save Access Key ID and Secret Access Key

3. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter Access Key ID
   # Enter Secret Access Key
   # Enter default region: us-east-1
   # Enter default output format: json
   ```

4. **Verify Configuration**
   ```bash
   aws sts get-caller-identity
   ```

## Local Setup

### Step 1: Clone and Navigate

```bash
cd "x:\EXP 9"
```

### Step 2: Install Dependencies

```bash
# Install Node dependencies
cd app
npm install
cd ..

# Verify Docker installation
docker ps
docker-compose --version
```

### Step 3: Setup Development Environment

```bash
# Run setup script
bash scripts/setup-dev.sh
```

This will:
- Install dependencies
- Generate SSL certificates
- Build Docker images
- Start all services

### Step 4: Verify Local Setup

```bash
# Check if services are running
docker-compose -f docker/docker-compose.yml ps

# Test application endpoints
curl http://localhost:3000/health
curl http://localhost:3000/version
curl "http://localhost:3000/api/echo?message=test"

# Check database
docker-compose -f docker/docker-compose.yml exec postgres psql -U appuser -d appdb -c "SELECT 1"
```

### Step 5: Run Tests

```bash
cd app
npm test
npm run lint
cd ..
```

## AWS Deployment

### Phase 1: Preparation

#### 1.1 Create SSH Key Pair (Optional but Recommended)

```bash
# Create key pair for EC2 access
aws ec2 create-key-pair --key-name exp-3-2-3-key --region us-east-1 \
  --query 'KeyMaterial' --output text > exp-3-2-3-key.pem

# Set proper permissions
chmod 400 exp-3-2-3-key.pem

# Test access (after deployment)
ssh -i exp-3-2-3-key.pem ec2-user@<instance-ip>
```

#### 1.2 Create ECR Repository (Optional for custom images)

```bash
# Create ECR repository
aws ecr create-repository --repository-name exp-3-2-3 --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
```

#### 1.3 Update Terraform Configuration

```bash
cd terraform

# Review default values
cat terraform.tfvars

# Update if needed (optional)
# nano terraform.tfvars
```

### Phase 2: Infrastructure Deployment

#### 2.1 Initialize Terraform

```bash
cd terraform

# Initialize Terraform working directory
terraform init

# Validate configuration
terraform validate

# Check for syntax errors
terraform fmt -check -recursive .
```

#### 2.2 Plan Deployment

```bash
# Create deployment plan
terraform plan -out=tfplan \
  -var="project_name=exp-3-2-3" \
  -var="aws_region=us-east-1" \
  -var="instance_type=t3.medium"

# Review plan output
terraform show tfplan
```

#### 2.3 Apply Deployment

```bash
# Apply the plan
terraform apply tfplan

# Confirm with 'yes' when prompted

# Get outputs
terraform output
```

**Expected Output:**
```
alb_dns_name = "exp-3-2-3-alb-123456789.us-east-1.elb.amazonaws.com"
autoscaling_group_name = "exp-3-2-3-asg"
vpc_id = "vpc-xxxxxxxxx"
```

#### 2.4 Verify Infrastructure

```bash
# Check VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=exp-3-2-3-vpc" \
  --region us-east-1

# Check Auto Scaling Group
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names exp-3-2-3-asg --region us-east-1

# Check Load Balancer
aws elbv2 describe-load-balancers \
  --region us-east-1 | grep exp-3-2-3-alb
```

### Phase 3: Application Deployment

#### 3.1 Build Docker Image

```bash
# Build image with custom tag
docker build -f docker/Dockerfile \
  -t myapp:latest \
  -t myapp:$(git rev-parse --short HEAD) \
  app/

# Verify image
docker images | grep myapp
```

#### 3.2 Push to Registry (Optional)

```bash
# Get ECR repository URL
REPO_URL=$(aws ecr describe-repositories --repository-names exp-3-2-3 \
  --query 'repositories[0].repositoryUri' --output text --region us-east-1)

# Tag image
docker tag myapp:latest $REPO_URL:latest

# Push to ECR
docker push $REPO_URL:latest
```

#### 3.3 Update Auto Scaling Group (If using custom image)

```bash
# Create new launch template with updated image
# This step depends on your image registry

# Rolling update (graceful)
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name exp-3-2-3-asg \
  --preferences '{"MinHealthyPercentage": 50}' \
  --region us-east-1
```

## Verification

### Step 1: Get ALB DNS Name

```bash
# Method 1: From Terraform
cd terraform
ALB_DNS=$(terraform output -raw alb_dns_name)

# Method 2: From AWS CLI
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --region us-east-1 \
  --query 'LoadBalancers[?LoadBalancerName==`exp-3-2-3-alb`].DNSName' \
  --output text)

echo $ALB_DNS
```

### Step 2: Test Endpoints

```bash
# Health check
curl http://$ALB_DNS/health

# Version endpoint
curl http://$ALB_DNS/version

# Echo endpoint
curl "http://$ALB_DNS/api/echo?message=HelloAWS"
```

### Step 3: Monitor Metrics

```bash
# Check CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region us-east-1

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn $(cd terraform && terraform output -raw target_group_arn) \
  --region us-east-1
```

### Step 4: View Logs

```bash
# CloudWatch logs
aws logs tail /aws/autoscaling/exp-3-2-3-asg --follow --region us-east-1

# EC2 instance logs (via SSM)
aws ssm start-session --target <instance-id> --region us-east-1
sudo tail -f /var/log/deployment.log
```

## Troubleshooting

### Issue: Instances not launching

**Symptoms:**
- No instances in ASG
- Scaling activities show errors

**Solution:**
```bash
# Check ASG status
aws autoscaling describe-scaling-activities \
  --auto-scaling-group-name exp-3-2-3-asg \
  --max-records 5 \
  --region us-east-1

# Check security group
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=exp-3-2-3-ec2-sg" \
  --region us-east-1

# Check IAM role
aws iam get-role --role-name exp-3-2-3-ec2-role
```

### Issue: Application not responding

**Symptoms:**
- ALB returns 503 or 504
- Health checks failing

**Solution:**
```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <tg-arn> \
  --region us-east-1

# SSH into instance
ssh -i exp-3-2-3-key.pem ec2-user@<instance-ip>

# Check Docker status
docker ps
docker logs <container-id>

# Check application logs
sudo tail -f /var/log/deployment.log
```

### Issue: High costs

**Symptoms:**
- Unexpected AWS charges
- Auto-scaling creating many instances

**Solution:**
```bash
# Reduce instance count
cd terraform
terraform apply -var="max_instances=3" -var="desired_instances=1"

# Use cheaper instance types
terraform apply -var="instance_type=t3.small"

# Set up cost alerts
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json
```

## Cost Management

### Estimated Monthly Costs

| Component | Quantity | Unit Cost | Monthly |
|-----------|----------|-----------|---------|
| EC2 (t3.medium) | 2-6 | $0.0416/hr | $60-180 |
| ALB | 1 | $0.0225/hr | ~$16 |
| Data Transfer | 100 GB | $0.09/GB | ~$9 |
| CloudWatch | Logs | Varies | ~$5 |
| **Total** | | | **~$90-210** |

### Cost Optimization Tips

```bash
# 1. Use smaller instance types
terraform apply -var="instance_type=t3.micro"

# 2. Reduce desired capacity
terraform apply -var="desired_instances=1"

# 3. Enable termination protection only when needed
aws autoscaling update-auto-scaling-group \
  --auto-scaling-group-name exp-3-2-3-asg \
  --region us-east-1

# 4. Use reserved instances for stable workloads
# 5. Set up CloudWatch alarms for cost monitoring
```

## Cleanup

To remove all resources and stop incurring charges:

```bash
# Navigate to workspace
cd "x:\EXP 9"

# Run cleanup script
bash scripts/cleanup.sh exp-3-2-3 us-east-1

# Or manually
cd terraform
terraform destroy
```

**Important**: Verify all resources are deleted:

```bash
# Check instances
aws ec2 describe-instances --region us-east-1 | grep exp-3-2-3

# Check load balancers
aws elbv2 describe-load-balancers --region us-east-1 | grep exp-3-2-3

# Check ASG
aws autoscaling describe-auto-scaling-groups --region us-east-1 | grep exp-3-2-3
```

## Post-Deployment Checklist

- [ ] Terraform deployment successful
- [ ] EC2 instances running and healthy
- [ ] Load balancer routing traffic
- [ ] Health checks passing
- [ ] Application endpoints responding
- [ ] CloudWatch metrics being collected
- [ ] Auto-scaling configured and working
- [ ] Backup strategy in place
- [ ] Monitoring and alarms configured
- [ ] Documentation updated

## Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated**: April 2026
**Version**: 1.0.0
