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
    
    // Market configuration mapping
    const marketConfig = {
      'usa': { language: 'EN', country: 'United States', regulations: ['FDA Food Labeling Requirements', 'English language required', 'Nutritional values per serving', 'Allergen declaration required'] },
      'uk': { language: 'EN', country: 'United Kingdom', regulations: ['UK Food Information Regulations 2014', 'English language required', 'Allergens must be highlighted', 'Nutritional values per 100g/ml'] },
      'spain': { language: 'ES', country: 'Spain', regulations: ['EU Food Information Regulation (FIC)', 'Spanish language required', 'Allergens must be highlighted', 'Nutritional values per 100g/ml'] },
      'brazil': { language: 'PT', country: 'Brazil', regulations: ['ANVISA RDC 360/2003', 'Portuguese language required', 'Front-of-pack labeling for high sugar, fat, sodium', 'Nutritional values per portion'] },
      'angola': { language: 'PT', country: 'Angola', regulations: ['Angolan Food Safety Law', 'Portuguese language required', 'Basic nutritional information'] },
      'macau': { language: 'ZH', country: 'Macau', regulations: ['Macau Food Safety Law', 'Chinese and Portuguese language required', 'Nutritional values per 100g/ml'] },
      'halal': { language: 'AR', country: 'UAE (Halal)', regulations: ['UAE.S GSO 2055-1 (Halal)', 'Arabic language required', 'Halal certification required', 'Nutritional values per 100g/ml'] }
    };

    const selectedMarket = marketConfig[productData.market as keyof typeof marketConfig] || marketConfig['spain'];
    
    // Generate nutrition label using Bedrock AI with market-specific instructions
    const prompt = `You are a nutrition expert specializing in international food labeling regulations. Generate a comprehensive nutrition label for the following product, specifically adapted for the target market:

PRODUCT INFORMATION:
Product Name: ${productData.name || 'Product'}
Serving Size: ${productData.serving_size || '1 serving'}
Servings Per Container: ${productData.servings_per_container || '1'}
Calories: ${productData.calories || '0'}
Total Fat: ${productData.total_fat || '0'}g
Protein: ${productData.protein || '0'}g
Ingredients: ${productData.ingredients || 'Ingredients not specified'}

TARGET MARKET: ${selectedMarket.country} (${selectedMarket.language})
REGULATIONS TO FOLLOW: ${selectedMarket.regulations.join(', ')}

IMPORTANT INSTRUCTIONS:
1. ALL TEXT MUST BE TRANSLATED TO ${selectedMarket.language === 'EN' ? 'ENGLISH' : selectedMarket.language === 'ES' ? 'SPANISH' : selectedMarket.language === 'PT' ? 'PORTUGUESE' : selectedMarket.language === 'ZH' ? 'CHINESE' : selectedMarket.language === 'AR' ? 'ARABIC' : 'ENGLISH'}
2. Follow the specific regulations for ${selectedMarket.country}
3. Use appropriate units and formatting for ${selectedMarket.country}
4. Include all required allergen warnings in the target language
5. Ensure nutritional values are presented according to ${selectedMarket.country} standards

Please generate a complete nutrition facts label in JSON format with the following structure:
{
  "nutrition_facts": {
    "serving_size": "string (translated)",
    "servings_per_container": "string (translated)", 
    "calories": "string (translated)",
    "nutrients": [
      {"name": "string (translated)", "amount": "string", "unit": "string", "daily_value": "string"}
    ]
  },
  "ingredients": "string (translated)",
  "warnings": ["string (translated)"],
  "market": "string",
  "language": "${selectedMarket.language}",
  "country": "${selectedMarket.country}",
  "ai_generated": true
}

Include all standard nutrients with realistic values based on the product type. Translate all text including nutrient names, warnings, and any regulatory statements to ${selectedMarket.language === 'EN' ? 'English' : selectedMarket.language === 'ES' ? 'Spanish' : selectedMarket.language === 'PT' ? 'Portuguese' : selectedMarket.language === 'ZH' ? 'Chinese' : selectedMarket.language === 'AR' ? 'Arabic' : 'English'}. Add any relevant warnings for allergens or health concerns in the target language.`;

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
      // If AI response is not valid JSON, create a structured response with market-specific translations
      const nutrientTranslations = {
        'EN': { serving_size: 'Serving Size', servings_per_container: 'Servings Per Container', calories: 'Calories', total_fat: 'Total Fat', saturated_fat: 'Saturated Fat', trans_fat: 'Trans Fat', cholesterol: 'Cholesterol', sodium: 'Sodium', total_carbohydrate: 'Total Carbohydrate', dietary_fiber: 'Dietary Fiber', total_sugars: 'Total Sugars', protein: 'Protein' },
        'ES': { serving_size: 'Tamaño de la porción', servings_per_container: 'Porciones por envase', calories: 'Calorías', total_fat: 'Grasa total', saturated_fat: 'Grasa saturada', trans_fat: 'Grasa trans', cholesterol: 'Colesterol', sodium: 'Sodio', total_carbohydrate: 'Hidratos de carbono totales', dietary_fiber: 'Fibra dietética', total_sugars: 'Azúcares totales', protein: 'Proteínas' },
        'PT': { serving_size: 'Tamanho da porção', servings_per_container: 'Porções por embalagem', calories: 'Calorias', total_fat: 'Gordura total', saturated_fat: 'Gordura saturada', trans_fat: 'Gordura trans', cholesterol: 'Colesterol', sodium: 'Sódio', total_carbohydrate: 'Carboidratos totais', dietary_fiber: 'Fibra dietética', total_sugars: 'Açúcares totais', protein: 'Proteínas' },
        'ZH': { serving_size: '每份重量', servings_per_container: '每包装份数', calories: '热量', total_fat: '总脂肪', saturated_fat: '饱和脂肪', trans_fat: '反式脂肪', cholesterol: '胆固醇', sodium: '钠', total_carbohydrate: '总碳水化合物', dietary_fiber: '膳食纤维', total_sugars: '总糖', protein: '蛋白质' },
        'AR': { serving_size: 'حجم الحصة', servings_per_container: 'حصص لكل عبوة', calories: 'السعرات الحرارية', total_fat: 'إجمالي الدهون', saturated_fat: 'الدهون المشبعة', trans_fat: 'الدهون المتحولة', cholesterol: 'الكوليسترول', sodium: 'الصوديوم', total_carbohydrate: 'إجمالي الكربوهيدرات', dietary_fiber: 'الألياف الغذائية', total_sugars: 'إجمالي السكريات', protein: 'البروتين' }
      };

      const translations = nutrientTranslations[selectedMarket.language as keyof typeof nutrientTranslations] || nutrientTranslations['EN'];
      
      aiGeneratedData = {
        nutrition_facts: {
          serving_size: `${translations.serving_size}: ${productData.serving_size || '1 serving'}`,
          servings_per_container: `${translations.servings_per_container}: ${productData.servings_per_container || '1'}`,
          calories: `${translations.calories}: ${productData.calories || '0'}`,
          nutrients: [
            { name: translations.total_fat, amount: productData.total_fat || '0', unit: 'g', daily_value: '6%' },
            { name: translations.saturated_fat, amount: '0', unit: 'g', daily_value: '0%' },
            { name: translations.trans_fat, amount: '0', unit: 'g', daily_value: '0%' },
            { name: translations.cholesterol, amount: '0', unit: 'mg', daily_value: '0%' },
            { name: translations.sodium, amount: '0', unit: 'mg', daily_value: '0%' },
            { name: translations.total_carbohydrate, amount: '0', unit: 'g', daily_value: '0%' },
            { name: translations.dietary_fiber, amount: '0', unit: 'g', daily_value: '0%' },
            { name: translations.total_sugars, amount: '0', unit: 'g', daily_value: '0%' },
            { name: translations.protein, amount: productData.protein || '0', unit: 'g', daily_value: '0%' },
          ],
        },
        ingredients: productData.ingredients || (selectedMarket.language === 'ES' ? 'Ingredientes no especificados' : selectedMarket.language === 'PT' ? 'Ingredientes não especificados' : selectedMarket.language === 'ZH' ? '未指定成分' : selectedMarket.language === 'AR' ? 'المكونات غير محددة' : 'Ingredients not specified'),
        warnings: [],
        market: productData.market || 'spain',
        language: selectedMarket.language,
        country: selectedMarket.country,
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
    
    // Fallback to mock data if Bedrock fails - with market-specific translations
    const marketConfig = {
      'usa': { language: 'EN', country: 'United States' },
      'uk': { language: 'EN', country: 'United Kingdom' },
      'spain': { language: 'ES', country: 'Spain' },
      'brazil': { language: 'PT', country: 'Brazil' },
      'angola': { language: 'PT', country: 'Angola' },
      'macau': { language: 'ZH', country: 'Macau' },
      'halal': { language: 'AR', country: 'UAE (Halal)' }
    };

    const selectedMarket = marketConfig[productData?.market as keyof typeof marketConfig] || marketConfig['spain'];
    
    const nutrientTranslations = {
      'EN': { serving_size: 'Serving Size', servings_per_container: 'Servings Per Container', calories: 'Calories', total_fat: 'Total Fat', saturated_fat: 'Saturated Fat', trans_fat: 'Trans Fat', cholesterol: 'Cholesterol', sodium: 'Sodium', total_carbohydrate: 'Total Carbohydrate', dietary_fiber: 'Dietary Fiber', total_sugars: 'Total Sugars', protein: 'Protein' },
      'ES': { serving_size: 'Tamaño de la porción', servings_per_container: 'Porciones por envase', calories: 'Calorías', total_fat: 'Grasa total', saturated_fat: 'Grasa saturada', trans_fat: 'Grasa trans', cholesterol: 'Colesterol', sodium: 'Sodio', total_carbohydrate: 'Hidratos de carbono totales', dietary_fiber: 'Fibra dietética', total_sugars: 'Azúcares totales', protein: 'Proteínas' },
      'PT': { serving_size: 'Tamanho da porção', servings_per_container: 'Porções por embalagem', calories: 'Calorias', total_fat: 'Gordura total', saturated_fat: 'Gordura saturada', trans_fat: 'Gordura trans', cholesterol: 'Colesterol', sodium: 'Sódio', total_carbohydrate: 'Carboidratos totais', dietary_fiber: 'Fibra dietética', total_sugars: 'Açúcares totais', protein: 'Proteínas' },
      'ZH': { serving_size: '每份重量', servings_per_container: '每包装份数', calories: '热量', total_fat: '总脂肪', saturated_fat: '饱和脂肪', trans_fat: '反式脂肪', cholesterol: '胆固醇', sodium: '钠', total_carbohydrate: '总碳水化合物', dietary_fiber: '膳食纤维', total_sugars: '总糖', protein: '蛋白质' },
      'AR': { serving_size: 'حجم الحصة', servings_per_container: 'حصص لكل عبوة', calories: 'السعرات الحرارية', total_fat: 'إجمالي الدهون', saturated_fat: 'الدهون المشبعة', trans_fat: 'الدهون المتحولة', cholesterol: 'الكوليسترول', sodium: 'الصوديوم', total_carbohydrate: 'إجمالي الكربوهيدرات', dietary_fiber: 'الألياف الغذائية', total_sugars: 'إجمالي السكريات', protein: 'البروتين' }
    };

    const translations = nutrientTranslations[selectedMarket.language as keyof typeof nutrientTranslations] || nutrientTranslations['EN'];
    
    const fallbackData = {
      nutrition_facts: {
        serving_size: `${translations.serving_size}: 1 serving`,
        servings_per_container: `${translations.servings_per_container}: 1`,
        calories: `${translations.calories}: 0`,
        nutrients: [
          { name: translations.total_fat, amount: '0', unit: 'g', daily_value: '0%' },
          { name: translations.saturated_fat, amount: '0', unit: 'g', daily_value: '0%' },
          { name: translations.trans_fat, amount: '0', unit: 'g', daily_value: '0%' },
          { name: translations.cholesterol, amount: '0', unit: 'mg', daily_value: '0%' },
          { name: translations.sodium, amount: '0', unit: 'mg', daily_value: '0%' },
          { name: translations.total_carbohydrate, amount: '0', unit: 'g', daily_value: '0%' },
          { name: translations.dietary_fiber, amount: '0', unit: 'g', daily_value: '0%' },
          { name: translations.total_sugars, amount: '0', unit: 'g', daily_value: '0%' },
          { name: translations.protein, amount: '0', unit: 'g', daily_value: '0%' },
        ],
      },
      ingredients: selectedMarket.language === 'ES' ? 'Ingredientes no especificados' : selectedMarket.language === 'PT' ? 'Ingredientes não especificados' : selectedMarket.language === 'ZH' ? '未指定成分' : selectedMarket.language === 'AR' ? 'المكونات غير محددة' : 'Ingredients not specified',
      warnings: [],
      market: productData?.market || 'spain',
      language: selectedMarket.language,
      country: selectedMarket.country,
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
