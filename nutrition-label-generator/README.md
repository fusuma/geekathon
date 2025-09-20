# SmartLabel AI - Nutrition Label Generator

This is a standalone, additive feature for the SmartLabel AI platform, designed to generate visual nutrition labels based on product data and market-specific regulations. It integrates with AWS Bedrock for intelligent content generation and uses Python (PIL/Matplotlib) for rendering high-resolution PNG labels.

## 🚀 Features

- **Visual Nutrition Label Generation**: Creates professional nutrition labels resembling standard nutrition facts panels
- **AWS Bedrock Integration**: Leverages Claude Sonnet for dynamic, market-compliant content generation
- **Multi-Market Support**: Adapts to regulations for Spain (EU), Angola, Macau, Brazil, and Halal markets
- **Dynamic Certification System**: Adds certification badges (Halal, IFS, Organic, Non-GMO)
- **Crisis Response**: Generates updated labels with prominent warnings for recalls or other crises
- **High-Resolution Export**: Downloads labels as 300 DPI PNG files
- **Real-time Preview**: Live preview of generated labels before download

## 🛠 Technical Stack

### Backend
- **Framework**: Flask (Python 3.9+)
- **AWS SDK**: `boto3` for Bedrock integration
- **Image Generation**: `Pillow` (PIL) for high-quality label rendering
- **AI Model**: AWS Bedrock Claude Sonnet 3.5
- **API**: RESTful endpoints with JSON responses

### Frontend
- **Framework**: React (JSX)
- **Styling**: Tailwind CSS (dark theme compatible)
- **API Integration**: Fetch API with error handling
- **Image Handling**: Base64 encoding for seamless display

## 📁 Folder Structure

```
/nutrition-label-generator/
├── backend/
│   ├── label_generator.py          # Main label generation orchestration
│   ├── aws_bedrock_client.py       # AWS Bedrock integration
│   ├── market_regulations.py       # Market-specific rules and data
│   ├── visual_label_creator.py     # PIL-based label rendering
│   ├── crisis_response.py          # Emergency label updates
│   ├── api_server.py               # Flask API server
│   └── test_label_generator.py     # Test script for backend functionality
├── frontend/
│   ├── components/
│   │   ├── LabelGenerator.jsx      # Main label generation interface
│   │   ├── ProductDataForm.jsx     # Input form for product details
│   │   └── LabelPreview.jsx        # Display and download generated label
│   └── utils/
│       └── api.js                  # API communication utilities
├── requirements.txt                # Python dependencies
└── README.md                       # This documentation
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- AWS credentials configured for Bedrock access
- Node.js and npm (for frontend integration)

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd nutrition-label-generator/backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r ../requirements.txt
   ```

3. **Configure AWS Credentials**:
   Ensure your AWS credentials are configured for `boto3` to access Bedrock:
   ```bash
   # Option 1: Environment variables
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   
   # Option 2: AWS CLI configuration
   aws configure
   ```

4. **Optional: Create environment file**:
   Create a `.env` file in the `backend` directory:
   ```env
   AWS_REGION=us-east-1
   BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
   PORT=5001
   DEBUG=true
   ```

5. **Run the Flask API server**:
   ```bash
   python api_server.py
   ```
   The API will be available at `http://localhost:5001`

### Frontend Integration

The React components are designed to be self-contained and can be integrated into your existing SmartLabel AI application:

1. **Import the main component**:
   ```jsx
   import LabelGenerator from './nutrition-label-generator/frontend/components/LabelGenerator';
   ```

2. **Use in your application**:
   ```jsx
   function NutritionGeneratorPage() {
     return (
       <div>
         <LabelGenerator />
       </div>
     );
   }
   ```

3. **Configure API URL** (if needed):
   ```bash
   # In your .env.local file
   NEXT_PUBLIC_NUTRITION_API_URL=http://localhost:5001/api/nutrition
   ```

## 📡 API Endpoints

### 1. Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Check if the service is running
- **Response**: `{"status": "healthy", "timestamp": "2024-01-01T00:00:00"}`

### 2. Generate Nutrition Label
- **URL**: `/api/nutrition/generate-label`
- **Method**: `POST`
- **Description**: Generate a nutrition label based on product information

**Request Body**:
```json
{
  "product_name": "Premium Whey Protein Powder",
  "serving_size": "1 Scoop (37.4g)",
  "servings_per_container": "25",
  "calories": "150",
  "nutritional_values": {
    "total_fat": {"amount": "3", "unit": "g", "daily_value": "4"},
    "saturated_fat": {"amount": "3", "unit": "g", "daily_value": "15", "indented": true},
    "protein": {"amount": "25", "unit": "g", "daily_value": "50"}
  },
  "ingredients_list": "100% Grass-Fed Whey Protein Isolate, Coconut Oil...",
  "market": "spain",
  "certifications": ["Organic"]
}
```

**Response**:
```json
{
  "success": true,
  "image_base64": "base64_encoded_png_image_data",
  "label_data": { /* Generated label data */ },
  "filename": "nutrition_label_spain_Premium_Whey_20240101120000.png"
}
```

