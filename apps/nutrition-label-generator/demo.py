#!/usr/bin/env python3
"""
SmartLabel AI Nutrition Label Generator - Demo Script
Demonstrates the core functionality without requiring AWS Bedrock
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / 'backend'))

from label_generator import create_sample_product_data, NutritionLabelGenerator
from market_regulations import MarketRegulations
from crisis_response import CrisisResponseManager
from visual_label_creator import NutritionLabelCreator

def demo_market_regulations():
    """Demonstrate market regulations functionality"""
    print("🌍 Market Regulations Demo")
    print("=" * 40)
    
    regulations = MarketRegulations()
    
    # Show all supported markets
    print("Supported Markets:")
    for market in ["spain", "angola", "macau", "brazil", "halal"]:
        reg = regulations.get_regulation(market)
        print(f"  • {market.upper()}: {reg.title} ({reg.language})")
    
    print()

def demo_sample_data():
    """Demonstrate sample data generation"""
    print("📊 Sample Data Demo")
    print("=" * 40)
    
    # Create sample product data
    sample_data = create_sample_product_data()
    
    print(f"Product: {sample_data['name']}")
    print(f"Serving Size: {sample_data['serving_size']}")
    print(f"Calories: {sample_data['calories']} kcal")
    print(f"Ingredients: {sample_data['ingredients'][:100]}...")
    print(f"Target Market: {sample_data.get('market', 'spain')}")
    print(f"Certifications: {', '.join(sample_data.get('certifications', []))}")
    print()

def demo_label_validation():
    """Demonstrate label validation"""
    print("✅ Label Validation Demo")
    print("=" * 40)
    
    generator = NutritionLabelGenerator()
    
    # Test with sample data
    sample_data = create_sample_product_data()
    is_valid, errors = generator.validate_product_data(sample_data)
    
    if is_valid:
        print("✅ Sample product data is valid")
    else:
        print("❌ Sample product data has errors:")
        for error in errors:
            print(f"  • {error}")
    
    print()

def demo_crisis_response():
    """Demonstrate crisis response functionality"""
    print("🚨 Crisis Response Demo")
    print("=" * 40)
    
    crisis_manager = CrisisResponseManager()
    sample_data = create_sample_product_data()
    
    # Show available crisis types
    print("Available Crisis Types:")
    for crisis_type, info in crisis_manager.crisis_types.items():
        print(f"  • {crisis_type.upper()}: {info['description']}")
    
    # Generate crisis communication for Spain
    crisis_data = {
        "crisis_type": "allergen",
        "product_data": sample_data,
        "crisis_details": "Undeclared peanut allergen detected in batch #12345"
    }
    
    communication = crisis_manager.create_crisis_communication(crisis_data, "spain")
    print(f"\nCrisis Communication (Spain):")
    print(f"  Title: {communication['title']}")
    print(f"  Message: {communication['message'][:100]}...")
    print()

def demo_visual_creation():
    """Demonstrate visual label creation (without AWS)"""
    print("🎨 Visual Label Creation Demo")
    print("=" * 40)
    
    creator = NutritionLabelCreator()
    sample_data = create_sample_product_data()
    
    # Calculate label dimensions
    width, height = creator._calculate_label_size(sample_data, "spain", "normal")
    print(f"Label dimensions: {width}x{height} pixels")
    
    # Load fonts
    font_reqs = {"title_font_size": 16, "body_font_size": 12, "allergen_font_size": 10}
    fonts = creator._load_fonts(font_reqs)
    print(f"Fonts loaded: {len(fonts)} font types")
    
    print("Note: Full label generation requires AWS Bedrock integration")
    print()

def demo_api_endpoints():
    """Demonstrate API endpoint configuration"""
    print("🔌 API Endpoints Demo")
    print("=" * 40)
    
    try:
        from api_server import app
        
        # Show available endpoints
        endpoints = []
        for rule in app.url_map.iter_rules():
            if rule.rule.startswith('/api/nutrition/'):
                endpoints.append({
                    'method': list(rule.methods)[0],
                    'path': rule.rule,
                    'endpoint': rule.endpoint
                })
        
        print("Available API Endpoints:")
        for endpoint in endpoints:
            print(f"  • {endpoint['method']} {endpoint['path']}")
        
        print(f"\nTotal endpoints: {len(endpoints)}")
        print("API Server: Run 'python run_backend.py' to start")
        
    except Exception as e:
        print(f"Error loading API server: {e}")
    
    print()

def main():
    """Run all demos"""
    print("🏷️  SmartLabel AI - Nutrition Label Generator Demo")
    print("=" * 60)
    print("This demo shows the core functionality without AWS Bedrock.")
    print("For full AI-powered generation, configure AWS credentials.")
    print("=" * 60)
    print()
    
    try:
        demo_market_regulations()
        demo_sample_data()
        demo_label_validation()
        demo_crisis_response()
        demo_visual_creation()
        demo_api_endpoints()
        
        print("🎉 Demo completed successfully!")
        print()
        print("Next Steps:")
        print("1. Configure AWS credentials for Bedrock access")
        print("2. Run 'python run_backend.py' to start the API server")
        print("3. Test with the React frontend components")
        print("4. Generate actual nutrition labels with AI content")
        
    except Exception as e:
        print(f"❌ Demo failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
