#!/bin/bash

# Configure CloudFront for Next.js static export with proper routing
# This script sets up CloudFront to handle client-side routing correctly

DISTRIBUTION_ID="E12XL2DUMYY3FZ"

echo "Configuring CloudFront for Next.js static export..."

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > temp-config.json
ETAG=$(jq -r '.ETag' temp-config.json)
CONFIG=$(jq '.DistributionConfig' temp-config.json)

# Update configuration for Next.js static export
# Remove CustomErrorResponses that redirect everything to index.html
# Instead, let CloudFront serve the actual files from S3
UPDATED_CONFIG=$(echo $CONFIG | jq 'del(.CustomErrorResponses)')

# Update the distribution
aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config "$UPDATED_CONFIG" --if-match $ETAG

# Clean up
rm temp-config.json

echo "CloudFront distribution $DISTRIBUTION_ID updated for Next.js static export."
echo "This removes the error page redirects and allows S3 to serve files directly."
echo "Wait 5-10 minutes for the changes to propagate, then test the URLs."
