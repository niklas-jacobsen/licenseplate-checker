# Backend Overview

The backend is a REST API built with [Hono](https://hono.dev/) running on [Bun](https://bun.sh/).

**Base URLs:**
- Local: `http://localhost:8080`
- Production: `https://api.lp-checker.com`
- Staging: `https://staging.lp-checker.com`

## Interactive API Reference

A full interactive API reference with request/response schemas, try-it-out functionality, and example payloads is available at [`/docs`](https://api.lp-checker.com/docs) on the API server, powered by [Scalar](https://scalar.com/). The underlying OpenAPI 3.0 spec is served at [`/openapi.json`](https://api.lp-checker.com/openapi.json).

## Response Format

All endpoints return JSON with a consistent shape:

```json
// Success
{ "ok": true, "data": { ... } }

// Error
{ "ok": false, "error": { "code": "ERROR_CODE", "message": "Description" } }
```

## Rate Limiting

All endpoints are rate-limited per IP address. Defaults:
- **Window:** 15 minutes
- **Max requests:** 1000 per window

The builder test-execute endpoint has an additional daily limit to prevent abuse.

## Error Codes

| Code | Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation |
| `MISSING_TOKEN` | 401 | No Authorization header provided |
| `INVALID_TOKEN` | 401 | JWT is invalid or expired |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
