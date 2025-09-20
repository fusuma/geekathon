// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_NUTRITION_API_URL || 'http://localhost:5001/api/nutrition';

/**
 * Generate a nutrition label based on product data
 * @param {Object} productData - Product information including nutritional values
 * @returns {Promise<Object>} Response with image data and label information
 */
export const generateNutritionLabel = async (productData) => {
    try {
        console.log('Sending request to generate nutrition label:', {
            url: `${API_BASE_URL}/generate-label`,
            productName: productData.product_name
        });

        const response = await fetch(`${API_BASE_URL}/generate-label`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Successfully generated nutrition label');
        return result;
    } catch (error) {
        console.error("API call failed for generateNutritionLabel:", error);
        return { 
            success: false,
            error: error.message || "Failed to connect to nutrition label service"
        };
    }
};

/**
 * Generate a crisis response label with updated warnings
 * @param {Object} originalProductData - Original product data
 * @param {Object} crisisInfo - Crisis information including type and details
 * @returns {Promise<Object>} Response with updated label image and crisis communication
 */
export const generateCrisisLabel = async (originalProductData, crisisInfo) => {
    try {
        console.log('Sending request to generate crisis label:', {
            url: `${API_BASE_URL}/crisis-response`,
            productName: originalProductData.product_name,
            crisisType: crisisInfo.type
        });

        const response = await fetch(`${API_BASE_URL}/crisis-response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                original_product_data: originalProductData, 
                crisis_info: crisisInfo 
            }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Successfully generated crisis label');
        return result;
    } catch (error) {
        console.error("API call failed for generateCrisisLabel:", error);
        return { 
            success: false,
            error: error.message || "Failed to connect to crisis response service"
        };
    }
};

/**
 * Check if the nutrition label API is available
 * @returns {Promise<boolean>} True if API is healthy, false otherwise
 */
export const checkApiHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api/nutrition', '')}/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        console.error("Health check failed:", error);
        return false;
    }
};

/**
 * Get API configuration information
 * @returns {Object} API configuration details
 */
export const getApiConfig = () => {
    return {
        baseUrl: API_BASE_URL,
        endpoints: {
            generateLabel: `${API_BASE_URL}/generate-label`,
            crisisResponse: `${API_BASE_URL}/crisis-response`,
            health: `${API_BASE_URL.replace('/api/nutrition', '')}/health`
        }
    };
};