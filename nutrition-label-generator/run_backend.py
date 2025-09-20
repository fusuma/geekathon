#!/usr/bin/env python3
"""
SmartLabel AI Nutrition Label Generator - Backend Startup Script
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.9+"""
    if sys.version_info < (3, 9):
        print("❌ Python 3.9+ is required. Current version:", sys.version)
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = ['flask', 'boto3', 'pillow']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} is installed")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} is missing")
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing_packages)
            print("✅ Dependencies installed successfully")
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            return False
    
    return True

def check_aws_credentials():
    """Check AWS credentials configuration"""
    aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
    aws_region = os.environ.get('AWS_REGION', 'us-east-1')
    
    if aws_access_key and aws_secret_key:
        print(f"✅ AWS credentials found (region: {aws_region})")
        return True
    else:
        print("⚠️  AWS credentials not found in environment variables")
        print("   The nutrition generator will work in mock mode")
        print("   To enable AI features, set:")
        print("   - AWS_ACCESS_KEY_ID")
        print("   - AWS_SECRET_ACCESS_KEY")
        print("   - AWS_REGION (optional, defaults to us-east-1)")
        return False

def run_tests():
    """Run basic tests"""
    print("\n🧪 Running basic tests...")
    try:
        result = subprocess.run([
            sys.executable, 
            'backend/test_label_generator.py'
        ], capture_output=True, text=True, cwd=Path(__file__).parent)
        
        if result.returncode == 0:
            print("✅ Tests passed")
            return True
        else:
            print("❌ Tests failed:")
            print(result.stdout)
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Failed to run tests: {str(e)}")
        return False

def start_server():
    """Start the Flask API server"""
    print("\n🚀 Starting SmartLabel AI Nutrition Label Generator API...")
    
    # Set environment variables for the server
    env = os.environ.copy()
    env['FLASK_APP'] = 'backend/api_server.py'
    env['FLASK_ENV'] = 'development'
    
    try:
        # Start the Flask server
        subprocess.run([
            sys.executable, '-m', 'flask', 'run',
            '--host=0.0.0.0',
            '--port=5001',
            '--debug'
        ], env=env, cwd=Path(__file__).parent)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {str(e)}")

def main():
    """Main startup function"""
    print("🏷️  SmartLabel AI - Nutrition Label Generator")
    print("=" * 50)
    
    # Check requirements
    if not check_python_version():
        return
    
    if not check_dependencies():
        return
    
    aws_configured = check_aws_credentials()
    
    # Run tests
    if not run_tests():
        print("⚠️  Tests failed, but continuing...")
    
    print(f"\n📊 Configuration Summary:")
    print(f"   - Python: {sys.version.split()[0]}")
    print(f"   - AWS Bedrock: {'✅ Enabled' if aws_configured else '⚠️  Mock Mode'}")
    print(f"   - API Port: 5001")
    print(f"   - Health Check: http://localhost:5001/api/nutrition/health")
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()