### 3. Generate Crisis Response Label
- **URL**: `/api/nutrition/crisis-response`
- **Method**: `POST`
- **Description**: Generate an updated label with crisis warnings

**Request Body**:
```json
{
  "original_product_data": { /* Product data as above */ },
  "crisis_info": {
    "type": "allergen_contamination",
    "details": "Undeclared peanut allergen found in batch #XYZ."
  }
}
```

**Response**:
```json
{
  "success": true,
  "image_base64": "base64_encoded_png_image_data",
  "label_data": { /* Updated label data with warnings */ },
  "crisis_communication_text": "Urgent recall notice...",
  "filename": "crisis_label_spain_Premium_Whey_20240101120000.png"
}
```

## 🌍 Market Support

| Market | Language | Key Regulations | Special Features |
|--------|----------|----------------|------------------|
| **Spain (EU)** | Spanish | EU Regulation 1169/2011 | Full EU compliance, kJ/kcal units |
| **Angola** | Portuguese | ARSO standards | Bilingual warnings, import compliance |
| **Macau** | Chinese | Macau SAR requirements | Simplified Chinese, dual units |
| **Brazil** | Portuguese | ANVISA RDC 429/2020 | "ALÉRGENOS:" prefix, Brazilian standards |
| **Middle East (Halal)** | Arabic/English | Islamic dietary compliance | Halal certification, Arabic text elements |

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_REGION` | `us-east-1` | AWS region for Bedrock |
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Bedrock model to use |
| `PORT` | `5001` | Flask server port |
| `DEBUG` | `false` | Enable debug mode |

### Customization Options

1. **Fonts**: The system uses Arial fonts by default. To use custom fonts:
   - Place font files in the backend directory
   - Update `visual_label_creator.py` with your font paths

2. **Market Regulations**: Add new markets by editing `market_regulations.py`

3. **Label Layout**: Modify `visual_label_creator.py` to adjust visual appearance

## 🧪 Testing

### Backend Testing

Run the test script to verify backend functionality:

```bash
cd nutrition-label-generator/backend
python test_label_generator.py
```

### Frontend Testing

The React components can be tested by integrating them into your main application and using the browser developer tools.

### API Testing

Use tools like Postman or curl to test the API endpoints:

```bash
# Health check
curl http://localhost:5001/health

# Generate label
curl -X POST http://localhost:5001/api/nutrition/generate-label \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Test Product", ...}'
```

## 🔒 Security Considerations

- **AWS Credentials**: Never commit AWS credentials to version control
- **CORS**: The Flask app has CORS enabled for development. Configure appropriately for production
- **Input Validation**: The API validates required fields but consider additional sanitization for production
- **Rate Limiting**: Consider implementing rate limiting for production use

## 🚀 Deployment

### Local Development

1. Start the Flask backend: `python api_server.py`
2. Integrate React components into your main application
3. Configure environment variables for API communication

### Production Deployment

1. **Backend**: Deploy Flask app to your preferred hosting service (AWS Lambda, EC2, etc.)
2. **Frontend**: Build and deploy your main React/Next.js application
3. **Environment**: Set production environment variables
4. **Monitoring**: Implement logging and monitoring for production use

## 📝 Integration Examples

### Standalone Usage

```jsx
import React from 'react';
import LabelGenerator from './nutrition-label-generator/frontend/components/LabelGenerator';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <LabelGenerator />
    </div>
  );
}

export default App;
```

### Integration with SmartLabel AI

```jsx
// In your main SmartLabel AI application
import LabelGenerator from '../nutrition-label-generator/frontend/components/LabelGenerator';

function NutritionPage() {
  return (
    <div className="space-y-6">
      <h1>Nutrition Label Generator</h1>
      <LabelGenerator />
    </div>
  );
}
```

## 🐛 Troubleshooting

### Common Issues

1. **AWS Bedrock Access Denied**:
   - Verify AWS credentials are configured correctly
   - Ensure Bedrock access is enabled in your AWS account
   - Check IAM permissions for Bedrock access

2. **Font Issues**:
   - If labels appear with default fonts, ensure Arial fonts are available
   - Consider installing fonts or updating font paths in `visual_label_creator.py`

3. **API Connection Issues**:
   - Verify the Flask server is running on the correct port
   - Check CORS configuration if accessing from different origins
   - Ensure environment variables are set correctly

4. **Image Generation Errors**:
   - Check PIL/Pillow installation
   - Verify sufficient memory for image generation
   - Review error logs for specific issues

### Debug Mode

Enable debug mode for detailed logging:

```bash
export DEBUG=true
python api_server.py
```

## 📄 License

This project is part of the SmartLabel AI platform. See the main project license for details.

## 🤝 Contributing

This is an additive feature designed to integrate seamlessly with the existing SmartLabel AI platform. When making changes:

1. Maintain backward compatibility with existing functionality
2. Follow the established code patterns and styling
3. Test thoroughly before integration
4. Update documentation for any new features

## 📞 Support

For issues related to this Nutrition Label Generator:

1. Check the troubleshooting section above
2. Review the API logs for error details
3. Verify AWS Bedrock access and configuration
4. Test with the provided test script

For general SmartLabel AI issues, refer to the main project documentation.