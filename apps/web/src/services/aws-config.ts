import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

// Use exact environment variable names from Amplify Console
const awsConfig = {
  region: process.env.VITE_BEDROCK_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || ''
  }
};

export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || process.env.VITE_BEDROCK_REGION || 'us-east-1',
  credentials: awsConfig.credentials
});

export const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || process.env.VITE_BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
export const AWS_REGION = process.env.DEFAULT_REGION || process.env.VITE_REGION || 'us-east-1';

// Debug logging for environment variables
console.log('AWS Configuration:', {
  region: awsConfig.region,
  bedrockRegion: process.env.BEDROCK_REGION || process.env.VITE_BEDROCK_REGION,
  modelId: BEDROCK_MODEL_ID,
  hasCredentials: !!(awsConfig.credentials.accessKeyId && awsConfig.credentials.secretAccessKey)
});
