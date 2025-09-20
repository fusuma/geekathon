from flask import Flask, request, jsonify, send_file
import boto3
import json
import base64
from io import BytesIO
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image, ImageDraw, ImageFont
import os
from datetime import datetime

app = Flask(__name__)

# Configure AWS Bedrock
bedrock_client = boto3.client(
    'bedrock-runtime',
    region_name='us-east-1'
)

def generate_nutrition_content_with_bedrock(product_data):
    """Generate nutrition content using AWS Bedrock Claude"""
    
    # Prepare the prompt for Claude
    prompt = f"""
    You are a nutrition expert creating a nutrition facts label for a food product.
    
    Product Information:
    - Name: {product_data.get('product_name', 'Product')}
    - Market: {product_data.get('market', 'US')}
    - Serving Size: {product_data.get('serving_size', '1 serving')}
    - Servings per Container: {product_data.get('servings_per_container', '1')}
    
    Nutritional Values:
    {json.dumps(product_data.get('nutritional_values', {}), indent=2)}
    
    Please generate a professional nutrition facts label with the following structure:
    1. Standard nutrition facts header
    2. Serving information
    3. Calories prominently displayed
    4. Nutritional values with proper formatting
    5. Ingredients list
    6. Any required disclaimers for the {product_data.get('market', 'US')} market
    
    Return the response as a structured JSON object with:
    - header: "Nutrition Facts"
    - serving_info: serving size and servings per container
    - calories: calorie amount
    - nutrients: list of nutrients with values and units
    - ingredients: formatted ingredients list
    - disclaimers: any required market-specific disclaimers
    
    Make it professional and compliant with {product_data.get('market', 'US')} regulations.
    """
    
    try:
        # Call AWS Bedrock Claude
        response = bedrock_client.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2000,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        content = response_body['content'][0]['text']
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_content = content[start_idx:end_idx]
                return json.loads(json_content)
            else:
                # Fallback: create structured response
                return {
                    "header": "Nutrition Facts",
                    "serving_info": {
                        "serving_size": product_data.get('serving_size', '1 serving'),
                        "servings_per_container": product_data.get('servings_per_container', '1')
                    },
                    "calories": product_data.get('calories', '0'),
                    "nutrients": [
                        {"name": "Total Fat", "value": product_data.get('nutritional_values', {}).get('totalFat', '0g')},
                        {"name": "Saturated Fat", "value": product_data.get('nutritional_values', {}).get('saturatedFat', '0g')},
                        {"name": "Trans Fat", "value": product_data.get('nutritional_values', {}).get('transFat', '0g')},
                        {"name": "Cholesterol", "value": product_data.get('nutritional_values', {}).get('cholesterol', '0mg')},
                        {"name": "Sodium", "value": product_data.get('nutritional_values', {}).get('sodium', '0mg')},
                        {"name": "Total Carbohydrate", "value": product_data.get('nutritional_values', {}).get('totalCarbohydrate', '0g')},
                        {"name": "Dietary Fiber", "value": product_data.get('nutritional_values', {}).get('dietaryFiber', '0g')},
                        {"name": "Total Sugars", "value": product_data.get('nutritional_values', {}).get('totalSugars', '0g')},
                        {"name": "Protein", "value": product_data.get('nutritional_values', {}).get('protein', '0g')}
                    ],
                    "ingredients": product_data.get('ingredients_list', 'Ingredients not specified'),
                    "disclaimers": f"Manufactured for {product_data.get('market', 'US')} market"
                }
        except json.JSONDecodeError:
            # Fallback response if JSON parsing fails
            return {
                "header": "Nutrition Facts",
                "serving_info": {
                    "serving_size": product_data.get('serving_size', '1 serving'),
                    "servings_per_container": product_data.get('servings_per_container', '1')
                },
                "calories": product_data.get('calories', '0'),
                "nutrients": [
                    {"name": "Total Fat", "value": "0g"},
                    {"name": "Saturated Fat", "value": "0g"},
                    {"name": "Cholesterol", "value": "0mg"},
                    {"name": "Sodium", "value": "0mg"},
                    {"name": "Total Carbohydrate", "value": "0g"},
                    {"name": "Dietary Fiber", "value": "0g"},
                    {"name": "Total Sugars", "value": "0g"},
                    {"name": "Protein", "value": "0g"}
                ],
                "ingredients": product_data.get('ingredients_list', 'Ingredients not specified'),
                "disclaimers": f"Generated for {product_data.get('market', 'US')} market"
            }
            
    except Exception as e:
        print(f"Error calling AWS Bedrock: {e}")
        # Fallback response
        return {
            "header": "Nutrition Facts",
            "serving_info": {
                "serving_size": product_data.get('serving_size', '1 serving'),
                "servings_per_container": product_data.get('servings_per_container', '1')
            },
            "calories": product_data.get('calories', '0'),
            "nutrients": [
                {"name": "Total Fat", "value": "0g"},
                {"name": "Saturated Fat", "value": "0g"},
                {"name": "Cholesterol", "value": "0mg"},
                {"name": "Sodium", "value": "0mg"},
                {"name": "Total Carbohydrate", "value": "0g"},
                {"name": "Dietary Fiber", "value": "0g"},
                {"name": "Total Sugars", "value": "0g"},
                {"name": "Protein", "value": "0g"}
            ],
            "ingredients": product_data.get('ingredients_list', 'Ingredients not specified'),
            "disclaimers": f"Generated for {product_data.get('market', 'US')} market"
        }

