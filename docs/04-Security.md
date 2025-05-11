# Security

This document contains information on security aspects of this project.
It is recommended to first read the general README file located in the project's root folder.

## Table of Contents

- [Backend Measures](#backend-measures)
- [Frontend Measures](#frontend-measures)
- [Threat Model](#threat-model)
- [Potential security concerns](#potential-security-concerns)
- [Mitigations implemented](#mitigations-implemented)

## Backend Measures

### Hono

Hono was chosen as a framework as it comes with many features out of the box, resulting in less dependency on external packages.
The following built-in middlewares were used:

**`hono/secure-headers`** \
Secure header configuration with strong default settings similar to [helmet](https://www.npmjs.com/package/helmet).
The following settings have been set beyond the defaults:

**X-Content-Type-Options 'nosniff'** - Enforces content types specified by Content-type header \
**Cross-Origin-Opener-Policy 'same-origin'** - Helps prevent cross-origin data leaks and improves isolation for security. \
**Referrer-Policy: 'no-referrer'** - Ensures no referrer information is shared. \
**X-Frame-Options 'false'** - Disables deprecated header \
**X-XSS-Protection 'false'** - Disables deprecated header \
<br>

**`hono/cors`** \
Ensures API calls can only happen from predefined sources that are specified in an environment variable.

**`hono/zod-validator`** \
Validates all inputs against custom zod schemas to ensure inputs are in the correct format and prevent injection of malicious data.

**`hono-rate-limiter`** \
IP-based rate limiting with refresh window and limit per window set in the environment variables. Provides response headers with rate limit information by default which have been disabled.

## Frontend Measures

### Client-side Safeguards

**Client-side Data Preservation (LocalStorage)**  
User authentication tokens are stored in `localStorage` to keep users logged in across browser sessions. This avoids forcing users to log in repeatedly while still enabling manual logout and expiration handling.

**Form Handling with Zod Validators**  
All forms use shared Zod schemas from the backend to validate user input on the client side before sending it to the server. This prevents invalid or malformed data from being submitted in the first place.

**Submit Button Rate-Limiting**  
To avoid users spamming forms or double-submitting, the submit button is disabled after it is clicked and only re-enabled after the request finishes. This works in conjunction with the backend's rate limiter, reducing accidental repeat requests and helping protect the backend.

**Protected Routes with Redirects**  
Pages that require authentication check if a user is logged in before rendering. If not, the user is redirected to the login page. After logging in, they are sent back to the page they originally tried to access. This, together with the data preservation optimizes the user flow to reduce confusion.

**Error Display in UI**  
When API calls fail or validation does not pass, clear error messages are shown next to the relevant input or as alerts. This helps users understand what went wrong and reduces confusion.


## Threat Model

The threat model can be viewed [here](./assets/threat_model.png)
It contains two versions, as the frontend is not yet implemented. The version including the frontend is for future reference.

### Potential security concerns

| **Risk**                                   | **Risk Level** | **Possible Mitigations**                                                                                                                                                        |
| ------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross Site Request Forgery                 | High           | Implement CSRF Token to prevent malicious requests from foreign domains.                                                                                                        |
| Cross Site Scripting                       | High           | Basic mitigations implemented, increased protection by implementing CSRF Token. Minimize script tags in HTML and define script-related CSP directives.                          |
| Rate limiting information stored in memory | High           | Plan to transition rate limiting to a distributed cache system (e.g., Redis) as the system scales; monitor for memory usage and scaling needs.                                  |
| Dependency on external packages            | Medium         | Use verified, well-maintained packages; lock dependencies; scan for vulnerabilities regularly; consider alternative tools to enhance package security (e.g., Snyk, Dependabot). |
| Outgoing Denial of Service                 | Medium         | Accessing external websites using automations requires measures to not accidentally overload them                                                                               |
| Access to GitHub account                   | Low            | Enable two-factor authentication (2FA) and use a hardware security key; limit permissions; regularly review account access logs.                                                |
| Access to Google Cloud                     | Low            | Use least-privilege access principles; implement identity and access management (IAM) roles with minimal required permissions; enable audit logging.                            |
| Google Cloud data loss or data leak        | Low            | Regularly back up data to a separate location; use data encryption; implement monitoring; establish disaster recovery and incident response plans.                              |

### Mitigations implemented

| **Security Objective**            | **Measure**                      | **Description**                                                                                                                                            |
| --------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input and Data Integrity          | Type Safety                      | TypeScript and Prisma enforce strict type safety, minimizing the risk of runtime errors and unintended data modifications.                                 |
|                                   | Input Validation                 | Custom Zod schemas validate user inputs, ensuring only authorized data structures are accepted and preventing injection of unauthorized or malformed data. |
|                                   | Parameterized Queries            | Queries to the database are parameterized to prevent SQL injection attacks, securing database interactions against unauthorized modifications.             |
|                                   | Data Integrity                   | Daily database backups enable point-in-time recovery, preserving data integrity and continuity during outages or attacks.                                  |
| Access Control and Authentication | Virtual Private Cloud (VPC)      | The database resides in a VPC, making it inaccessible from the public internet and limiting access to authorized Google Cloud accounts.                    |
|                                   | Role-Based Access Control (RBAC) | Access to cloud environments and deployment triggers is limited to specific service accounts, enforcing privilege restrictions.                            |
|                                   | Authentication                   | JWTs with bcrypt hashing secure user authentication, reducing risk of unauthorized access and spoofed identities.                                          |
| Change and Quality Control        | Branch Protection                | Pull requests from `dev` to `staging` require passing linting and testing checks, ensuring code quality and traceable changes.                             |
|                                   | Code scanning                    | CodeQL analyzes code for potential security vulnerabilities, identifying weaknesses before deployment. Scans occur for every PR, on push and weekly        |
|                                   | Dependency Management            | Dependabot checks for security risks in the project's dependencies and keeps them up to date.                                                              |
| Threat Detection and Prevention   | Vulnerability Scanning           | Automated scans detect vulnerabilities in Docker images and the PostgreSQL database, reducing risks from known security issues.                            |
|                                   | Cross-Origin Resource-Sharing    | Configured to only allow requests from domains specified in the respective environment variable                                                            |
| Service Reliability               | Rate Limiting                    | A rate limiter restricts each IP to 100 requests per 15 minutes, reducing risk of abuse and DoS attacks.                                                   |