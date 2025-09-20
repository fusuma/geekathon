# SmartLabel AI - Technical Documentation

## Overview

SmartLabel AI is a comprehensive food labeling solution that leverages AWS services and AI to generate compliant nutrition labels for multiple international markets. This document provides a complete overview of all technologies, integrations, and tools used in the project.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Technologies](#frontend-technologies)
3. [Backend Technologies](#backend-technologies)
4. [AWS Services Integration](#aws-services-integration)
5. [AI and Machine Learning](#ai-and-machine-learning)
6. [Development Tools](#development-tools)
7. [Deployment and Infrastructure](#deployment-and-infrastructure)
8. [API Documentation](#api-documentation)
9. [Data Flow](#data-flow)
10. [Security and Compliance](#security-and-compliance)

---

## Architecture Overview

### System Architecture
- **Type**: Serverless Microservices Architecture
- **Pattern**: Monorepo with Turborepo
- **Deployment**: AWS Cloud Infrastructure
- **Communication**: RESTful APIs via API Gateway

### Core Components
1. **Frontend**: Next.js React Application
2. **Backend**: AWS Lambda Functions (Node.js/TypeScript)
3. **AI Service**: Python Flask Service with AWS Bedrock
4. **Database**: Amazon DynamoDB
5. **Storage**: Amazon S3
6. **API Gateway**: AWS API Gateway for REST endpoints

---

## Frontend Technologies

### Core Framework
- **Next.js 15.5.3**: React framework with Turbopack for fast development
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript 5.9.2**: Type-safe development across the stack

### UI Components and Styling
- **shadcn/ui**: Modern, accessible component library
- **Radix UI**: Headless UI primitives for complex components
  - `@radix-ui/react-checkbox`: Checkbox components
  - `@radix-ui/react-dialog`: Modal dialogs
  - `@radix-ui/react-dropdown-menu`: Dropdown menus
  - `@radix-ui/react-tabs`: Tab navigation
  - `@radix-ui/react-progress`: Progress indicators
- **Tailwind CSS 3.4.0**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Framer Motion 12.23.13**: Animation library

### State Management and Data Fetching
- **Zustand 5.0.8**: Lightweight state management
- **TanStack Query 5.0.0**: Server state management and caching
- **React Hook Form 7.48.2**: Form state management
- **Zod 3.22.4**: Schema validation

### Development Tools
- **ESLint**: Code linting with custom configuration
- **Prettier**: Code formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

---

## Backend Technologies

### Core Runtime
- **Node.js 20.x (LTS)**: JavaScript runtime for Lambda functions
- **TypeScript 5.x**: Type-safe backend development
- **AWS Lambda**: Serverless compute platform

### AWS SDK Integration
- **@aws-sdk/client-bedrock-runtime 3.890.0**: AWS Bedrock AI service integration
- **@aws-sdk/client-dynamodb 3.445.0**: DynamoDB operations
- **@aws-sdk/lib-dynamodb 3.445.0**: DynamoDB document client

### Python AI Service
- **Python 3.13**: Backend AI service runtime
- **Flask 3.0.0**: Web framework for AI service
- **boto3 1.34.0**: AWS SDK for Python
- **Pillow 10.0.0**: Image processing library
- **matplotlib 3.7.0**: Data visualization and label generation
- **Flask-CORS**: Cross-origin resource sharing

### Development and Testing
- **Jest 29.7.0**: JavaScript testing framework
- **ts-jest**: TypeScript support for Jest
- **Express 4.18.2**: Development server
- **CORS 2.8.5**: Cross-origin resource sharing

---

## AWS Services Integration

### Core AWS Services

#### 1. Amazon Bedrock
- **Model**: Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
- **Purpose**: AI-powered content generation for nutrition labels
- **Integration**: Direct API calls from Lambda functions and Python service
- **Capabilities**:
  - Market-specific label generation
  - Multi-language content creation
  - Compliance validation
  - Crisis response content generation

#### 2. Amazon DynamoDB
- **Tables**:
  - `SmartLabel-Labels-{Environment}`: Stores generated labels
  - `SmartLabel-CrisisLogs-{Environment}`: Stores crisis response logs
- **Features**:
  - Pay-per-request billing
  - Global Secondary Indexes for efficient querying
  - Point-in-time recovery
  - DynamoDB Streams for real-time processing
- **Indexes**:
  - `by-product`: Query labels by product ID
  - `by-market`: Query labels by market and creation date
  - `by-market-product`: Query labels by market and product
  - `by-crisis-type`: Query crisis logs by type and timestamp

#### 3. AWS Lambda
- **Functions**:
  - `HelloFunction`: Health check endpoint
  - `GenerateFunction`: Label generation with AI
  - `CrisisFunction`: Crisis response handling
  - `LabelsFunction`: Label management (GET, DELETE, Visual generation)
- **Configuration**:
  - Runtime: Node.js 20.x
  - Timeout: 30 seconds
  - Memory: 512MB - 1024MB
  - Architecture: x86_64

#### 4. Amazon API Gateway
- **REST API**: Serverless API management
- **CORS**: Configured for cross-origin requests
- **Endpoints**:
  - `GET /hello`: Health check
  - `POST /generate`: Label generation
  - `POST /crisis`: Crisis response
  - `GET /labels`: List all labels
  - `GET /labels/{labelId}`: Get specific label
  - `DELETE /labels/{labelId}`: Delete label
  - `POST /labels/visual`: Generate visual label

#### 5. Amazon S3
- **Purpose**: Static asset storage
- **Use Cases**: Certification logos, generated images, documentation

#### 6. AWS CloudWatch
- **Log Groups**: Centralized logging for Lambda functions
- **Retention**: 30 days
- **Monitoring**: Function performance and error tracking

### IAM Permissions
- **Bedrock Access**: InvokeModel permission for Claude Sonnet
- **DynamoDB Access**: CRUD operations on labels and crisis logs tables
- **CloudWatch Logs**: Create log groups and streams
- **S3 Access**: Read/write permissions for static assets

---

## AI and Machine Learning

### AWS Bedrock Integration
- **Primary Model**: Claude 3 Sonnet for content generation
- **Use Cases**:
  - Market-specific nutrition label generation
  - Multi-language content translation
  - Compliance validation
  - Crisis response content creation
  - Visual label content enhancement

### Python AI Service
- **Purpose**: Advanced image generation and processing
- **Technologies**:
  - **PIL/Pillow**: Image manipulation and generation
  - **Matplotlib**: Data visualization and chart creation
  - **boto3**: AWS Bedrock integration for content generation
- **Features**:
  - Dynamic nutrition label image generation
  - Market-specific visual adaptations
  - Multi-language text rendering
  - Professional label formatting

### Content Generation Pipeline
1. **Input Processing**: Product data validation and formatting
2. **AI Enhancement**: AWS Bedrock content generation
3. **Market Adaptation**: Region-specific compliance rules
4. **Visual Generation**: Python service creates PNG images
5. **Quality Assurance**: Validation against market regulations

---

## Development Tools

### Monorepo Management
- **Turborepo 2.5.6**: High-performance build system
- **pnpm 9.0.0**: Fast, disk-efficient package manager
- **Workspace Configuration**: Shared dependencies and scripts

### Code Quality
- **ESLint**: Linting with custom configurations
- **Prettier 3.6.2**: Code formatting
- **TypeScript**: Type checking across the stack
- **Jest**: Unit and integration testing

### Development Environment
- **Node.js**: >=18 (LTS recommended)
- **pnpm**: Package manager
- **Git**: Version control
- **VS Code**: Recommended IDE with extensions

### Build and Deployment
- **AWS SAM CLI**: Infrastructure as Code
- **Turbo**: Monorepo build orchestration
- **TypeScript Compiler**: Build-time type checking

---

## Deployment and Infrastructure

### Infrastructure as Code
- **AWS SAM**: Serverless Application Model
- **CloudFormation**: AWS resource management
- **Template**: `template.yaml` defines all AWS resources

### Deployment Pipeline
1. **Build**: TypeScript compilation and bundling
2. **Package**: Lambda function packaging
3. **Deploy**: AWS SAM deployment to CloudFormation
4. **Verify**: Health check and endpoint validation

### Environment Management
- **Environments**: dev, staging, prod
- **Configuration**: Environment-specific variables
- **Secrets**: AWS Systems Manager Parameter Store
- **Monitoring**: CloudWatch integration

### Scalability Features
- **Serverless Architecture**: Auto-scaling based on demand
- **DynamoDB**: Pay-per-request scaling
- **Lambda**: Concurrent execution scaling
- **API Gateway**: Request throttling and caching

---

## API Documentation

### REST API Endpoints

#### Health Check
```
GET /hello
Response: { "message": "Hello from SmartLabel AI!" }
```

#### Label Generation
```
POST /generate
Body: {
  "productName": "string",
  "servingSize": "string",
  "servingsPerContainer": "string",
  "nutritionalValues": {},
  "ingredients": "string",
  "market": "string",
  "certifications": []
}
Response: {
  "labelId": "string",
  "legalLabel": {},
  "marketingLabel": {},
  "complianceLabel": {}
}
```

#### Crisis Response
```
POST /crisis
Body: {
  "crisisType": "string",
  "productId": "string",
  "description": "string",
  "severity": "string"
}
Response: {
  "crisisId": "string",
  "response": {},
  "communications": {}
}
```

#### Label Management
```
GET /labels
Response: { "labels": [] }

GET /labels/{labelId}
Response: { "label": {} }

DELETE /labels/{labelId}
Response: { "success": true }

POST /labels/visual
Body: { "product_data": {} }
Response: { "image_base64": "string" }
```

### Python AI Service Endpoints

#### Visual Label Generation
```
POST http://localhost:5002/generate-label
Body: {
  "product_data": {
    "product_name": "string",
    "serving_size": "string",
    "calories": "number",
    "market": "string",
    "ingredients_list": "string"
  }
}
Response: {
  "success": true,
  "image_base64": "string",
  "bedrock_used": true
}
```

---

## Data Flow

### Label Generation Flow
1. **User Input**: Product data via React form
2. **Frontend Validation**: Zod schema validation
3. **API Call**: POST to `/generate` endpoint
4. **Lambda Processing**: Data validation and AI call
5. **Bedrock Integration**: Claude Sonnet content generation
6. **DynamoDB Storage**: Label data persistence
7. **Response**: Generated labels returned to frontend
8. **UI Display**: Labels rendered in React components

### Visual Label Generation Flow
1. **User Action**: Click "Visual" button on label
2. **Frontend Call**: POST to Python service
3. **Python Processing**: 
   - Data extraction and formatting
   - AWS Bedrock content enhancement
   - PIL/Matplotlib image generation
4. **Image Generation**: Professional nutrition label PNG
5. **Base64 Response**: Image data returned to frontend
6. **Display**: Modal with visual label preview
7. **Export Options**: PDF, PNG, JSON download

### Crisis Response Flow
1. **Crisis Input**: User reports food safety incident
2. **Data Processing**: Crisis type and severity analysis
3. **AI Generation**: Bedrock creates response content
4. **Document Generation**: Crisis communications package
5. **Database Logging**: Incident tracking and audit trail
6. **Response Delivery**: Complete crisis response package

---

## Security and Compliance

### Authentication and Authorization
- **User Management**: DynamoDB-based user storage
- **Login System**: Secure authentication flow
- **Role-based Access**: User and admin roles
- **Session Management**: JWT token-based sessions

### Data Security
- **Encryption**: AWS KMS for data encryption
- **HTTPS**: All API communications encrypted
- **IAM Roles**: Least privilege access principles
- **VPC**: Network isolation where applicable

### Compliance Features
- **Market Regulations**: Multi-market compliance validation
- **Audit Trails**: Comprehensive logging of all operations
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: Data protection and privacy controls

### AWS Security Best Practices
- **Least Privilege**: Minimal IAM permissions
- **Encryption at Rest**: DynamoDB and S3 encryption
- **Encryption in Transit**: TLS/SSL for all communications
- **Monitoring**: CloudWatch security monitoring
- **Backup**: Point-in-time recovery for DynamoDB

---

## Performance and Monitoring

### Performance Metrics
- **Label Generation**: <15 seconds including cold start
- **API Response**: <2 seconds for standard operations
- **Visual Generation**: <10 seconds for PNG creation
- **Database Queries**: <100ms for standard operations

### Monitoring and Observability
- **CloudWatch Logs**: Centralized logging
- **CloudWatch Metrics**: Performance monitoring
- **Error Tracking**: Comprehensive error logging
- **Health Checks**: Automated endpoint monitoring

### Optimization Strategies
- **Lambda Warmup**: Keep functions warm for better performance
- **DynamoDB Caching**: Query result caching
- **CDN**: CloudFront for static asset delivery
- **Compression**: Gzip compression for API responses

---

## Future Roadmap

### Planned Enhancements
1. **Additional Markets**: Support for more international markets
2. **Advanced AI Models**: Integration with additional Bedrock models
3. **Real-time Collaboration**: Multi-user label editing
4. **Mobile Application**: Native mobile app development
5. **Advanced Analytics**: Label performance and compliance analytics

### Technical Improvements
1. **Microservices**: Further service decomposition
2. **Event-driven Architecture**: SNS/SQS integration
3. **Advanced Caching**: Redis integration
4. **CI/CD Pipeline**: Automated testing and deployment
5. **Monitoring**: Advanced observability with X-Ray

---

## Getting Started

### Prerequisites
- Node.js >=18
- pnpm 9.0.0
- AWS CLI configured
- AWS SAM CLI installed
- Python 3.13 (for AI service)

### Local Development Setup
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Configure AWS credentials
4. Start development servers:
   - Frontend: `pnpm dev:frontend`
   - Backend: `pnpm dev:backend`
   - AI Service: `cd nutrition-label-service && python test_app.py`

### Deployment
1. Build the project: `pnpm build`
2. Deploy to AWS: `cd apps/api && sam deploy`
3. Configure environment variables
4. Verify deployment with health checks

---

## Conclusion

SmartLabel AI represents a comprehensive solution leveraging modern cloud technologies, AI services, and best practices in software development. The architecture is designed for scalability, maintainability, and performance while providing a robust foundation for future enhancements.

The integration of AWS Bedrock, DynamoDB, Lambda, and custom Python services creates a powerful platform for automated nutrition label generation that can adapt to multiple international markets and compliance requirements.
