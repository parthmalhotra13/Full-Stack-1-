# Quick Reference Guide

## Essential Commands

### Local Development
```bash
# Setup local environment
bash scripts/setup-dev.sh

# Start development
docker-compose -f docker/docker-compose.yml up

# Stop services
docker-compose -f docker/docker-compose.yml down

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Run tests
cd app && npm test

# Build Docker image
docker build -f docker/Dockerfile -t myapp:latest app/
```

### AWS Deployment
```bash
# Configure AWS
aws configure

# Initialize Terraform
cd terraform && terraform init

# Validate configuration
terraform validate

# Plan deployment
terraform plan

# Deploy infrastructure
terraform apply

# View outputs
terraform output

# Get ALB DNS
terraform output alb_dns_name

# Cleanup resources
terraform destroy
```

### Using Makefile
```bash
make help              # Show all available commands
make setup             # Setup local environment
make dev               # Start development
make test              # Run tests
make build             # Build Docker image
make tf-init           # Initialize Terraform
make tf-plan           # Plan infrastructure
make deploy            # Deploy to AWS
make destroy           # Destroy resources
make logs              # View logs
```

## Testing Endpoints

### Local
```bash
curl http://localhost:3000/health
curl http://localhost:3000/version
curl "http://localhost:3000/api/echo?message=hello"
curl http://localhost:3000/api/stats
```

### AWS (after deployment)
```bash
# Get ALB DNS
ALB_DNS=$(cd terraform && terraform output -raw alb_dns_name)

# Test endpoints
curl http://$ALB_DNS/health
curl http://$ALB_DNS/version
curl "http://$ALB_DNS/api/echo?message=hello"
```

## File Locations

| File | Purpose |
|------|---------|
| `terraform/main.tf` | VPC and EC2 infrastructure |
| `terraform/autoscaling.tf` | Auto Scaling configuration |
| `app/src/index.ts` | Express.js application |
| `docker/Dockerfile` | Container build |
| `docker/docker-compose.yml` | Development environment |
| `.github/workflows/ci-cd.yml` | CI/CD pipeline |
| `scripts/deploy.sh` | AWS deployment script |
| `scripts/cleanup.sh` | Infrastructure teardown |

## Environment Setup

### Windows (PowerShell)
```powershell
# Check versions
$env:PATH -split ';' | Where-Object {Test-Path $_} | Get-Item

# Install tools
# Download from: https://www.terraform.io/downloads.html
# Download from: https://aws.amazon.com/cli/
# Download from: https://www.docker.com/products/docker-desktop
```

### Verify Installation
```bash
terraform version
aws --version
docker version
docker-compose version
node --version
npm --version
```

## Configuration Files

### Terraform Variables (terraform/terraform.tfvars)
```hcl
project_name = "exp-3-2-3"
aws_region = "us-east-1"
instance_type = "t3.medium"
min_instances = 2
max_instances = 6
desired_instances = 2
```

### Environment Variables (app/.env)
```bash
NODE_ENV=development
PORT=3000
DB_HOST=postgres
DB_USER=appuser
DB_PASSWORD=apppassword
REDIS_HOST=redis
```

## Troubleshooting

### Docker Issues
```bash
# Restart Docker
systemctl restart docker          # Linux
brew services restart docker      # Mac
# Windows: Restart Docker Desktop

# Clean up containers
docker system prune -a

# View logs
docker logs <container-id>
```

### Terraform Issues
```bash
# Validate configuration
terraform validate

# Format check
terraform fmt -check -recursive .

# Debug mode
export TF_LOG=DEBUG
terraform apply

# Refresh state
terraform refresh
```

### AWS Issues
```bash
# Check credentials
aws sts get-caller-identity

# List resources
aws ec2 describe-instances
aws elbv2 describe-load-balancers
aws autoscaling describe-auto-scaling-groups

# View logs
aws logs tail /aws/autoscaling/exp-3-2-3-asg --follow
```

## Performance Tips

### Reduce Costs
```hcl
instance_type = "t3.small"       # Smaller instance
min_instances = 1                 # Fewer instances
max_instances = 3                 # Lower max
desired_instances = 1             # Lower desired
```

