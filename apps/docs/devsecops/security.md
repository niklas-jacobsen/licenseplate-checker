# Security

## Backend Measures

### Hono Middlewares

**`hono/secure-headers`** — Sets security headers with strong defaults:
- `X-Content-Type-Options: nosniff` — Enforces content types specified by Content-Type header
- `Cross-Origin-Opener-Policy: same-origin` — Prevents cross-origin data leaks
- `Referrer-Policy: no-referrer` — No referrer information shared
- Content Security Policy restricts script, style, font, and image sources to `'self'` and trusted CDNs (jsdelivr, Google Fonts)

**`hono/cors`** — Restricts API calls to predefined origins specified in the `ALLOWED_ORIGINS` environment variable.

**`hono/csrf`** — Origin-based CSRF protection using Hono's built-in CSRF middleware. Validates request origins against `ALLOWED_ORIGINS`.

**`hono/zod-validator`** — Validates all inputs against Zod schemas to prevent injection of malicious data.

**`hono-rate-limiter`** — IP-based rate limiting (1000 requests per IP per 15-minute window by default). Key generation prioritizes `x-forwarded-for`, falling back to `x-real-ip`. Webhook and Trigger.dev requests are exempt. Storage is in-memory.

### Authentication

- JWT tokens signed with HMAC SHA-256 via `jsonwebtoken`
- Passwords hashed with bcrypt (10 salt rounds)
- Webhook and internal endpoints secured with shared secrets
- Auth middleware extracts user ID from token and injects it into the request context
- Custom error types (`MissingTokenError`, `MalformedTokenError`, `InvalidTokenError`) for clear auth failure responses

### Error Handling

- Centralized `AppError` class with typed error codes and HTTP status mapping
- Global error handler catches all unhandled exceptions
- Unhandled errors forwarded to Sentry in production (`NODE_ENV=production`)

## Frontend Measures

**Shared Zod Validators** — All forms validate input client-side using the same Zod schemas used by the backend, preventing invalid data from being submitted.

**Protected Routes** — Pages requiring auth check the user session on load and redirect to login if needed, with return-to-original-page support.

**Token Management** — Auth tokens stored in `localStorage` to persist sessions. Auto-cleared on 401 responses.

**Submit Throttling** — Buttons are disabled after click and re-enabled after the request completes, reducing accidental double-submissions.

## Threat Model

![Threat Model](/threat_model.png)

### Potential Security Concerns

| Risk | Level | Mitigation |
|---|---|---|
| Cross Site Scripting | High | CSP directives, Zod input validation, React's built-in XSS protection |
| Cross Site Request Forgery | High | Origin-based CSRF middleware via `hono/csrf` |
| Rate limiting in-memory | Medium | Sufficient for current scale, plan to move to Redis if needed |
| Dependency vulnerabilities | Medium | Locked dependencies, manual version review |
| Outgoing Denial of Service | Medium | Throttled automation execution, concurrency limit of 5 workers |
| GitHub account compromise | Low | 2FA, hardware security key, limited permissions |
| Cloud data loss | Low | Daily database backups via Supabase, encryption at rest |

### Implemented Mitigations

| Objective | Measure | Description |
|---|---|---|
| Input Integrity | Type Safety | TypeScript and Prisma enforce strict types |
| | Input Validation | Zod schemas validate all user input |
| | Parameterized Queries | Prisma prevents SQL injection |
| | Data Integrity | Daily database backups via Supabase |
| Access Control | VPC | Database inaccessible from public internet |
| | RBAC | Cloud access restricted to specific service accounts |
| | JWT Auth | bcrypt hashing + JWT tokens secure authentication |
| | CSRF | Origin-based validation on all mutating requests |
| Change Control | Branch Protection | PRs require passing lint and test checks |
| | CodeQL | GitHub default setup scans for vulnerabilities |
| Reliability | Rate Limiting | 1000 requests per IP per 15-minute window |
| | Error Monitoring | Sentry captures unhandled exceptions in production |
