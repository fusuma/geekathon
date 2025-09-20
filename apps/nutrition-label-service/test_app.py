from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import boto3
import json
import os

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Initialize AWS Bedrock client
try:
    bedrock = boto3.client(
        'bedrock-runtime',
        region_name='us-east-1'
    )
    BEDROCK_AVAILABLE = True
    print("✅ AWS Bedrock client initialized successfully")
except Exception as e:
    print(f"⚠️ AWS Bedrock not available: {e}")
    BEDROCK_AVAILABLE = False

@app.route('/')
def home():
    return jsonify({
        "message": "Nutrition Label Service is running!",
        "endpoints": {
            "generate_label": "POST /generate-label",
            "health": "GET /"
        },
        "bedrock_available": BEDROCK_AVAILABLE
    })

def generate_bedrock_content(product_data):
    """Generate enhanced content using AWS Bedrock Claude"""
    if not BEDROCK_AVAILABLE:
        return {
            "description": f"{product_data.get('product_name', 'Product')} is a carefully crafted product.",
            "claims": "Rich in essential nutrients.",
            "allergen_warning": "Check ingredients for allergens.",
            "storage_instructions": "Store in a cool, dry place.",
            "compliance_note": "Product complies with food regulations."
        }
    
    try:
        # Market-specific language mapping (corrected for real regional languages)
        market_languages = {
            'US': 'English',
            'EU': 'English', 
            'BR': 'Portuguese',
            'AO': 'Portuguese',
            'MO': 'Chinese',  # Macau - Special Administrative Region of China (Chinese/Cantonese)
            'PT': 'Portuguese',
            'ES': 'Spanish',
            'MX': 'Spanish',
            'AR': 'Spanish',
            'FR': 'French',
            'DE': 'German',
            'IT': 'Italian',
            'AE': 'English',  # UAE uses English for international business
            'SA': 'Arabic',
            'CN': 'Chinese',
            'JP': 'Japanese',
            'KR': 'Korean',
            'AU': 'English',
            'CA': 'English',
            'GB': 'English',
            'IN': 'English',
            'HK': 'Chinese',  # Hong Kong - Special Administrative Region of China
            'TW': 'Chinese',  # Taiwan
            'SG': 'English',  # Singapore uses English for business
            'MY': 'English',  # Malaysia uses English for business
            'TH': 'Thai',
            'VN': 'Vietnamese',
            'ID': 'Indonesian',
            'PH': 'English'   # Philippines uses English for business
        }
        
        market = product_data.get('market', 'US')
        language = market_languages.get(market, 'English')
        
        # Prepare enhanced prompt for Claude with specific market context
        prompt = f"""
        You are a professional food labeling expert specializing in international markets. Generate content for a nutrition label with the following specifications:
        
        Product Name: {product_data.get('product_name', 'Product')}
        Ingredients: {product_data.get('ingredients_list', 'Not specified')}
        Target Market: {market}
        Language: {language}
        
        CRITICAL REQUIREMENTS:
        1. ALL content must be in {language} language
        2. Content must comply with {market} food labeling regulations
        3. Use appropriate terminology for {market} market
        4. Consider cultural preferences for {market}
        
        Please provide a JSON response with these exact fields:
        - description: Professional product description in {language}
        - claims: Nutritional claims in {language} (e.g., "Rich in protein", "Low in fat")
        - allergen_warning: Allergen warnings in {language} based on ingredients
        - storage_instructions: Storage instructions in {language}
        - compliance_note: Compliance note for {market} market in {language}
        
        Examples for different markets:
        - US/GB/AU/CA: English content
        - BR/AO/PT: Portuguese content
        - MO/HK/CN/TW: Chinese content (Macau, Hong Kong, China, Taiwan)
        - ES/MX/AR: Spanish content
        - FR: French content
        - DE: German content
        - AE/SG/MY/PH: English content (UAE, Singapore, Malaysia, Philippines use English for business)
        - SA: Arabic content
        - JP: Japanese content
        - KR: Korean content
        - TH: Thai content
        - VN: Vietnamese content
        - ID: Indonesian content
        
        Ensure all text is professional, concise, and culturally appropriate for {market}.
        """
        
        # Call Claude via Bedrock
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }),
            contentType='application/json'
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        content = response_body['content'][0]['text']
        
        # Extract JSON from response
        try:
            # Find JSON in the response
            start = content.find('{')
            end = content.rfind('}') + 1
            json_content = content[start:end]
            return json.loads(json_content)
        except:
            # Fallback if JSON parsing fails
            return {
                "description": f"{product_data.get('product_name', 'Product')} is a carefully crafted product.",
                "claims": "Rich in essential nutrients.",
                "allergen_warning": "Check ingredients for allergens.",
                "storage_instructions": "Store in a cool, dry place.",
                "compliance_note": "Product complies with food regulations."
            }
            
    except Exception as e:
        print(f"Bedrock error: {e}")
        return {
            "description": f"{product_data.get('product_name', 'Product')} is a carefully crafted product.",
            "claims": "Rich in essential nutrients.",
            "allergen_warning": "Check ingredients for allergens.",
            "storage_instructions": "Store in a cool, dry place.",
            "compliance_note": "Product complies with food regulations."
        }

