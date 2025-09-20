#!/bin/bash

# Configure CloudFront for complete SPA support
# Redirect both 403 and 404 errors to index.html for client-side routing

DISTRIBUTION_ID="E12XL2DUMYY3FZ"

echo "Configuring CloudFront for complete SPA support..."

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > temp-config.json
ETAG=$(jq -r '.ETag' temp-config.json)
CONFIG=$(jq '.DistributionConfig' temp-config.json)

# Add custom error responses for both 403 and 404 to index.html
UPDATED_CONFIG=$(echo $CONFIG | jq '.CustomErrorResponses = {
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
}')

# Update the distribution
aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config "$UPDATED_CONFIG" --if-match $ETAG

# Clean up
rm temp-config.json

echo "CloudFront distribution $DISTRIBUTION_ID updated for complete SPA support."
echo "Both 403 and 404 errors will redirect to index.html for client-side routing."
echo "Wait 5-10 minutes for changes to propagate."
