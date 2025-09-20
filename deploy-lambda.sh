#!/bin/bash

echo "🚀 Deploying SmartLabel AI to AWS Lambda + S3 + CloudFront"

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

echo -e "${BLUE}📦 Step 4: Configuring S3 for static website hosting...${NC}"
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document 404.html
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to configure S3 website hosting${NC}"
    exit 1
fi
echo -e "${GREEN}✅ S3 configured for static hosting${NC}"

echo -e "${BLUE}📦 Step 5: Setting S3 bucket policy for public read...${NC}"
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to set bucket policy${NC}"
    exit 1
fi
echo -e "${GREEN}✅ S3 bucket policy set${NC}"

echo -e "${BLUE}📦 Step 6: Deploying backend API to Lambda...${NC}"
cd ../../apps/api
sam build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ SAM build failed${NC}"
    exit 1
fi

sam deploy --guided --stack-name $STACK_NAME --region $REGION
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ SAM deploy failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend API deployed to Lambda${NC}"

echo -e "${BLUE}📦 Step 7: Getting deployment URLs...${NC}"
FRONTEND_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text)

echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${YELLOW}Frontend URL: $FRONTEND_URL${NC}"
echo -e "${YELLOW}API URL: $API_URL${NC}"
echo -e "${BLUE}📝 Update your frontend API configuration with: $API_URL${NC}"

# Cleanup
rm -f bucket-policy.json

echo -e "${GREEN}✅ All done! Your SmartLabel AI is now live on AWS!${NC}"
