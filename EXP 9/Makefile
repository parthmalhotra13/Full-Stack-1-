.PHONY: help setup dev test build deploy destroy clean logs

PROJECT_NAME ?= exp-3-2-3
AWS_REGION ?= us-east-1
ENVIRONMENT ?= dev

help:
	@echo "Experiment 3.2.3 - AWS Deployment with Load Balancing"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Development Targets:"
	@echo "  setup              Setup local development environment"
	@echo "  dev                Start development servers"
	@echo "  test               Run application tests"
	@echo "  build              Build Docker image"
	@echo "  lint               Run code linting"
	@echo ""
	@echo "Deployment Targets:"
	@echo "  tf-init            Initialize Terraform"
	@echo "  tf-validate        Validate Terraform configuration"
	@echo "  tf-plan            Plan infrastructure changes"
	@echo "  tf-apply           Apply infrastructure changes"
	@echo "  deploy             Full deployment"
	@echo ""
	@echo "Cleanup Targets:"
	@echo "  destroy            Destroy AWS infrastructure"
	@echo "  clean              Remove local artifacts"
	@echo ""
	@echo "Monitoring Targets:"
	@echo "  logs               View application logs"
	@echo "  status             Show infrastructure status"
	@echo ""
	@echo "Variables:"
	@echo "  PROJECT_NAME       Project name (default: exp-3-2-3)"
	@echo "  AWS_REGION         AWS region (default: us-east-1)"
	@echo "  ENVIRONMENT        Environment (default: dev)"

# Development Targets

setup:
	bash scripts/setup-dev.sh

dev:
	docker-compose -f docker/docker-compose.yml up

down:
	docker-compose -f docker/docker-compose.yml down

restart:
	docker-compose -f docker/docker-compose.yml restart

test:
	cd app && npm test

lint:
	cd app && npm run lint

build:
	docker build -f docker/Dockerfile -t $(PROJECT_NAME):latest .

build-no-cache:
	docker build -f docker/Dockerfile --no-cache -t $(PROJECT_NAME):latest .

# Terraform Targets

tf-init:
	cd terraform && terraform init

tf-validate:
	cd terraform && terraform validate

tf-fmt:
	cd terraform && terraform fmt -recursive .

tf-fmt-check:
	cd terraform && terraform fmt -check -recursive .

tf-plan:
	cd terraform && terraform plan \
		-var="project_name=$(PROJECT_NAME)" \
		-var="aws_region=$(AWS_REGION)" \
		-out=tfplan

tf-show:
	cd terraform && terraform show tfplan

tf-apply:
	cd terraform && terraform apply tfplan

tf-destroy:
	cd terraform && terraform destroy \
		-var="project_name=$(PROJECT_NAME)" \
		-var="aws_region=$(AWS_REGION)"

tf-output:
	cd terraform && terraform output

# Deployment Targets

deploy: tf-init tf-validate tf-plan
	@echo "Deploying to $(ENVIRONMENT) environment..."
	bash scripts/deploy.sh $(PROJECT_NAME) $(AWS_REGION) $(ENVIRONMENT)

destroy:
	@echo "Destroying infrastructure..."
	bash scripts/cleanup.sh $(PROJECT_NAME) $(AWS_REGION)

# Cleanup

clean:
	rm -rf dist/
	rm -rf node_modules/
	rm -rf coverage/
	find . -name "*.log" -delete
	find . -name ".DS_Store" -delete

clean-docker:
	docker-compose -f docker/docker-compose.yml down -v
	docker system prune -f

clean-all: clean clean-docker
	rm -rf terraform/.terraform/
	rm -rf terraform/tfplan
	rm -rf terraform/terraform.tfstate*

# Monitoring

logs:
	docker-compose -f docker/docker-compose.yml logs -f

status:
	cd terraform && terraform output

health:
	curl -f http://localhost:3000/health && echo "\n✓ Application is healthy" || echo "\n✗ Application is not healthy"

# Utility

install-deps:
	cd app && npm install

update-deps:
	cd app && npm update

security-audit:
	cd app && npm audit

security-audit-fix:
	cd app && npm audit fix

# AWS Utilities

aws-login:
	@echo "Configuring AWS credentials..."
	aws configure

get-alb-dns:
	@cd terraform && terraform output -raw alb_dns_name 2>/dev/null || echo "ALB DNS not found. Run 'make deploy' first."

get-asg-name:
	@cd terraform && terraform output -raw autoscaling_group_name 2>/dev/null || echo "ASG name not found. Run 'make deploy' first."

# Git Targets

git-setup:
	git config user.email "developer@example.com"
	git config user.name "Developer"

git-commit-message:
	@echo "Commit message format:"
	@echo "  feat: Add new feature"
	@echo "  fix: Fix bug"
	@echo "  docs: Update documentation"
	@echo "  style: Code style changes"
	@echo "  refactor: Refactor code"
	@echo "  perf: Performance improvements"
	@echo "  test: Add/update tests"
	@echo "  chore: Maintenance tasks"
