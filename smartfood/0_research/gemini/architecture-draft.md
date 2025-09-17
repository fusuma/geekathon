
### **Part 2: Deployment Process and Architecture**

This is a comprehensive guide to setting up your environment and deploying the CPO Platform to AWS using the AWS CDK.

**Architecture Diagram**

**Prerequisites**

1.  **AWS Account:** An active AWS account with administrator privileges.
2.  **AWS CLI:** Installed and configured (`aws configure`).
3.  **Node.js & npm:** Required for AWS CDK and the frontend app.
4.  **Python:** Required for the Lambda functions and CDK infrastructure code.
5.  **AWS CDK Toolkit:** Install globally: `npm install -g aws-cdk`.[6]
6.  **Git:** For version control.

**Step-by-Step Deployment Guide**

**Step 1: Project Setup (Monorepo)**

Create a single repository to hold all your code. This simplifies management during a hackathon.[5]

```bash
git clone <your-repo-url>
cd <your-repo-name>
mkdir backend cdk frontend data
```

  * `backend/`: Will contain the Python code for your three Lambda functions.
  * `cdk/`: Will contain the AWS CDK code (in Python) to define your infrastructure.
  * `frontend/`: Will contain your React + TypeScript dashboard application.
  * `data/`: Will store your mock data files (e.g., `market_prices.json`).

**Step 2: Backend Infrastructure (AWS CDK)**

1.  **Initialize CDK Project:** Navigate to the `cdk` directory and initialize a new CDK project in Python.[7]

    ```bash
    cd cdk
    cdk init app --language python
    # Activate virtual environment
    source.venv/bin/activate
    # Install dependencies
    pip install -r requirements.txt
    pip install aws-cdk-lib # Ensure core library is installed
    ```

2.  **Define the Infrastructure:** Open `cdk/cdk_stack.py`. This is where you'll define all your AWS resources. The stack will include:

      * An **S3 Bucket** to store mock data and synthetic images.
      * Three **AWS Lambda** functions, one for each agent.
      * An **Amazon API Gateway** (HTTP API) with routes pointing to your Lambda functions.
      * Necessary **IAM Roles and Policies** granting Lambda functions access to S3, Amazon Rekognition, and Amazon Bedrock.

3.  **Deploy the Backend:** From the `cdk` directory, run the following commands.

    ```bash
    # First time only: Prepares your AWS account to be managed by CDK
    cdk bootstrap

    # Synthesize the CloudFormation template to check for errors
    cdk synth

    # Deploy the stack to your AWS account
    cdk deploy
    ```

    After deployment, the CDK will output the URL for your API Gateway. Save this URL.

**Step 3: Frontend Application (React)**

1.  **Create React App:** Navigate to the `frontend` directory and create a new React app with Vite for speed.[6, 8]

    ```bash
    cd../frontend
    npm create vite@latest. -- --template react-ts
    npm install
    npm install axios # For making API calls
    ```

2.  **Configure Environment:** Create a `.env` file in the `frontend` directory and add the API Gateway URL from the previous step.

    ```
    VITE_API_BASE_URL="<your-api-gateway-url>"
    ```

3.  **Build the Dashboard:** Develop your React components for the dashboard. Use `axios` to call your API Gateway endpoints and display the data from the AI agents.

**Step 4: Frontend Deployment (AWS CDK)**

1.  **Add Frontend Resources to CDK:** Go back to your `cdk/cdk_stack.py` file. Add the following constructs:

      * An **S3 Bucket** configured for static website hosting.
      * An **Amazon CloudFront Distribution** to serve your React app globally with low latency.
      * An `s3_deployment.BucketDeployment` to automatically upload your React app's build files to the S3 bucket.

2.  **Build and Deploy:**

      * First, build the production version of your React app from the `frontend` directory: `npm run build`.
      * Then, from the `cdk` directory, deploy the updated stack: `cdk deploy`.

The CDK will output the CloudFront URL. This is the public URL for your CPO Platform dashboard.

-----

### **Part 3: Required Assets and Configurations**

Here are the key code snippets and configuration files you will need.

**1. `cdk/cdk_stack.py` (Infrastructure Definition)**

