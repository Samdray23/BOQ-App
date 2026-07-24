# BOQ AI API Documentation

## Base URL
```
http://localhost:4000/api/v1
```

Legacy endpoints (backward compatible):
```
http://localhost:4000/api/auth/*
```

---

## Authentication

### POST /auth/register
Create a new account. Verification email is sent.

**Body:** `{ name, email, password, role? }`  
**Response:** `{ success: true, data: { message } }`

### POST /auth/login
Login with email and password.

**Body:** `{ email, password }`  
**Response:** `{ success: true, data: { user, token } }`

### POST /auth/google
Login or register with Google OAuth.

**Body:** `{ credential }`  
**Response:** `{ success: true, data: { user, token } }`

### GET /auth/verify/:token
Verify email address.

### POST /auth/resend-verification
Resend verification email.

**Body:** `{ email }`

### POST /auth/refresh
Refresh access token.

**Body:** `{ refreshToken }`  
**Response:** `{ success: true, data: { user, token } }`

### POST /auth/forgot-password
Request password reset email.

**Body:** `{ email }`

### POST /auth/reset-password
Reset password with token.

**Body:** `{ token, password }`

### GET /auth/me
Get current user profile. Requires authentication.

### POST /auth/logout
Invalidate refresh token. Requires authentication.

---

## Users

### GET /users/profile
Get user profile. Requires authentication.

### PATCH /users/profile
Update user profile. Requires authentication.

**Body:** `{ name?, avatar_url? }`

---

## Projects

### GET /projects
List user's projects. Requires authentication.

**Query:** `page, limit`

### GET /projects/:id
Get project details. Requires authentication.

### POST /projects
Create a new project. Requires authentication.

**Body:** `{ name, type?, location?, currency?, description?, ... }`

### PUT /projects/:id
Update project. Requires authentication.

### DELETE /projects/:id
Delete project. Requires authentication.

---

## Drawings

### POST /drawings/upload
Upload architectural PDF. Requires authentication.

**Multipart:** `drawing` (file), `projectId`, `drawingType?`

### GET /drawings/project/:projectId
List drawings for a project. Requires authentication.

### GET /drawings/:id
Get drawing details. Requires authentication.

### DELETE /drawings/:id
Delete drawing. Requires authentication.

---

## BOQ

### POST /boq/generate
Generate a new BOQ. Requires authentication.

**Body:** `{ projectId, title?, drawingId? }`  
**Response:** `{ success: true, data: { id, status: "generating", ... } }`

### GET /boq/:id
Get BOQ with sections and items. Requires authentication.

### GET /boq/project/:projectId
List BOQs for a project. Requires authentication.

---

## AI

### POST /ai/complete
AI completion. Requires authentication.

**Body:** `{ messages: [{ role, content }], temperature?, maxTokens?, provider? }`

### POST /ai/analyze-drawing
Analyze drawing data. Requires authentication.

### POST /ai/explain
Plain language explanation. Requires authentication.

**Body:** `{ text }`

### POST /ai/generate-boq/:projectId
Generate BOQ via AI. Requires authentication.

---

## Pricing

### GET /pricing/regions
List all regions. Requires authentication.

### GET /pricing/rates/:regionCode
Get rates for a region. Requires authentication.

### POST /pricing/rates
Create a rate entry. Requires authentication.

**Body:** `{ regionCode, categoryName, itemDescription, unit, rate, currency? }`

---

## Construction Stages

### GET /construction-stages
List all construction stages. Requires authentication.

### GET /construction-stages/boq/:boqId
Get stage breakdown for a BOQ. Requires authentication.

### GET /construction-stages/:stageId/boq/:boqId
Get summary for a specific stage. Requires authentication.

---

## Reports

### POST /reports/generate
Generate a report. Requires authentication.

**Body:** `{ projectId, boqId?, type, format? }`  
**Types:** `executive_summary`, `labour_cost_summary`, `material_quantity_cost_summary`, `material_quantity_summary`, `construction_stage_summary`, `detailed_boq`, `plain_language_explanation`, `ai_disclaimer`  
**Formats:** `pdf`, `excel`

### GET /reports/project/:projectId
List reports for a project. Requires authentication.

### GET /reports/:id
Get report details. Requires authentication.

---

## Exports

### POST /exports
Create a new export. Requires authentication.

**Body:** `{ projectId, boqId?, type, format }`

### GET /exports
List user's exports. Requires authentication.

---

## Payments

### POST /payments/initialize
Initialize subscription payment. Requires authentication.

**Body:** `{ plan, interval }`

### POST /payments/verify
Verify payment. Requires authentication.

**Body:** `{ reference }`

### GET /payments/subscription
Get current subscription. Requires authentication.

### GET /payments/history
Get payment history. Requires authentication.

---

## Notifications

### GET /notifications
List notifications. Requires authentication.

### PATCH /notifications/:id/read
Mark notification as read. Requires authentication.

### PATCH /notifications/read-all
Mark all notifications as read. Requires authentication.

### DELETE /notifications/:id
Delete notification. Requires authentication.

---

## Jobs

### GET /jobs/:id/status
Get background job status. Requires authentication.

---

## Health

### GET /api/health
Health check. No authentication required.

---

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email address"]
    }
  }
}
```

## Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```
