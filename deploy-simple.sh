#!/bin/bash

echo "🚀 Deploying SmartLabel AI to AWS Lambda (Simple Version)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="smartlabel-ai-frontend-$(date +%s)"
REGION="us-east-1"
STACK_NAME="smartlabel-ai-stack"

echo -e "${BLUE}📦 Step 1: Building frontend for static export...${NC}"
cd apps/web
pnpm build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend built successfully${NC}"

echo -e "${BLUE}📦 Step 2: Creating S3 bucket for frontend...${NC}"
aws s3 mb s3://$BUCKET_NAME --region $REGION
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create S3 bucket${NC}"
    exit 1
fi
echo -e "${GREEN}✅ S3 bucket created: $BUCKET_NAME${NC}"

echo -e "${BLUE}📦 Step 3: Uploading frontend to S3...${NC}"
aws s3 sync out/ s3://$BUCKET_NAME --delete
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to upload to S3${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend uploaded to S3${NC}"

echo -e "${BLUE}📦 Step 4: Deploying backend API to Lambda...${NC}"
cd ../../apps/api
sam build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ SAM build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 SAM will ask for configuration. Use these values:${NC}"
echo -e "${YELLOW}   Stack Name: $STACK_NAME${NC}"
echo -e "${YELLOW}   AWS Region: $REGION${NC}"
echo -e "${YELLOW}   Confirm changes: Y${NC}"
echo -e "${YELLOW}   Allow SAM to create IAM roles: Y${NC}"
echo -e "${YELLOW}   Save parameters to config: Y${NC}"

sam deploy --guided --stack-name $STACK_NAME --region $REGION
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ SAM deploy failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend API deployed to Lambda${NC}"

echo -e "${BLUE}📦 Step 5: Getting deployment URLs...${NC}"
FRONTEND_URL="https://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text 2>/dev/null || echo "API URL not found")

echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${YELLOW}Frontend URL: $FRONTEND_URL${NC}"
echo -e "${YELLOW}API URL: $API_URL${NC}"
echo -e "${BLUE}📝 Note: Frontend is accessible via S3 website URL${NC}"
echo -e "${BLUE}📝 For production, consider adding CloudFront distribution${NC}"

echo -e "${GREEN}✅ Your SmartLabel AI is now live on AWS!${NC}"