def create_nutrition_label_image(nutrition_data, product_name):
    """Create nutrition label image using PIL"""
    
    # Create image with white background
    width, height = 400, 600
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fallback to default if not available
    try:
        # Try different font paths
        font_paths = [
            '/System/Library/Fonts/Arial.ttf',
            '/System/Library/Fonts/Helvetica.ttc',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            'arial.ttf'
        ]
        
        title_font = None
        text_font = None
        
        for font_path in font_paths:
            try:
                title_font = ImageFont.truetype(font_path, 18)
                text_font = ImageFont.truetype(font_path, 12)
                break
            except:
                continue
        
        if not title_font:
            title_font = ImageFont.load_default()
            text_font = ImageFont.load_default()
            
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Draw border
    draw.rectangle([(10, 10), (width-10, height-10)], outline='black', width=2)
    
    y_position = 30
    
    # Draw title
    draw.text((width//2, y_position), nutrition_data.get('header', 'Nutrition Facts'), 
              fill='black', font=title_font, anchor='mm')
    y_position += 40
    
    # Draw product name
    draw.text((width//2, y_position), product_name, 
              fill='black', font=text_font, anchor='mm')
    y_position += 30
    
    # Draw serving information
    serving_info = nutrition_data.get('serving_info', {})
    draw.text((20, y_position), f"Serving size: {serving_info.get('serving_size', '1 serving')}", 
              fill='black', font=text_font)
    y_position += 20
    draw.text((20, y_position), f"Servings per container: {serving_info.get('servings_per_container', '1')}", 
              fill='black', font=text_font)
    y_position += 30
    
    # Draw calories
    calories = nutrition_data.get('calories', '0')
    draw.text((20, y_position), f"Calories {calories}", 
              fill='black', font=title_font)
    y_position += 40
    
    # Draw nutrients
    nutrients = nutrition_data.get('nutrients', [])
    for nutrient in nutrients[:8]:  # Limit to first 8 nutrients
        name = nutrient.get('name', '')
        value = nutrient.get('value', '0g')
        draw.text((20, y_position), name, fill='black', font=text_font)
        draw.text((width-20, y_position), value, fill='black', font=text_font, anchor='ra')
        y_position += 20
    
    # Draw ingredients
    y_position += 20
    ingredients = nutrition_data.get('ingredients', 'Ingredients not specified')
    draw.text((20, y_position), "Ingredients:", fill='black', font=text_font)
    y_position += 20
    
    # Wrap ingredients text
    words = ingredients.split()
    lines = []
    current_line = ""
    
    for word in words:
        test_line = current_line + word + " "
        bbox = draw.textbbox((0, 0), test_line, font=text_font)
        if bbox[2] - bbox[0] < width - 40:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line.strip())
            current_line = word + " "
    
    if current_line:
        lines.append(current_line.strip())
    
    # Draw ingredients lines
    for line in lines[:5]:  # Limit to 5 lines
        if y_position < height - 40:
            draw.text((20, y_position), line, fill='black', font=text_font)
            y_position += 20
    
    # Draw disclaimers
    disclaimers = nutrition_data.get('disclaimers', '')
    if disclaimers and y_position < height - 20:
        draw.text((20, y_position), disclaimers, fill='black', font=text_font)
    
    return img

@app.route('/generate-label', methods=['POST'])
def generate_label():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract product data
        product_data = data.get('product_data', {})
        
        # Generate nutrition content using AWS Bedrock
        nutrition_data = generate_nutrition_content_with_bedrock(product_data)
        
        # Create nutrition label image
        product_name = product_data.get('product_name', 'Product')
        label_image = create_nutrition_label_image(nutrition_data, product_name)
        
        # Convert image to base64
        img_buffer = BytesIO()
        label_image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'data': {
                'image_base64': img_base64,
                'nutrition_data': nutrition_data,
                'filename': f'nutrition_label_{product_name}_{datetime.now().strftime("%Y%m%d")}.png'
            }
        })
        
    except Exception as e:
        print(f"Error generating label: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'nutrition-label-generator'})

@app.route('/', methods=['GET'])
def root():
    return jsonify({'message': 'Nutrition Label Generator API', 'endpoints': ['/health', '/generate-label']})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
