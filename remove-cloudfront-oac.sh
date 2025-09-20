#!/bin/bash

# Remove OAC from CloudFront distribution

DISTRIBUTION_ID="E12XL2DUMYY3FZ"

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > temp-config.json

# Extract ETag and config
ETAG=$(jq -r '.ETag' temp-config.json)
CONFIG=$(jq '.DistributionConfig' temp-config.json)

# Remove OAC from origin
UPDATED_CONFIG=$(echo $CONFIG | jq '
  .Origins.Items[0].OriginAccessControlId = "" |
  .Origins.Items[0].S3OriginConfig = {
    "OriginAccessIdentity": "",
    "OriginReadTimeout": 30
  }
')

# Update the distribution
aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config "$UPDATED_CONFIG" --if-match $ETAG

# Clean up temporary file
rm temp-config.json

echo "CloudFront distribution $DISTRIBUTION_ID updated to remove OAC."
