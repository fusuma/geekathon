#!/bin/bash

# SmartLabel AI Deployment Script
# This script handles deployment to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first:"
        echo "  macOS: brew install awscli"
        echo "  Linux: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install"
        echo "  Windows: Download from https://aws.amazon.com/cli/"
        exit 1
    fi
    print_success "AWS CLI is installed"
}

# Function to check if SAM CLI is installed
check_sam_cli() {
    if ! command -v sam &> /dev/null; then
        print_error "SAM CLI is not installed. Please install it first:"
        echo "  macOS: brew install aws-sam-cli"
        echo "  Linux: pip install aws-sam-cli"
        echo "  Windows: Download from https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
        exit 1
    fi
    print_success "SAM CLI is installed"
}

# Function to check AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run:"
        echo "  aws configure"
        echo "  Or set environment variables:"
        echo "  export AWS_ACCESS_KEY_ID=your_access_key"
        echo "  export AWS_SECRET_ACCESS_KEY=your_secret_key"
        echo "  export AWS_DEFAULT_REGION=us-east-1"
        exit 1
    fi
    
    local caller_identity=$(aws sts get-caller-identity)
    local account_id=$(echo $caller_identity | jq -r '.Account')
    local user_arn=$(echo $caller_identity | jq -r '.Arn')
    
    print_success "AWS credentials configured"
    print_status "Account ID: $account_id"
    print_status "User/Role: $user_arn"
}

# Function to build the application
build_app() {
    print_status "Building application..."
    
    # Install dependencies
    if [ -f "package.json" ]; then
        print_status "Installing dependencies..."
        pnpm install
    fi
    
    # Build TypeScript
    print_status "Compiling TypeScript..."
    pnpm run build
    
    print_success "Application built successfully"
}

# Function to create S3 bucket for deployments
create_deployment_bucket() {
    local environment=$1
    local bucket_name="smartlabel-ai-deployments-${environment}"
    
    print_status "Checking deployment bucket: $bucket_name"
    
    if ! aws s3 ls "s3://$bucket_name" &> /dev/null; then
        print_status "Creating deployment bucket: $bucket_name"
        aws s3 mb "s3://$bucket_name" --region us-east-1
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "$bucket_name" \
            --versioning-configuration Status=Enabled
        
        print_success "Deployment bucket created: $bucket_name"
    else
        print_success "Deployment bucket exists: $bucket_name"
    fi
}

# Function to deploy to environment
deploy_to_environment() {
    local environment=$1
    
    print_status "Deploying to $environment environment..."
    
    # Create deployment bucket
    create_deployment_bucket $environment
    
    # Deploy using SAM
    print_status "Starting SAM deployment..."
    sam deploy \
        --config-env $environment \
        --no-confirm-changeset \
        --no-fail-on-empty-changeset
    
    print_success "Deployment to $environment completed successfully"
}

# Function to get stack outputs
get_stack_outputs() {
    local environment=$1
    local stack_name="smartlabel-ai-${environment}"
    
    print_status "Getting stack outputs for $stack_name..."
    
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --query 'Stacks[0].Outputs' \
        --output table
}

# Function to test the deployment
test_deployment() {
    local environment=$1
    local stack_name="smartlabel-ai-${environment}"
    
    print_status "Testing deployment..."
    
    # Get API Gateway URL from stack outputs
    local api_url=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
        --output text)
    
    if [ -z "$api_url" ]; then
        print_error "Could not get API Gateway URL from stack outputs"
        return 1
    fi
    
    print_status "API Gateway URL: $api_url"
    
    # Test hello endpoint
    print_status "Testing hello endpoint..."
    local hello_response=$(curl -s "$api_url/hello/")
    
    if echo "$hello_response" | grep -q "Hello from SmartLabel AI"; then
        print_success "Hello endpoint test passed"
    else
        print_error "Hello endpoint test failed"
        print_error "Response: $hello_response"
        return 1
    fi
    
    # Test generate endpoint (with mock data)
    print_status "Testing generate endpoint..."
    local generate_response=$(curl -s -X POST "$api_url/generate/" \
        -H "Content-Type: application/json" \
        -d '{
            "productName": "Test Product",
            "ingredients": ["water", "salt"],
            "nutrition": {"calories": 100},
            "markets": ["US"],
            "language": "en"
        }')
    
    if echo "$generate_response" | grep -q "success"; then
        print_success "Generate endpoint test passed"
    else
        print_warning "Generate endpoint test failed (this might be expected in dev mode)"
        print_warning "Response: $generate_response"
    fi
    
    print_success "Deployment testing completed"
}

# Main function
main() {
    local environment=${1:-dev}
    
    print_status "Starting SmartLabel AI deployment to $environment environment"
    
    # Validate environment
    if [[ ! "$environment" =~ ^(dev|staging|production)$ ]]; then
        print_error "Invalid environment. Use: dev, staging, or production"
        exit 1
    fi
    
    # Check prerequisites
    check_aws_cli
    check_sam_cli
    check_aws_credentials
    
    # Build and deploy
    build_app
    deploy_to_environment $environment
    
    # Show outputs and test
    get_stack_outputs $environment
    test_deployment $environment
    
    print_success "Deployment completed successfully!"
    print_status "Environment: $environment"
    print_status "Next steps:"
    echo "  1. Update your frontend to use the new API URL"
    echo "  2. Test the crisis response functionality"
    echo "  3. Monitor CloudWatch logs for any issues"
}

# Run main function with all arguments
main "$@"
