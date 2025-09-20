"""
Test script for SmartLabel AI Nutrition Label Generator
Tests the core functionality without requiring a full Flask server
"""

import sys
import os
import json
from datetime import datetime

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from label_generator import NutritionLabelGenerator, create_sample_product_data
from market_regulations import MarketRegulations
from crisis_response import CrisisResponseManager

def test_market_regulations():
    """Test market regulations functionality"""
    print("🧪 Testing Market Regulations...")
    
    regulations = MarketRegulations()
    
    # Test supported markets
    markets = ["spain", "angola", "macau", "brazil", "halal"]
    for market in markets:
        try:
            regulation = regulations.get_regulation(market)
            print(f"✅ {market.upper()}: {regulation.title} ({regulation.language})")
        except Exception as e:
            print(f"❌ {market.upper()}: Error - {str(e)}")
    
    # Test daily value calculation
    try:
        dv_percentage = regulations.get_daily_value_percentage("total_fat", 10.0, "spain")
        print(f"✅ Daily Value calculation: 10g fat = {dv_percentage}% DV (Spain)")
    except Exception as e:
        print(f"❌ Daily Value calculation failed: {str(e)}")

def test_label_generator():
    """Test nutrition label generation (without AWS Bedrock)"""
    print("\n🧪 Testing Label Generator...")
    
    try:
        generator = NutritionLabelGenerator()
        
        # Test sample data creation
        sample_data = create_sample_product_data()
        print(f"✅ Sample data created: {sample_data['name']}")
        
        # Test validation
        is_valid, errors = generator.validate_product_data(sample_data)
        if is_valid:
            print("✅ Product data validation passed")
        else:
            print(f"❌ Product data validation failed: {errors}")
        
        # Test supported markets
        markets = generator.get_supported_markets()
        print(f"✅ Supported markets: {len(markets)} markets")
        
    except Exception as e:
        print(f"❌ Label generator test failed: {str(e)}")

def test_crisis_response():
    """Test crisis response functionality"""
    print("\n🧪 Testing Crisis Response...")
    
    try:
        crisis_manager = CrisisResponseManager()
        
        # Test crisis types
        crisis_types = ["recall", "allergen", "contamination", "regulatory"]
        for crisis_type in crisis_types:
            crisis_info = crisis_manager.crisis_types.get(crisis_type, {})
            if crisis_info:
                print(f"✅ Crisis type '{crisis_type}': {crisis_info['description']}")
            else:
                print(f"❌ Crisis type '{crisis_type}' not found")
        
        # Test crisis communication
        crisis_data = {
            "crisis_type": "allergen",
            "product_data": {"name": "Test Product"}
        }
        
        communication = crisis_manager.create_crisis_communication(crisis_data, "spain")
        print(f"✅ Crisis communication generated: {communication['title']}")
        
    except Exception as e:
        print(f"❌ Crisis response test failed: {str(e)}")

def test_visual_label_creator():
    """Test visual label creation (without AWS Bedrock)"""
    print("\n🧪 Testing Visual Label Creator...")
    
    try:
        from visual_label_creator import NutritionLabelCreator
        
        creator = NutritionLabelCreator()
        
        # Test label size calculation
        sample_data = create_sample_product_data()
        width, height = creator._calculate_label_size(sample_data, "spain", "normal")
        print(f"✅ Label size calculated: {width}x{height} pixels")
        
        # Test font loading
        font_reqs = {"title_font_size": 16, "body_font_size": 12, "allergen_font_size": 10}
        fonts = creator._load_fonts(font_reqs)
        print(f"✅ Fonts loaded: {len(fonts)} font types")
        
    except Exception as e:
        print(f"❌ Visual label creator test failed: {str(e)}")

def test_api_endpoints():
    """Test API endpoint definitions"""
    print("\n🧪 Testing API Endpoints...")
    
    try:
        from api_server import app
        
        # Get all routes
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'rule': str(rule)
            })
        
        print(f"✅ API server configured with {len(routes)} endpoints")
        
        # Check for required endpoints
        required_endpoints = [
            '/api/nutrition/health',
            '/api/nutrition/generate-label',
            '/api/nutrition/batch-generate',
            '/api/nutrition/crisis-response'
        ]
        
        for endpoint in required_endpoints:
            if any(endpoint in route['rule'] for route in routes):
                print(f"✅ Required endpoint found: {endpoint}")
            else:
                print(f"❌ Required endpoint missing: {endpoint}")
        
    except Exception as e:
        print(f"❌ API endpoints test failed: {str(e)}")

def test_sample_data():
    """Test sample data generation"""
    print("\n🧪 Testing Sample Data...")
    
    try:
        sample_data = create_sample_product_data()
        
        # Verify required fields
        required_fields = ['name', 'serving_size', 'calories', 'ingredients']
        for field in required_fields:
            if field in sample_data and sample_data[field]:
                print(f"✅ Sample data has {field}: {sample_data[field]}")
            else:
                print(f"❌ Sample data missing {field}")
        
        # Test JSON serialization
        json_str = json.dumps(sample_data, indent=2)
        parsed_data = json.loads(json_str)
        print(f"✅ Sample data JSON serialization/parsing works")
        
    except Exception as e:
        print(f"❌ Sample data test failed: {str(e)}")

def main():
    """Run all tests"""
    print("🚀 Starting SmartLabel AI Nutrition Label Generator Tests")
    print("=" * 60)
    
    test_market_regulations()
    test_label_generator()
    test_crisis_response()
    test_visual_label_creator()
    test_api_endpoints()
    test_sample_data()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("\n📝 Note: These tests verify core functionality without AWS Bedrock.")
    print("   To test full AI generation, configure AWS credentials and run:")
    print("   python label_generator.py")

if __name__ == "__main__":
    main()
