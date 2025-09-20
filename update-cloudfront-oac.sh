#!/bin/bash

# Update CloudFront distribution to use Origin Access Control

DISTRIBUTION_ID="E12XL2DUMYY3FZ"
OAC_ID="E1PD3CL7S73U9A"

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > temp-config.json

# Extract ETag and config
ETAG=$(jq -r '.ETag' temp-config.json)
CONFIG=$(jq '.DistributionConfig' temp-config.json)

# Update the origin to use OAC
UPDATED_CONFIG=$(echo $CONFIG | jq '
  .Origins.Items[0].OriginAccessControlId = "'$OAC_ID'" |
  .Origins.Items[0].S3OriginConfig = {
    "OriginAccessIdentity": "",
    "OriginReadTimeout": 30
  }
')

# Update the distribution
aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config "$UPDATED_CONFIG" --if-match $ETAG

# Clean up temporary file
rm temp-config.json

echo "CloudFront distribution $DISTRIBUTION_ID updated to use OAC $OAC_ID."
