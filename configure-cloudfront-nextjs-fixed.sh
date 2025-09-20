#!/bin/bash

# Configure CloudFront for Next.js static export with proper routing
# This script removes custom error responses to allow direct S3 file serving

DISTRIBUTION_ID="E12XL2DUMYY3FZ"

echo "Configuring CloudFront for Next.js static export..."

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > temp-config.json
ETAG=$(jq -r '.ETag' temp-config.json)
CONFIG=$(jq '.DistributionConfig' temp-config.json)

# Update configuration to remove CustomErrorResponses completely
# This allows CloudFront to serve files directly from S3 without redirects
UPDATED_CONFIG=$(echo $CONFIG | jq '{
  .CustomErrorResponses = {
    "Quantity": 0,
    "Items": []
  }
}')

# Update the distribution
aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config "$UPDATED_CONFIG" --if-match $ETAG

# Clean up
rm temp-config.json

echo "CloudFront distribution $DISTRIBUTION_ID updated for Next.js static export."
echo "Custom error responses removed - CloudFront will now serve files directly from S3."
echo "Wait 5-10 minutes for the changes to propagate, then test the URLs."
