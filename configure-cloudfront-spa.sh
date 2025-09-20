#!/bin/bash

# Configure CloudFront for SPA (Single Page Application) support
# This script adds error pages configuration to redirect 404s to index.html

DISTRIBUTION_ID="E12XL2DUMYY3FZ"

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > temp-config.json

# Extract ETag and config
ETAG=$(jq -r '.ETag' temp-config.json)
CONFIG=$(jq '.DistributionConfig' temp-config.json)

# Add CustomErrorResponses for SPA support
UPDATED_CONFIG=$(echo $CONFIG | jq '
  .CustomErrorResponses = {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
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
echo "Updating CloudFront distribution $DISTRIBUTION_ID for SPA support..."

aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --distribution-config "$UPDATED_CONFIG" \
  --if-match $ETAG

# Clean up
rm temp-config.json

echo "CloudFront distribution updated successfully!"
echo "It may take 5-15 minutes for changes to propagate globally."
