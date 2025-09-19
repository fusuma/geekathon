# AWS Authentication Integration for SmartLabel AI

This document details the steps to integrate the SmartLabel AI login system with AWS DynamoDB for user management.

## 1. Solution Overview

Authentication will be managed by two new AWS Lambda functions:
- `AuthFunction`: Responsible for verifying user credentials (username/password) against a DynamoDB users table.
- `UsersFunction`: Provides CRUD operations (Create, Read, Update, Delete) to manage users in the DynamoDB table.

A new DynamoDB table, `SmartLabel-Users-${Environment}`, will be created to store user data.

The frontend (`AuthContext.tsx`) will be updated to call the `AuthFunction` via API Gateway for authentication.

## 2. Backend Configuration (AWS SAM)

### 2.1. Update `apps/api/template.yaml`

The following changes have been made to `template.yaml`:
- Added `USERS_TABLE` environment variable for Lambda functions.
- Defined the new `UsersTable` in DynamoDB.
- Added definitions for `AuthFunction` and `UsersFunction` (including DynamoDB access policies and API Gateway events).
- Added `Outputs` for the new APIs and users table.

### 2.2. Create Lambda Handlers

The files `apps/api/src/handlers/auth.ts` and `apps/api/src/handlers/users.ts` have been created. They contain the logic for login and user management, respectively.

### 2.3. Install Backend Dependencies

Make sure the necessary dependencies for AWS SDK v3 and `uuid` are installed in `apps/api`.
In the `apps/api` directory, run:
```bash
pnpm add @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb uuid
pnpm add -D @types/uuid
```
*(Note: `uuid` was added for the user management script, but is not strictly necessary for the handlers if username is the primary key.)*

### 2.4. Deploy Backend

To deploy the new Lambda functions and DynamoDB table, navigate to the `apps/api` directory and run the SAM commands:

```bash
cd apps/api
sam build
sam deploy --guided
```
During `sam deploy --guided`, you will be prompted to configure the stack. Make sure to:
- Set the `Stack Name` (e.g., `smartlabel-ai-dev`).
- Set the `Environment` (e.g., `dev`).
- Confirm permissions.
- Save configurations in `samconfig.toml` for faster future deploys.

After deployment, the `Output` for `ApiGatewayUrl` and specific URLs for `AuthApi` and `UsersApi` will be displayed. Note the `AuthApi` URL.

## 3. Frontend Configuration (Next.js)

### 3.1. Update `apps/web/contexts/AuthContext.tsx`

The `apps/web/contexts/AuthContext.tsx` file has been updated to:
- Use the new `User` interface (without `id`, with optional `email`).
- Attempt authentication against the `/auth/login` API Gateway endpoint.
- Maintain a fallback to local `admin/admin` credentials if the API is not available or fails.

### 3.2. Configure Environment Variable in Frontend

You will need to set your API Gateway URL in the frontend. Create a `.env.local` file in the root of the `apps/web` directory (if it doesn't exist) and add the `ApiGatewayUrl` you obtained from the SAM deployment:

```
# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod
```
Replace `<your-api-gateway-id>` and `<your-region>` with the correct values from your deployment.

## 4. User Management (Script)

A `scripts/manage-users.js` script has been created to facilitate user creation and management directly in DynamoDB.

### 4.1. Configure Environment Variables for Script

Create a `.env` file in the `apps/api` directory (if it doesn't exist) and add your users table name:

```
# apps/api/.env
USERS_TABLE=SmartLabel-Users-dev # Use the table name that was created in deployment
```
Make sure the table name matches what was deployed (e.g., `SmartLabel-Users-dev` if `Environment` is `dev`).

### 4.2. Use the Script

To use the script, navigate to the `scripts` directory and run commands with `node`:

**Examples:**

- **Create a new user:**
  ```bash
  node scripts/manage-users.js create myuser my@email.com mypassword admin
  ```
  *(Role can be `admin` or `user`)*

- **Get user details:**
  ```bash
  node scripts/manage-users.js get myuser
  ```

- **List all users:**
  ```bash
  node scripts/manage-users.js list
  ```

- **Update a user:**
  ```bash
  node scripts/manage-users.js update myuser email=new@email.com role=user
  ```

- **Delete a user:**
  ```bash
  node scripts/manage-users.js delete myuser
  ```

## 5. Testing the Integration

1. **Backend Deployment**: Make sure the backend was deployed successfully (`sam deploy`).
2. **Configure Frontend**: Verify that `NEXT_PUBLIC_API_URL` is configured correctly in `apps/web/.env.local`.
3. **Create User**: Use the `manage-users.js` script to create a user in DynamoDB (e.g., `admin/admin`).
4. **Start Frontend**: In the `apps/web` directory, run `pnpm dev`.
5. **Test Login**: Access `http://localhost:3000/login` and try to login with the credentials you created via script.

If everything is configured correctly, the login should authenticate against DynamoDB via API Gateway.

## 6. Postman Testing Guide

### 6.1. Authentication Endpoint

**POST** `https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Expected Response (Success):**
```json
{
  "success": true,
  "user": {
    "username": "admin",
    "email": "admin@smartlabel.ai",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

**Expected Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### 6.2. User Management Endpoints

#### Get All Users
**GET** `https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users`

**Expected Response:**
```json
{
  "success": true,
  "users": [
    {
      "username": "admin",
      "email": "admin@smartlabel.ai",
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Create New User
**POST** `https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get Specific User
**GET** `https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users/{username}`

**Example:** `https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users/admin`

#### Update User
**PUT** `https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users/{username}`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "updated@example.com",
  "role": "admin"
}
```

#### Delete User
**DELETE** `https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users/{username}`

**Example:** `https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users/olduser`

## 7. Security Notes

- **Important**: Currently passwords are stored in plain text
- **For production**: Implement password hashing with bcrypt
- **Recommended**: Add password strength validation
- **API Security**: Consider adding API keys or JWT tokens for production use