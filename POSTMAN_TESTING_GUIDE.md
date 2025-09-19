# Postman Testing Guide for SmartLabel AI Authentication

This guide provides step-by-step instructions for testing the AWS authentication system using Postman.

## Prerequisites

1. **Deploy the backend** using AWS SAM (see `AWS_AUTH_INTEGRATION.md`)
2. **Get your API Gateway URL** from the deployment output
3. **Install Postman** or use any REST client

## Step-by-Step Testing

### Step 1: Create a User

**Endpoint:** `POST https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "role": "user"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Step 2: Test Login with Created User

**Endpoint:** `POST https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastLogin": "2024-01-15T10:35:00.000Z"
  }
}
```

### Step 3: Test Login with Invalid Credentials

**Endpoint:** `POST https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "testuser",
  "password": "wrongpassword"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Step 4: List All Users

**Endpoint:** `GET https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "username": "testuser",
      "email": "test@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "lastLogin": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

### Step 5: Get Specific User

**Endpoint:** `GET https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users/testuser`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastLogin": "2024-01-15T10:35:00.000Z"
  }
}
```

### Step 6: Update User

**Endpoint:** `PUT https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users/testuser`

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

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

### Step 7: Test Login with Updated User

**Endpoint:** `POST https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "username": "testuser",
    "email": "updated@example.com",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastLogin": "2024-01-15T10:40:00.000Z"
  }
}
```

### Step 8: Delete User

**Endpoint:** `DELETE https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users/testuser`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Step 9: Verify User Deletion

**Endpoint:** `GET https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod/users/testuser`

**Expected Response (404 Not Found):**
```json
{
  "success": false,
  "error": "User not found"
}
```

## Postman Collection Setup

### Environment Variables

Create a Postman environment with these variables:

```
api_base_url: https://<your-api-gateway-id>.execute-api.<your-region>.amazonaws.com/Prod
```

### Collection Structure

1. **Authentication**
   - Login (POST /auth/login)
   - Login with Invalid Credentials (POST /auth/login)

2. **User Management**
   - Create User (POST /users)
   - Get All Users (GET /users)
   - Get User by Username (GET /users/{username})
   - Update User (PUT /users/{username})
   - Delete User (DELETE /users/{username})

### Pre-request Scripts

For dynamic testing, you can add this pre-request script to generate random usernames:

```javascript
// Generate random username for testing
const randomId = Math.floor(Math.random() * 10000);
pm.environment.set("test_username", `testuser${randomId}`);
pm.environment.set("test_email", `test${randomId}@example.com`);
```

Then use `{{test_username}}` and `{{test_email}}` in your request bodies.

## Error Testing

### Test Duplicate User Creation

**Endpoint:** `POST {{api_base_url}}/users`

**Body:**
```json
{
  "username": "existinguser",
  "email": "existing@example.com",
  "password": "password123",
  "role": "user"
}
```

Run this twice to test duplicate username handling.

### Test Missing Fields

**Endpoint:** `POST {{api_base_url}}/users`

**Body:**
```json
{
  "username": "incompleteuser"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Username, email, and password are required"
}
```

## Performance Testing

### Load Testing with Postman Runner

1. Create a collection with multiple login requests
2. Use Postman Runner to execute multiple iterations
3. Monitor response times and success rates

### Concurrent User Creation

Test creating multiple users simultaneously to verify DynamoDB performance.

## Security Testing

### Test SQL Injection Attempts

**Body:**
```json
{
  "username": "admin'; DROP TABLE users; --",
  "password": "password123"
}
```

### Test XSS Attempts

**Body:**
```json
{
  "username": "<script>alert('xss')</script>",
  "password": "password123"
}
```

## Monitoring and Logs

### CloudWatch Logs

Monitor Lambda function logs in AWS CloudWatch:
- `/aws/lambda/smartlabel-ai-dev-AuthFunction`
- `/aws/lambda/smartlabel-ai-dev-UsersFunction`

### API Gateway Logs

Enable API Gateway logging to monitor request/response patterns.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS headers are properly set in Lambda responses
2. **Timeout Errors**: Check Lambda timeout settings (default 15 seconds)
3. **Permission Errors**: Verify DynamoDB permissions in IAM roles
4. **Environment Variables**: Ensure `USERS_TABLE` is set correctly

### Debug Steps

1. Check CloudWatch logs for detailed error messages
2. Verify API Gateway URL is correct
3. Test with curl to isolate Postman-specific issues
4. Check DynamoDB table exists and has correct permissions

## Success Criteria

✅ All CRUD operations work correctly
✅ Authentication succeeds with valid credentials
✅ Authentication fails with invalid credentials
✅ Error handling works for edge cases
✅ Response times are acceptable (< 2 seconds)
✅ No security vulnerabilities exposed
