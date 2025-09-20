#!/bin/bash

echo "🌐 Creating CloudFront distribution for frontend..."

# Configuration
BUCKET_NAME="smartlabel-ai-frontend-1758390616"
REGION="us-east-1"

# Create CloudFront distribution
DISTRIBUTION_CONFIG=$(cat <<EOF
{
  "CallerReference": "smartlabel-ai-$(date +%s)",
  "Comment": "SmartLabel AI Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-smartlabel-ai-frontend",
        "DomainName": "${BUCKET_NAME}.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-smartlabel-ai-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF
)

echo "Creating CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config "$DISTRIBUTION_CONFIG" --region $REGION --query 'Distribution.Id' --output text)

if [ $? -eq 0 ]; then
    echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"
    echo "🌐 Distribution URL: https://$DISTRIBUTION_ID.cloudfront.net"
    echo "⏳ Note: It may take 10-15 minutes for the distribution to be fully deployed"
else
    echo "❌ Failed to create CloudFront distribution"
    exit 1
fi
