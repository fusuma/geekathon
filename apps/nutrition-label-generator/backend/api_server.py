from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import logging
from datetime import datetime

from aws_bedrock_client import BedrockClient
from visual_label_creator import NutritionLabelCreator
from label_generator import NutritionLabelGenerator
from crisis_response import CrisisResponseGenerator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins

# Initialize clients
try:
    bedrock_client = BedrockClient(
        region=os.environ.get("BEDROCK_REGION", "us-east-1"),
        model_id=os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
    )
    visual_creator = NutritionLabelCreator()
    label_generator = NutritionLabelGenerator(bedrock_client, visual_creator)
    crisis_generator = CrisisResponseGenerator(bedrock_client, visual_creator)
    logger.info("All clients initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize clients: {e}")
    raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "nutrition-label-generator"
    }), 200

@app.route('/api/nutrition/generate-label', methods=['POST'])
def generate_nutrition_label():
    """Generate a nutrition label based on product data"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid input data - JSON required"}), 400

        # Validate required fields
        required_fields = ['product_name', 'serving_size', 'servings_per_container', 'calories']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        logger.info(f"Generating label for product: {data.get('product_name')}")
        
        result = label_generator.generate_label(data)
        if result.get("error"):
            logger.error(f"Label generation failed: {result['error']}")
            return jsonify(result), 500
        
        # Convert bytes to base64 for JSON response
        if isinstance(result["image_base64"], bytes):
            image_base64 = base64.b64encode(result["image_base64"]).decode('utf-8')
        else:
            image_base64 = result["image_base64"]
        
        logger.info(f"Label generated successfully: {result['filename']}")
        return jsonify({
            "success": True,
            "image_base64": image_base64,
            "label_data": result["label_data"],
            "filename": result["filename"]
        }), 200

    except Exception as e:
        logger.error(f"Unexpected error in generate_nutrition_label: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/nutrition/crisis-response', methods=['POST'])
def generate_crisis_response_label():
    """Generate a crisis response label with updated warnings"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid input data - JSON required"}), 400

        if "original_product_data" not in data or "crisis_info" not in data:
            return jsonify({
                "error": "Invalid input data. Requires 'original_product_data' and 'crisis_info' fields."
            }), 400

        original_product_data = data["original_product_data"]
        crisis_info = data["crisis_info"]

        # Validate crisis_info
        if not crisis_info.get("type") or not crisis_info.get("details"):
            return jsonify({
                "error": "Invalid crisis_info. Requires 'type' and 'details' fields."
            }), 400

        logger.info(f"Generating crisis label for product: {original_product_data.get('product_name')}, crisis: {crisis_info.get('type')}")
        
        result = crisis_generator.generate_crisis_label(original_product_data, crisis_info)
        if result.get("error"):
            logger.error(f"Crisis label generation failed: {result['error']}")
            return jsonify(result), 500
        
        # Convert bytes to base64 for JSON response
        if isinstance(result["image_base64"], bytes):
            image_base64 = base64.b64encode(result["image_base64"]).decode('utf-8')
        else:
            image_base64 = result["image_base64"]
        
        logger.info(f"Crisis label generated successfully: {result['filename']}")
        return jsonify({
            "success": True,
            "image_base64": image_base64,
            "label_data": result["label_data"],
            "crisis_communication_text": result["crisis_communication_text"],
            "filename": result["filename"]
        }), 200

    except Exception as e:
        logger.error(f"Unexpected error in generate_crisis_response_label: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed"}), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting Nutrition Label Generator API on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)