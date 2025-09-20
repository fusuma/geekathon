#!/bin/bash

# Configure CloudFront for SPA (Single Page Application) support
# This script adds error pages configuration to redirect 404s to index.html
# BUT NOT for existing routes like /login/

DISTRIBUTION_ID="E12XL2DUMYY3FZ"

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > temp-config.json

# Extract ETag and config
ETAG=$(jq -r '.ETag' temp-config.json)
CONFIG=$(jq '.DistributionConfig' temp-config.json)

# Add CustomErrorResponses for SPA support - only for 404s, not 403s
UPDATED_CONFIG=$(echo $CONFIG | jq '
  .CustomErrorResponses = {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html", 
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
')

# Update the distribution
aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config "$UPDATED_CONFIG" --if-match $ETAG

# Clean up temporary file
rm temp-config.json

echo "CloudFront distribution $DISTRIBUTION_ID updated for SPA support (404s only)."
