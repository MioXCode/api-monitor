# Web Monitoring System API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

### Register New User

```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "isEmailVerified": false,
    "role": "USER",
    "createdAt": "2024-01-31T10:00:00Z"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

## Endpoints Management

### Create New Endpoint

```http
POST /endpoints
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "name": "My Website",
  "url": "https://example.com",
  "checkInterval": 300000,
  "timeout": 10000,
  "method": "GET",
  "headers": {
    "User-Agent": "MonitoringSystem/1.0"
  },
  "expectedStatus": 200
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Website",
    "url": "https://example.com",
    "status": "ACTIVE",
    "lastChecked": null,
    "responseTime": 0,
    "availability": 100.0,
    "createdAt": "2024-01-31T10:00:00Z"
  }
}
```

### Get All Endpoints

```http
GET /endpoints
Authorization: Bearer your-jwt-token
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "My Website",
      "url": "https://example.com",
      "status": "ACTIVE",
      "lastChecked": "2024-01-31T10:05:00Z",
      "responseTime": 245,
      "availability": 99.98,
      "monitorLogs": [
        {
          "timestamp": "2024-01-31T10:05:00Z",
          "statusCode": 200,
          "responseTime": 245,
          "success": true
        }
      ]
    }
  ]
}
```

### Get Single Endpoint

```http
GET /endpoints/:id
Authorization: Bearer your-jwt-token
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Website",
    "url": "https://example.com",
    "status": "ACTIVE",
    "lastChecked": "2024-01-31T10:05:00Z",
    "responseTime": 245,
    "availability": 99.98,
    "monitorLogs": [...]
  }
}
```

## Monitoring

### Check Endpoint Manually

```http
POST /monitor/check/:endpointId
Authorization: Bearer your-jwt-token
```

Response:

```json
{
  "success": true,
  "data": {
    "log": {
      "id": "uuid",
      "timestamp": "2024-01-31T10:10:00Z",
      "statusCode": 200,
      "responseTime": 238,
      "success": true
    },
    "status": "ACTIVE",
    "endpoint": {
      "id": "uuid",
      "status": "ACTIVE",
      "lastChecked": "2024-01-31T10:10:00Z",
      "responseTime": 238
    }
  }
}
```

### Get Endpoint Statistics

```http
GET /monitor/stats/:endpointId
Authorization: Bearer your-jwt-token
```

Response:

```json
{
  "success": true,
  "data": {
    "uptime": 99.98,
    "averageResponseTime": 242,
    "checks": {
      "total": 288,
      "successful": 287,
      "failed": 1
    },
    "responseTimePercentiles": {
      "p50": 235,
      "p90": 280,
      "p99": 350
    }
  }
}
```

## Notifications

### Get All Notifications

```http
GET /notifications
Authorization: Bearer your-jwt-token
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "DOWN",
      "message": "Endpoint My Website is now down",
      "read": false,
      "timestamp": "2024-01-31T10:15:00Z",
      "endpoint": {
        "id": "uuid",
        "name": "My Website"
      }
    }
  ]
}
```

### Mark Notification as Read

```http
PATCH /notifications/:id/read
Authorization: Bearer your-jwt-token
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "read": true
  }
}
```

### Clear All Read Notifications

```http
DELETE /notifications/clear-all
Authorization: Bearer your-jwt-token
```

Response:

```json
{
  "success": true,
  "message": "All read notifications cleared"
}
```

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "url",
      "message": "Invalid URL format"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "message": "Invalid token"
}
```

### Not Found Error

```json
{
  "success": false,
  "message": "Endpoint not found"
}
```

## Using with cURL

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securepassword123"}'
```

### Create Endpoint

```bash
curl -X POST http://localhost:3000/api/endpoints \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website",
    "url": "https://example.com",
    "checkInterval": 300000
  }'
```

### Check Endpoint

```bash
curl -X POST http://localhost:3000/api/monitor/check/endpoint-id \
  -H "Authorization: Bearer your-jwt-token"
```
