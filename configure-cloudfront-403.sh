#!/bin/bash

# Configure CloudFront to redirect 403 errors to index.html for SPA support

DISTRIBUTION_ID="E12XL2DUMYY3FZ"

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > temp-config.json

# Extract ETag and config
ETAG=$(jq -r '.ETag' temp-config.json)
CONFIG=$(jq '.DistributionConfig' temp-config.json)

# Add CustomErrorResponses for SPA support - both 403 and 404
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
aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config "$UPDATED_CONFIG" --if-match $ETAG

# Clean up temporary file
rm temp-config.json

echo "CloudFront distribution $DISTRIBUTION_ID updated for SPA support (403 and 404 errors)."
