#!/bin/bash

# SmartLabel AI - Nutrition Label Generator Backend Startup Script

echo "🚀 Starting SmartLabel AI Nutrition Label Generator Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/api_server.py" ]; then
    echo "❌ Please run this script from the nutrition-label-generator directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check AWS credentials
echo "🔑 Checking AWS credentials..."
if [ -z "$AWS_ACCESS_KEY_ID" ] && [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "⚠️  AWS credentials not found in environment variables."
    echo "   Please configure AWS credentials using one of these methods:"
    echo "   1. Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION"
    echo "   2. AWS CLI: aws configure"
    echo "   3. IAM roles (if running on AWS)"
    echo ""
    echo "   The backend will start but may fail when generating labels."
fi

# Set default environment variables if not set
export BEDROCK_REGION=${BEDROCK_REGION:-us-east-1}
export BEDROCK_MODEL_ID=${BEDROCK_MODEL_ID:-anthropic.claude-3-5-sonnet-20241022-v2:0}
export PORT=${PORT:-5001}
export DEBUG=${DEBUG:-true}

echo "🌍 Environment Configuration:"
echo "   AWS Region: $BEDROCK_REGION"
echo "   Bedrock Model: $BEDROCK_MODEL_ID"
echo "   Port: $PORT"
echo "   Debug: $DEBUG"
echo ""

# Start the Flask server
echo "🎯 Starting Flask API server on port $PORT..."
echo "   API will be available at: http://localhost:$PORT"
echo "   Health check: http://localhost:$PORT/health"
echo "   Generate label: http://localhost:$PORT/api/nutrition/generate-label"
echo ""
echo "💡 To stop the server, press Ctrl+C"
echo ""

cd backend
python api_server.py
