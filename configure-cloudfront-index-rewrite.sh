#!/bin/bash

# Configure CloudFront to handle directory requests by appending index.html
# This is needed for Next.js static export to work properly

DISTRIBUTION_ID="E12XL2DUMYY3FZ"

echo "Configuring CloudFront for directory index handling..."

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > temp-config.json
ETAG=$(jq -r '.ETag' temp-config.json)
CONFIG=$(jq '.DistributionConfig' temp-config.json)

# Add a cache behavior for login directory that serves login/index.html
UPDATED_CONFIG=$(echo $CONFIG | jq '{
  .CacheBehaviors = {
    "Quantity": 1,
    "Items": [
      {
        "PathPattern": "/login",
        "TargetOriginId": "S3-smartlabel-ai-frontend",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
          "Quantity": 2,
          "Items": ["HEAD", "GET"],
          "CachedMethods": {
            "Quantity": 2,
            "Items": ["HEAD", "GET"]
          }
        },
        "ForwardedValues": {
          "QueryString": false,
          "Cookies": {"Forward": "none"},
          "Headers": {"Quantity": 0},
          "QueryStringCacheKeys": {"Quantity": 0}
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": false,
        "SmoothStreaming": false,
        "DefaultRootObject": "index.html",
        "TrustedSigners": {"Enabled": false, "Quantity": 0},
        "TrustedKeyGroups": {"Enabled": false, "Quantity": 0},
        "LambdaFunctionAssociations": {"Quantity": 0},
        "FunctionAssociations": {"Quantity": 0},
        "FieldLevelEncryptionId": "",
        "GrpcConfig": {"Enabled": false}
      }
    ]
  }
}')

# Update the distribution
aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config "$UPDATED_CONFIG" --if-match $ETAG

# Clean up
rm temp-config.json

echo "CloudFront distribution $DISTRIBUTION_ID updated with login directory handling."
echo "Wait 5-10 minutes for changes to propagate."