```python
# Example CDK Stack in Python
from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_lambda as _lambda,
    aws_apigatewayv2 as apigw,
    aws_iam as iam,
    RemovalPolicy
)
from constructs import Construct
from aws_cdk.aws_apigatewayv2_integrations import HttpLambdaIntegration

class CpoPlatformStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. S3 Bucket for data
        data_bucket = s3.Bucket(self, "CPODataBucket",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True)

        # 2. IAM Role for Lambdas
        lambda_role = iam.Role(self, "CPOLambdaRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=
        )
        # Grant permissions to Bedrock, Rekognition, and S3
        lambda_role.add_to_policy(iam.PolicyStatement(
            actions=,
            resources=["*"]
        ))
        data_bucket.grant_read_write(lambda_role)

        # 3. Lambda Functions for each Agent
        yield_agent_lambda = _lambda.Function(self, "YieldAgent",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="yield_agent.handler",
            code=_lambda.Code.from_asset("../backend/yield_agent"),
            role=lambda_role,
            environment={
                "DATA_BUCKET_NAME": data_bucket.bucket_name
            }
        )
        #... Define QualityAgentLambda and MaintenanceAgentLambda similarly...

        # 4. API Gateway
        http_api = apigw.HttpApi(self, "CPOApi")

        # 5. API Gateway Integrations
        http_api.add_routes(
            path="/generate-plan",
            methods=,
            integration=HttpLambdaIntegration("YieldAgentIntegration", yield_agent_lambda)
        )
        #... Add routes for other agents...
```

**2. `backend/yield_agent/yield_agent.py` (Lambda Function Code)**

```python
import json
import boto3
import os

# Initialize clients
s3_client = boto3.client('s3')
bedrock_runtime = boto3.client('bedrock-runtime')
DATA_BUCKET = os.environ

def handler(event, context):
    body = json.loads(event.get('body', '{}'))
    flock_data = body.get('flock_data')
    
    # In a real scenario, you'd fetch live prices. Here we use mock data from S3.
    # s3_client.upload_file('../data/market_prices.json', DATA_BUCKET, 'market_prices.json')
    market_prices_obj = s3_client.get_object(Bucket=DATA_BUCKET, Key='market_prices.json')
    market_prices = json.loads(market_prices_obj.read())

    # Construct a prompt for Amazon Bedrock
    prompt = f"""
    Human: You are a poultry processing yield optimization expert.
    Given the current market prices and the characteristics of the incoming flock, generate the most profitable production plan.

    Market Prices: {json.dumps(market_prices)}
    Incoming Flock: {json.dumps(flock_data)}

    Generate a JSON object with a 'plan' detailing the percentage of birds to allocate to 'Whole Bird', 'Cut-up Parts', and 'Further Processing', and a 'projected_profit_uplift_percent'.
    
    Assistant:
    """

    # Invoke Claude 3 Sonnet via Bedrock
    request_body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}]
    })

    response = bedrock_runtime.invoke_model(
        body=request_body,
        modelId='anthropic.claude-3-sonnet-20240229-v1:0',
        contentType='application/json',
        accept='application/json'
    ) [9]

    response_body = json.loads(response.get('body').read())
    generated_plan_text = response_body['content']['text']
    
    return {
        'statusCode': 200,
        'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        'body': generated_plan_text
    }
```

**3. `frontend/src/components/YieldWidget.tsx` (React Component)**

```typescript
import React, { useState } from 'react';
import axios from 'axios';

const YieldWidget = () => {
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      // Mock flock data for the demo
      const mockFlockData = { flockId: 'F-123', birdCount: 10000, avgWeightKg: 2.2 };
      
      const response = await axios.post(`${apiBaseUrl}/generate-plan`, {
        flock_data: mockFlockData,
      });
      
      setPlan(JSON.parse(response.data));
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="widget">
      <h2>Yield Optimization Agent</h2>
      <button onClick={handleGeneratePlan} disabled={isLoading}>
        {isLoading? 'Generating...' : 'Generate Optimal Plan'}
      </button>
      {plan && (
        <div>
          <h4>Generated Plan:</h4>
          <pre>{JSON.stringify(plan.plan, null, 2)}</pre>
          <p>Projected Profit Uplift: {plan.projected_profit_uplift_percent}%</p>
        </div>
      )}
    </div>
  );
};

export default YieldWidget;
```

This comprehensive package provides the strategic vision (PRD), the architectural blueprint, and the tactical code assets needed to successfully build and deploy a winning project for the Geekathon.
