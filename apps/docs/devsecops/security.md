# Security

## Backend Measures

### Hono Middlewares

**`hono/secure-headers`** — Sets security headers with strong defaults:
- `X-Content-Type-Options: nosniff` — Enforces content types specified by Content-Type header
- `Cross-Origin-Opener-Policy: same-origin` — Prevents cross-origin data leaks
- `Referrer-Policy: no-referrer` — No referrer information shared
- `X-Frame-Options` — Disabled (deprecated header)
- `X-XSS-Protection` — Disabled (deprecated header)
- Content Security Policy configured for the Scalar API docs UI

**`hono/cors`** — Restricts API calls to predefined origins specified in the `ALLOWED_ORIGINS` environment variable.

**`hono/zod-validator`** — Validates all inputs against Zod schemas to prevent injection of malicious data.

**`hono-rate-limiter`** — IP-based rate limiting with configurable window and request limits. Response headers with rate limit info are disabled.

### Authentication

- JWT tokens signed with HMAC SHA-256
- Passwords hashed with bcrypt (10 salt rounds)
- Webhook and internal endpoints secured with shared secrets

## Frontend Measures

**Client-side Data Preservation** — Auth tokens stored in `localStorage` to persist sessions. Auto-cleared on 401 responses.

**Shared Zod Validators** — All forms validate input client-side using the same Zod schemas used by the backend, preventing invalid data from being submitted.

**Submit Button Rate-Limiting** — Buttons are disabled after click and re-enabled after the request completes, reducing accidental double-submissions.

**Protected Routes** — Pages requiring auth check the user session on load and redirect to login if needed, with return-to-original-page support.

**Error Display** — Clear error messages shown next to relevant inputs when validation fails or API calls error.

## Threat Model

### Potential Security Concerns

| Risk | Level | Mitigations |
|---|---|---|
| Cross Site Request Forgery | High | CSRF Token implementation planned |
| Cross Site Scripting | High | CSP directives, input validation |
| Rate limiting in-memory | High | Plan to move to Redis as system scales |
| Dependency vulnerabilities | Medium | Dependabot, locked dependencies, vulnerability scanning |
| Outgoing Denial of Service | Medium | Throttled automation execution |
| GitHub account compromise | Low | 2FA, hardware security key, limited permissions |
| Cloud data loss | Low | Regular backups, encryption, monitoring |

### Implemented Mitigations

| Objective | Measure | Description |
|---|---|---|
| Input Integrity | Type Safety | TypeScript and Prisma enforce strict types |
| | Input Validation | Zod schemas validate all user input |
| | Parameterized Queries | Prisma prevents SQL injection |
| | Data Integrity | Daily database backups via Supabase |
| Access Control | VPC | Database inaccessible from public internet |
| | RBAC | Cloud access restricted to specific service accounts |
| | JWT Auth | bcrypt hashing secures authentication |
| Change Control | Branch Protection | PRs require passing lint and test checks |
| | CodeQL | Scans for vulnerabilities on every PR and weekly |
| | Dependabot | Monitors and updates vulnerable dependencies |
| Reliability | Rate Limiting | 1000 requests per IP per 15-minute window |
