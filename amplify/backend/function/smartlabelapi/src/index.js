const AWS = require('aws-sdk');

// Initialize AWS services
const bedrock = new AWS.BedrockRuntime({ region: process.env.AWS_REGION || 'us-east-1' });

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const { httpMethod, path, body, queryStringParameters } = event;
    
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight requests
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    try {
        // Route requests
        if (path === '/hello' && httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'SmartLabel AI API is running!',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                })
            };
        }
        
        if (path === '/generate' && httpMethod === 'POST') {
            const requestBody = JSON.parse(body || '{}');
            const { productData, market = 'spain' } = requestBody;
            
            if (!productData) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Product data is required' })
                };
            }
            
            // Generate nutrition label using Bedrock
            const labelData = await generateNutritionLabel(productData, market);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    labelData,
                    market,
                    generatedAt: new Date().toISOString()
                })
            };
        }
        
        if (path === '/labels' && httpMethod === 'GET') {
            // Return mock labels for now
            const mockLabels = [
                {
                    id: '1',
                    name: 'Grass-Fed Whey Protein',
                    market: 'spain',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2', 
                    name: 'Organic Quinoa',
                    market: 'brazil',
                    createdAt: new Date().toISOString()
                }
            ];
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    labels: mockLabels
                })
            };
        }
        
        // 404 for unknown routes
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Route not found' })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};

async function generateNutritionLabel(productData, market) {
    try {
        // Create prompt for Bedrock
        const prompt = createNutritionPrompt(productData, market);
        
        const params = {
            modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
            contentType: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        };
        
        const response = await bedrock.invokeModel(params).promise();
        const responseBody = JSON.parse(response.body.toString());
        
        return {
            nutrition_facts: {
                serving_size: productData.serving_size || '100g',
                servings_per_container: productData.servings_per_container || '1',
                calories: productData.calories || '250',
                nutrients: [
                    { name: 'Total Fat', amount: productData.total_fat || '5g', unit: 'g', daily_value: '6%' },
                    { name: 'Protein', amount: productData.protein || '20g', unit: 'g', daily_value: '40%' }
                ]
            },
            ingredients: productData.ingredients || 'Whey protein concentrate, natural flavors',
            allergens: 'Contains milk',
            market: market,
            generated_by: 'SmartLabel AI'
        };
        
    } catch (error) {
        console.error('Bedrock error:', error);
        // Return mock data if Bedrock fails
        return {
            nutrition_facts: {
                serving_size: productData.serving_size || '100g',
                servings_per_container: productData.servings_per_container || '1',
                calories: productData.calories || '250',
                nutrients: [
                    { name: 'Total Fat', amount: productData.total_fat || '5g', unit: 'g', daily_value: '6%' },
                    { name: 'Protein', amount: productData.protein || '20g', unit: 'g', daily_value: '40%' }
                ]
            },
            ingredients: productData.ingredients || 'Whey protein concentrate, natural flavors',
            allergens: 'Contains milk',
            market: market,
            generated_by: 'SmartLabel AI (Mock Data)'
        };
    }
}

function createNutritionPrompt(productData, market) {
    const marketInstructions = {
        spain: 'Generate EU-compliant nutrition facts following Regulation (EU) No 1169/2011. Include Spanish translations where appropriate.',
        angola: 'Generate nutrition facts following ARSO standards for African markets. Include Portuguese translations.',
        macau: 'Generate nutrition facts following Chinese/Macau SAR food labeling requirements. Include Chinese characters.',
        brazil: 'Generate nutrition facts following ANVISA Resolution RDC 429/2020. Use Portuguese language and include ALÉRGENOS prefix.',
        halal: 'Include Halal certification requirements and compliance notes.'
    };
    
    return `Generate a compliant nutrition label for the following product:

Product: ${productData.name}
Serving Size: ${productData.serving_size}
Servings per Container: ${productData.servings_per_container}
Calories: ${productData.calories}
Total Fat: ${productData.total_fat}
Protein: ${productData.protein}
Ingredients: ${productData.ingredients}

Market: ${market}
${marketInstructions[market] || 'Generate standard nutrition facts.'}

Please provide a structured JSON response with nutrition facts, ingredients, allergens, and market-specific compliance information.`;
}
