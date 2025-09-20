import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient, ScanCommand, PutItemCommand, DeleteItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'us-east-1',
});

const dynamoClient = new DynamoDBClient({
  region: process.env.BEDROCK_REGION || 'us-east-1',
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const { httpMethod, path, body } = event;

    // Route handling
    if (path === '/' || path === '/health') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'SmartLabel AI API is running',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        }),
      };
    }

    if (path === '/api/labels/generate' && httpMethod === 'POST') {
      return await generateNutritionLabel(body);
    }

    if (path === '/api/labels/visual' && httpMethod === 'POST') {
      return await generateVisualLabel(body);
    }

    if (path === '/api/crisis/response' && httpMethod === 'POST') {
      return await generateCrisisResponse(body);
    }

    // DynamoDB endpoints
    if (path === '/api/labels' && httpMethod === 'GET') {
      return await listLabels();
    }

    if (path.startsWith('/api/labels/') && httpMethod === 'GET') {
      const labelId = path.split('/')[3];
      if (!labelId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Label ID is required' }),
        };
      }
      return await getLabel(labelId);
    }

    if (path.startsWith('/api/labels/') && httpMethod === 'DELETE') {
      const labelId = path.split('/')[3];
      if (!labelId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Label ID is required' }),
        };
      }
      return await deleteLabel(labelId);
    }

    // 404 for unknown routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Not Found',
        message: `Route ${path} not found`,
      }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

async function generateNutritionLabel(body: string | null) {
  if (!body) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Request body is required' }),
    };
  }

  let productData: any;
  try {
    productData = JSON.parse(body);
    
    // Generate nutrition label using Bedrock AI
    const prompt = `You are a nutrition expert. Generate a comprehensive nutrition label for the following product:

Product Name: ${productData.name || 'Product'}
Serving Size: ${productData.serving_size || '1 serving'}
Servings Per Container: ${productData.servings_per_container || '1'}
Calories: ${productData.calories || '0'}
Total Fat: ${productData.total_fat || '0'}g
Protein: ${productData.protein || '0'}g
Ingredients: ${productData.ingredients || 'Ingredients not specified'}
Market: ${productData.market || 'spain'}

Please generate a complete nutrition facts label in JSON format with the following structure:
{
  "nutrition_facts": {
    "serving_size": "string",
    "servings_per_container": "string", 
    "calories": "string",
    "nutrients": [
      {"name": "string", "amount": "string", "unit": "string", "daily_value": "string"}
    ]
  },
  "ingredients": "string",
  "warnings": ["string"],
  "market": "string",
  "ai_generated": true
}

Include all standard nutrients (Total Fat, Saturated Fat, Trans Fat, Cholesterol, Sodium, Total Carbohydrate, Dietary Fiber, Total Sugars, Protein) with realistic values based on the product type. Add any relevant warnings for allergens or health concerns.`;

    const bedrockResponse = await bedrockClient.send(new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    }));

    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
    const aiContent = responseBody.content[0].text;
    
    // Parse the AI response
    let aiGeneratedData;
    try {
      aiGeneratedData = JSON.parse(aiContent);
    } catch (parseError) {
      // If AI response is not valid JSON, create a structured response
      aiGeneratedData = {
        nutrition_facts: {
          serving_size: productData.serving_size || '1 serving',
          servings_per_container: productData.servings_per_container || '1',
          calories: productData.calories || '0',
          nutrients: [
            { name: 'Total Fat', amount: productData.total_fat || '0', unit: 'g', daily_value: '6%' },
            { name: 'Saturated Fat', amount: '0', unit: 'g', daily_value: '0%' },
            { name: 'Trans Fat', amount: '0', unit: 'g', daily_value: '0%' },
            { name: 'Cholesterol', amount: '0', unit: 'mg', daily_value: '0%' },
            { name: 'Sodium', amount: '0', unit: 'mg', daily_value: '0%' },
            { name: 'Total Carbohydrate', amount: '0', unit: 'g', daily_value: '0%' },
            { name: 'Dietary Fiber', amount: '0', unit: 'g', daily_value: '0%' },
            { name: 'Total Sugars', amount: '0', unit: 'g', daily_value: '0%' },
            { name: 'Protein', amount: productData.protein || '0', unit: 'g', daily_value: '0%' },
          ],
        },
        ingredients: productData.ingredients || 'Ingredients not specified',
        warnings: [],
        market: productData.market || 'spain',
        ai_generated: true,
        ai_response: aiContent
      };
    }

    // Save to DynamoDB
    const labelId = `label_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const labelData = {
      labelId,
      productName: productData.name || 'Product',
      servingSize: productData.serving_size || '1 serving',
      servingsPerContainer: productData.servings_per_container || '1',
      calories: productData.calories || '0',
      nutritionalValues: aiGeneratedData.nutrition_facts || {},
      ingredients: productData.ingredients || 'Ingredients not specified',
      market: productData.market || 'spain',
      certifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...aiGeneratedData
    };

    try {
      const tableName = process.env.DYNAMODB_TABLE_NAME || 'SmartLabel-Labels-dev';
      const putCommand = new PutItemCommand({
        TableName: tableName,
        Item: marshall(labelData),
      });
      
      await dynamoClient.send(putCommand);
      console.log('Label saved to DynamoDB:', labelId);
    } catch (dbError) {
      console.error('Error saving to DynamoDB:', dbError);
      // Continue even if DB save fails
    }

    const response = {
      success: true,
      data: {
        ...aiGeneratedData,
        labelId,
        generated_at: new Date().toISOString(),
        model_used: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0'
      },
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Bedrock error:', error);
    
    // Fallback to mock data if Bedrock fails
    const fallbackData = {
      nutrition_facts: {
        serving_size: '1 serving',
        servings_per_container: '1',
        calories: '0',
        nutrients: [
          { name: 'Total Fat', amount: '0', unit: 'g', daily_value: '0%' },
          { name: 'Saturated Fat', amount: '0', unit: 'g', daily_value: '0%' },
          { name: 'Trans Fat', amount: '0', unit: 'g', daily_value: '0%' },
          { name: 'Cholesterol', amount: '0', unit: 'mg', daily_value: '0%' },
          { name: 'Sodium', amount: '0', unit: 'mg', daily_value: '0%' },
          { name: 'Total Carbohydrate', amount: '0', unit: 'g', daily_value: '0%' },
          { name: 'Dietary Fiber', amount: '0', unit: 'g', daily_value: '0%' },
          { name: 'Total Sugars', amount: '0', unit: 'g', daily_value: '0%' },
          { name: 'Protein', amount: '0', unit: 'g', daily_value: '0%' },
        ],
      },
      ingredients: 'Ingredients not specified',
      warnings: [],
      market: 'spain',
      ai_generated: false,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      generated_at: new Date().toISOString(),
    };

    // Save fallback data to DynamoDB as well
    const labelId = `label_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const labelData = {
      labelId,
      productName: productData?.name || 'Product',
      servingSize: productData?.serving_size || '1 serving',
      servingsPerContainer: productData?.servings_per_container || '1',
      calories: productData?.calories || '0',
      nutritionalValues: fallbackData.nutrition_facts || {},
      certifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...fallbackData
    };

    try {
      const tableName = process.env.DYNAMODB_TABLE_NAME || 'SmartLabel-Labels-dev';
      const putCommand = new PutItemCommand({
        TableName: tableName,
        Item: marshall(labelData),
      });
      
      await dynamoClient.send(putCommand);
      console.log('Fallback label saved to DynamoDB:', labelId);
    } catch (dbError) {
      console.error('Error saving fallback to DynamoDB:', dbError);
      // Continue even if DB save fails
    }

    const fallbackResponse = {
      success: true,
      data: {
        ...fallbackData,
        labelId,
      },
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(fallbackResponse),
    };
  }
}

