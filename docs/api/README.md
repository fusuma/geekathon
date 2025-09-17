# SmartLabel AI API Documentation 📚

> **AWS Lambda-based Serverless API for AI-powered food labeling**

## 🚀 Base URL

- **Production**: `https://api.smartlabel.ai`
- **Development**: `http://localhost:3001`

## 🔐 Authentication

Currently, the API uses CORS for browser access. For production use, API keys will be required.

```bash
# Include in headers for production
X-Api-Key: your-api-key-here
```

## 📋 API Endpoints

### 🏷️ Label Generation

#### POST `/generate`
Generate compliant food labels for specific markets using AI.

**Request Body:**
```json
{
  "name": "Premium Organic Cookies",
  "ingredients": ["Organic wheat flour", "Organic sugar", "Organic butter", "Eggs", "Vanilla extract"],
  "allergens": ["Gluten", "Eggs", "Milk"],
  "market": "EU",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "labelId": "lbl_20251217_123456_EU",
    "market": "EU",
    "language": "en",
    "labelData": {
      "legalLabel": {
        "ingredients": "Organic wheat flour, organic sugar, organic butter, eggs, vanilla extract",
        "allergens": "Contains: Gluten, Eggs, Milk",
        "nutrition": {
          "energy": "2089 kJ / 499 kcal",
          "fat": "23g",
          "saturatedFat": "14g",
          "carbohydrates": "67g",
          "sugars": "25g",
          "protein": "6.8g",
          "salt": "0.4g"
        }
      },
      "marketing": {
        "short": "Premium Organic Cookies - Made with finest organic ingredients",
        "long": "Indulge in our Premium Organic Cookies, crafted with the finest organic wheat flour and naturally sourced ingredients. Each cookie delivers exceptional taste while maintaining our commitment to organic, sustainable farming practices."
      },
      "warnings": [
        "Contains gluten, eggs, and milk",
        "May contain traces of nuts"
      ],
      "complianceNotes": [
        "EU Regulation 1169/2011 compliant",
        "Organic certification required"
      ]
    },
    "marketSpecificData": {
      "certifications": ["EU Organic", "IFS Food Standard"],
      "localRegulations": ["EU FIC Regulation compliance"],
      "culturalConsiderations": ["European taste preferences considered"]
    },
    "createdAt": "2025-12-17T10:30:00Z",
    "generatedBy": "Claude AI via AWS Bedrock"
  }
}
```