def create_nutrition_label_image(product_data, enhanced_content):
    """Create a professional nutrition label image using PIL"""
    try:
        # Create image with white background
        width, height = 400, 600
        img = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a system font, fallback to default
        try:
            font_large = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
            font_medium = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
            font_small = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 12)
        except:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        y_position = 20
        
        # Title
        draw.text((20, y_position), "NUTRITION FACTS", fill='black', font=font_large)
        y_position += 40
        
        # Product name
        draw.text((20, y_position), product_data.get('product_name', 'Product'), fill='black', font=font_medium)
        y_position += 30
        
        # Serving information
        draw.text((20, y_position), f"Serving size: {product_data.get('serving_size', '1 serving')}", fill='black', font=font_small)
        y_position += 20
        draw.text((20, y_position), f"Servings per container: {product_data.get('servings_per_container', '1')}", fill='black', font=font_small)
        y_position += 30
        
        # Calories
        draw.text((20, y_position), f"Calories: {product_data.get('calories', '0')}", fill='black', font=font_medium)
        y_position += 30
        
        # Nutritional values
        nutritional_values = product_data.get('nutritional_values', {})
        for nutrient, value in nutritional_values.items():
            if isinstance(value, dict) and 'per100g' in value:
                per100g = value['per100g']
                if isinstance(per100g, dict):
                    val = per100g.get('value', 0)
                    unit = per100g.get('unit', 'g')
                    draw.text((20, y_position), f"{nutrient}: {val}{unit}", fill='black', font=font_small)
                    y_position += 20
        
        # Ingredients
        y_position += 20
        draw.text((20, y_position), "Ingredients:", fill='black', font=font_small)
        y_position += 20
        ingredients = product_data.get('ingredients_list', 'Not specified')
        # Wrap long ingredients text
        words = ingredients.split()
        line = ""
        for word in words:
            if len(line + word) < 40:
                line += word + " "
            else:
                draw.text((20, y_position), line.strip(), fill='black', font=font_small)
                y_position += 15
                line = word + " "
        if line:
            draw.text((20, y_position), line.strip(), fill='black', font=font_small)
        
        # Enhanced content from Bedrock
        y_position += 30
        draw.text((20, y_position), "Product Description:", fill='black', font=font_small)
        y_position += 20
        desc = enhanced_content.get('description', '')
        words = desc.split()
        line = ""
        for word in words:
            if len(line + word) < 40:
                line += word + " "
            else:
                draw.text((20, y_position), line.strip(), fill='black', font=font_small)
                y_position += 15
                line = word + " "
        if line:
            draw.text((20, y_position), line.strip(), fill='black', font=font_small)
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return image_base64
        
    except Exception as e:
        print(f"Image generation error: {e}")
        # Return a simple error image
        img = Image.new('RGB', (400, 200), 'lightgray')
        draw = ImageDraw.Draw(img)
        draw.text((50, 100), "Error generating image", fill='red')
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        return base64.b64encode(buffer.getvalue()).decode()

@app.route('/generate-label', methods=['POST', 'OPTIONS'])
def generate_label():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        print("Received data:", data)
        
        if not data or 'product_data' not in data:
            return jsonify({'success': False, 'error': 'Invalid data format'}), 400
        
        product_data = data['product_data']
        
        # Generate enhanced content using Bedrock
        enhanced_content = generate_bedrock_content(product_data)
        print("Enhanced content:", enhanced_content)
        
        # Create nutrition label image
        image_base64 = create_nutrition_label_image(product_data, enhanced_content)
        
        return jsonify({
            'success': True,
            'image_base64': image_base64,
            'enhanced_content': enhanced_content,
            'bedrock_used': BEDROCK_AVAILABLE
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)