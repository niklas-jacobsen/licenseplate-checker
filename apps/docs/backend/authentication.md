# Authentication

The API uses JSON Web Tokens (JWT) for authentication.

## Flow

1. User registers or logs in via `/auth/register` or `/auth/login`
2. Server returns a signed JWT token
3. Client includes the token in subsequent requests via the `Authorization` header
4. Server verifies the token and extracts the user ID

## Token Details

| Property | Value |
|---|---|
| Algorithm | HMAC SHA-256 |
| Expiration | 30 days |
| Payload | `{ id: userId }` |
| Header format | `Authorization: Bearer <token>` |

## Password Requirements

- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 digit
- At least 1 special character

## Auth Middleware

All routes under `/user/*`, `/request/*`, and most `/builder/*` routes require authentication. The middleware:

1. Extracts the Bearer token from the `Authorization` header
2. Verifies the JWT signature and expiration
3. Stores the user ID in the request context
4. Passes control to the route handler

If the token is missing, malformed, or invalid, the middleware returns a 401 error.

## Frontend Token Management

The Next.js frontend stores the token in `localStorage` and includes it in all API requests via an Axios request interceptor. On receiving a 401 response, the client automatically clears the token and redirects to the login page.

## Internal Endpoints

The webhook and internal endpoints use a shared secret (`X-Webhook-Secret` / `X-Internal-Secret` headers) instead of JWT tokens. These are used exclusively for server-to-server communication with Trigger.dev.