**Error Response:**
```json
{
  "error": "ValidationError",
  "message": "Invalid product data provided",
  "details": "Market 'INVALID' is not supported. Supported markets: EU, BR, AO, MO"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

### 🚨 Crisis Response

#### POST `/crisis`
Generate emergency response materials for food safety incidents.

**Request Body:**
```json
{
  "crisisType": "contamination",
  "severity": "critical",
  "affectedProducts": ["Premium Organic Cookies", "Artisan Crackers"],
  "affectedMarkets": ["EU", "BR"],
  "description": "Potential salmonella contamination detected in production facility",
  "timeline": "Products manufactured between Dec 1-15, 2025",
  "immediateActions": "Production halted, investigation initiated"
}
```

**Response:**
```json
{
  "crisisId": "crisis_20251217_urgent_001",
  "scenario": {
    "crisisType": "contamination",
    "severity": "critical",
    "affectedProducts": ["Premium Organic Cookies", "Artisan Crackers"],
    "affectedMarkets": ["EU", "BR"],
    "description": "Potential salmonella contamination detected",
    "timeline": "Products manufactured between Dec 1-15, 2025"
  },
  "revisedLabels": {
    "EU": {
      "labelId": "crisis_recall_EU_001",
      "market": "EU",
      "language": "en",
      "labelData": {
        "legalLabel": {
          "ingredients": "⚠️ PRODUCT RECALL - DO NOT CONSUME",
          "allergens": "⚠️ CRISIS ALERT: Potential contamination detected",
          "nutrition": {}
        },
        "marketing": {
          "short": "⚠️ URGENT RECALL NOTICE"
        },
        "warnings": [
          "⚠️ PRODUCT RECALL NOTICE",
          "Do not consume - potential contamination",
          "Contact customer service immediately"
        ]
      }
    }
  },
  "communicationMaterials": [
    {
      "type": "press-release",
      "market": "EU",
      "language": "en",
      "content": "IMMEDIATE PRESS RELEASE - CONTAMINATION CRISIS...",
      "urgency": "critical",
      "reviewRequired": true
    },
    {
      "type": "customer-email",
      "market": "EU",
      "language": "en",
      "content": "Subject: URGENT: Product Safety Notice...",
      "urgency": "critical",
      "reviewRequired": false
    }
  ],
  "actionPlan": [
    {
      "action": "Halt production immediately",
      "priority": "critical",
      "timeframe": "Immediate (0-1 hour)",
      "responsible": "Production Manager",
      "completed": false
    }
  ],
  "generatedAt": "2025-12-17T10:30:00Z",
  "estimatedImpact": "CRITICAL impact across 2 markets. Immediate recall required."
}
```

---

### 🌐 Multi-Market Generation

#### POST `/generate/multi-market`
Generate labels for multiple markets simultaneously.

**Request Body:**
```json
{
  "name": "Premium Organic Cookies",
  "ingredients": ["Organic wheat flour", "Organic sugar", "Organic butter", "Eggs", "Vanilla extract"],
  "allergens": ["Gluten", "Eggs", "Milk"],
  "markets": ["EU", "BR", "AO"]
}
```

**Response:**
```json
{
  "success": true,
  "labels": {
    "EU": {
      "labelId": "lbl_multi_EU_001",
      "market": "EU",
      "language": "en",
      "labelData": { /* EU-specific label data */ }
    },
    "BR": {
      "labelId": "lbl_multi_BR_001",
      "market": "BR",
      "language": "pt-BR",
      "labelData": { /* Brazil-specific label data */ }
    },
    "AO": {
      "labelId": "lbl_multi_AO_001",
      "market": "AO",
      "language": "pt",
      "labelData": { /* Angola-specific label data */ }
    }
  },
  "generatedAt": "2025-12-17T10:30:00Z",
  "processingTime": "12.4 seconds"
}
```

---

### 🔍 Health Check

#### GET `/hello`
Basic health check endpoint to verify API status.

**Response:**
```json
{
  "message": "Hello from SmartLabel AI Steel Thread!",
  "timestamp": "2025-12-17T10:30:00Z",
  "version": "1.0.0"
}
```

## 🌍 Supported Markets

| Market Code | Country/Region | Language | Currency |
|-------------|----------------|----------|----------|
| `EU` | European Union (Spain) | English | EUR |
| `BR` | Brazil | Portuguese (pt-BR) | BRL |
| `AO` | Angola | Portuguese (pt) | AOA |
| `MO` | Macau | Portuguese (pt) | MOP |

## 🏷️ Supported Product Categories

- **Food Products**: All categories including organic, processed, fresh
- **Allergen Management**: Complete allergen declaration system
- **Nutritional Information**: Automatic calculation and formatting
- **Certifications**: IFS, Organic, Halal, and other market-specific certifications

## ⚡ Performance Specifications

- **Generation Time**: 8-15 seconds per label
- **Multi-Market**: 12-18 seconds for 4 markets
- **Crisis Response**: 5-10 seconds
- **Rate Limiting**: 10 requests/minute per IP
- **Timeout**: 30 seconds maximum

## 🛡️ Error Handling

### Common Error Codes

| Code | Type | Description |
|------|------|-------------|
| `ValidationError` | 400 | Invalid request data |
| `UnsupportedMarket` | 400 | Market not supported |
| `RateLimitExceeded` | 429 | Too many requests |
| `GenerationTimeout` | 500 | AI generation timeout |
| `BedrockError` | 500 | AWS Bedrock service error |

### Error Response Format

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": "Additional technical details",
  "timestamp": "2025-12-17T10:30:00Z",
  "requestId": "req_123456789"
}
```

## 🧪 Testing & Examples

### Using cURL

```bash
# Basic label generation
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "ingredients": ["Water", "Sugar"],
    "allergens": [],
    "market": "EU"
  }'

# Crisis response
curl -X POST http://localhost:3001/crisis \
  -H "Content-Type: application/json" \
  -d '{
    "crisisType": "contamination",
    "severity": "high",
    "affectedProducts": ["Test Product"],
    "affectedMarkets": ["EU"],
    "description": "Test contamination scenario"
  }'
```

### Using JavaScript/TypeScript

```typescript
import { ProductData, Label, CrisisResponse } from '@repo/shared';

// Generate single label
async function generateLabel(productData: ProductData): Promise<Label> {
  const response = await fetch('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

// Crisis response
async function generateCrisisResponse(crisisData: any): Promise<CrisisResponse> {
  const response = await fetch('/crisis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(crisisData)
  });

  return await response.json();
}
```

## 🚀 Deployment

### Local Development

```bash
# Start API server
cd apps/api
pnpm dev

# API available at http://localhost:3001
```

### AWS Deployment

```bash
# Deploy using SAM CLI
cd apps/api
sam build
sam deploy --guided

# Creates CloudFormation stack with:
# - Lambda functions
# - API Gateway
# - DynamoDB tables
# - IAM roles
```

### Environment Variables

```bash
# Required for AWS deployment
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=smartlabel-labels
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Optional
LOG_LEVEL=info
CORS_ORIGINS=https://smartlabel.ai
```

## 📊 Monitoring & Analytics

- **CloudWatch Logs**: Comprehensive logging for all API calls
- **X-Ray Tracing**: Distributed tracing for performance analysis
- **Custom Metrics**: Generation success rates, processing times
- **Error Tracking**: Automatic error categorization and alerting

## 🔐 Security

- **CORS Configuration**: Configurable allowed origins
- **Input Validation**: Strict schema validation using Zod
- **Rate Limiting**: Per-IP request throttling
- **Data Encryption**: All data encrypted in transit and at rest
- **IAM Roles**: Least-privilege access to AWS services

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-username/smartlabel-ai/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/smartlabel-ai/issues)
- **API Support**: [api-support@smartlabel.ai](mailto:api-support@smartlabel.ai)

---

*API Documentation v1.0 - Generated for SmartLabel AI*