### Increase Performance
```hcl
instance_type = "t3.large"        # Larger instance
min_instances = 3                 # More instances
max_instances = 10                # Higher max
desired_instances = 5             # Higher desired
```

## Useful AWS CLI Commands

```bash
# EC2 Instances
aws ec2 describe-instances --region us-east-1
aws ec2 terminate-instances --instance-ids <id> --region us-east-1

# Load Balancer
aws elbv2 describe-load-balancers --region us-east-1
aws elbv2 describe-target-health --target-group-arn <arn> --region us-east-1

# Auto Scaling
aws autoscaling describe-auto-scaling-groups --region us-east-1
aws autoscaling update-auto-scaling-group --auto-scaling-group-name <name> \
  --desired-capacity 3 --region us-east-1

# CloudWatch
aws cloudwatch get-metric-statistics --namespace AWS/EC2 \
  --metric-name CPUUtilization --start-time <start> --end-time <end> \
  --period 300 --statistics Average --region us-east-1

# Logs
aws logs tail /aws/autoscaling/exp-3-2-3-asg --follow --region us-east-1
```

## SSH Access to EC2 (if needed)

```bash
# Create key pair
aws ec2 create-key-pair --key-name exp-3-2-3-key --region us-east-1 \
  --query 'KeyMaterial' --output text > exp-3-2-3-key.pem
chmod 400 exp-3-2-3-key.pem

# Get instance IP
INSTANCE_IP=$(aws ec2 describe-instances --filters \
  "Name=tag:Name,Values=exp-3-2-3-asg-instance" \
  --query 'Reservations[0].Instances[0].PrivateIpAddress' \
  --region us-east-1 --output text)

# SSH into instance (via bastion/NAT)
ssh -i exp-3-2-3-key.pem ec2-user@$INSTANCE_IP
```

## Database Access

```bash
# From local development
docker-compose -f docker/docker-compose.yml exec postgres psql -U appuser -d appdb

# PostgreSQL commands
\dt                    # List tables
\du                    # List users
SELECT * FROM requests; # Query data
\q                     # Quit
```

## Health Check Verification

```bash
# Application health
curl -v http://localhost:3000/health

# Load balancer health
aws elbv2 describe-target-health \
  --target-group-arn <tg-arn> \
  --region us-east-1

# Expected response: healthy
```

## Deployment Status

```bash
# Check infrastructure status
cd terraform
terraform show

# Check if instances are running
aws ec2 describe-instances --filters \
  "Name=tag:Name,Values=exp-3-2-3-asg-instance" \
  "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].InstanceId' \
  --region us-east-1

# Check auto scaling group
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names exp-3-2-3-asg \
  --region us-east-1
```

## Monitoring Commands

```bash
# Real-time monitoring
watch -n 5 'aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names exp-3-2-3-asg --region us-east-1'

# CPU usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --start-time $(date -u -d '30 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region us-east-1
```

## Emergency Procedures

### Stop All Resources
```bash
# Scale down ASG
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name exp-3-2-3-asg \
  --desired-capacity 0 \
  --region us-east-1

# Or destroy completely
terraform destroy -auto-approve
```

### Restart Application
```bash
# Terminate instances (ASG will replace them)
aws ec2 terminate-instances \
  --instance-ids <id1> <id2> \
  --region us-east-1

# Or rolling update
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name exp-3-2-3-asg \
  --region us-east-1
```

## Important URLs

- **Application**: http://localhost:3000 (local) or http://<ALB_DNS> (AWS)
- **NGINX**: http://localhost (local)
- **PostgreSQL**: localhost:5432 (local)
- **Redis**: localhost:6379 (local)
- **AWS Console**: https://aws.amazon.com/console/
- **Terraform Registry**: https://registry.terraform.io/

## Document References

- **README.md**: Complete project documentation
- **DEPLOYMENT_GUIDE.md**: Detailed deployment instructions
- **SETUP_SUMMARY.md**: Complete setup overview
- **Makefile**: All available commands

---

**Quick Reference v1.0**
Last Updated: April 2026