async function generateVisualLabel(body: string | null) {
  // Mock visual label generation
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      data: {
        image_url: 'https://via.placeholder.com/400x600/ffffff/000000?text=Nutrition+Label',
        label_id: `label_${Date.now()}`,
        generated_at: new Date().toISOString(),
      },
    }),
  };
}

async function generateCrisisResponse(body: string | null) {
  // Mock crisis response
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      data: {
        response_id: `crisis_${Date.now()}`,
        severity: 'medium',
        recommendations: [
          'Immediately contact affected customers',
          'Prepare recall documentation',
          'Notify regulatory authorities within 24 hours',
        ],
        timeline: [
          { step: 'Immediate', action: 'Stop production', timeframe: '0-1 hours' },
          { step: 'Short-term', action: 'Customer notification', timeframe: '1-4 hours' },
          { step: 'Medium-term', action: 'Regulatory notification', timeframe: '4-24 hours' },
        ],
        generated_at: new Date().toISOString(),
      },
    }),
  };
}

// DynamoDB functions
async function listLabels() {
  try {
    const tableName = process.env.DYNAMODB_TABLE_NAME || 'SmartLabel-Labels-dev';
    
    const command = new ScanCommand({
      TableName: tableName,
    });

    const result = await dynamoClient.send(command);
    
    // Convert DynamoDB items to regular objects
    const labels = result.Items?.map(item => unmarshall(item)) || [];
    
    // Sort by creation date (newest first)
    labels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: labels,
        count: labels.length,
      }),
    };
  } catch (error) {
    console.error('Error listing labels:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Failed to list labels',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

async function getLabel(labelId: string) {
  try {
    const tableName = process.env.DYNAMODB_TABLE_NAME || 'SmartLabel-Labels-dev';
    
    const command = new GetItemCommand({
      TableName: tableName,
      Key: marshall({ labelId }),
    });

    const result = await dynamoClient.send(command);
    
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Label not found',
        }),
      };
    }

    const label = unmarshall(result.Item);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: label,
      }),
    };
  } catch (error) {
    console.error('Error getting label:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Failed to get label',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

async function deleteLabel(labelId: string) {
  try {
    const tableName = process.env.DYNAMODB_TABLE_NAME || 'SmartLabel-Labels-dev';
    
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: marshall({ labelId }),
    });

    await dynamoClient.send(command);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Label deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Error deleting label:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Failed to delete label',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
