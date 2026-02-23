# Frontend Overview

The frontend is a [Next.js](https://nextjs.org/) application, styled with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) components.

## Pages

| Route | Description | Auth |
|---|---|---|
| `/` | Landing page with license plate check form | No |
| `/auth/login` | Login page | No |
| `/auth/register` | Registration page | No |
| `/checks` | Dashboard of user's license plate checks | Yes |
| `/workflows` | Workflow management list | Yes |
| `/workflows/[id]` | Workflow detail with execution history | Yes |
| `/builder` | Visual workflow builder canvas | Yes |
| `/profile` | User profile and settings | Yes |

Protected pages redirect to `/auth/login?redirect=[path]` when not authenticated. After login, the user is returned to the original page.

<!-- TODO: Add screenshots of each major page -->

## API Communication

All API calls go through an Axios-based client (`lib/api-client.ts`) that provides:

- Automatic Bearer token injection from localStorage
- Retry logic (3 retries with exponential backoff on network errors)
- 401 auto-logout (clears token and redirects to login)
- AbortController support for cancellable requests

Each domain has a dedicated service file that wraps the HTTP calls with typed request/response shapes:

| Service | Endpoints |
|---|---|
| `userService` | `register`, `login`, `getMe`, `updateMe` |
| `checkService` | `createCheck`, `getChecks`, `assignWorkflow`, `deleteCheck` |
| `workflowService` | `getMyWorkflows`, `getById`, `create`, `update`, `publish`, `testExecute`, `getExecution` |
| `cityService` | `getCities` |

## Auth Flow

1. User enters credentials on the login/register page
2. `userService.login()` or `userService.register()` sends the request
3. On success, the JWT token is stored in `localStorage`
4. `AuthProvider` calls `userService.getMe()` to fetch the user profile
5. The `useAuth()` hook updates with the user data
6. The user is redirected back to the previous context (or `/`)

On mount, it checks for an existing token in localStorage and auto-fetches the user profile. 401 responses from any API call trigger an automatic logout. This behaviour needs to be revisited in the future.

## Check Form

<!-- TODO: Add a screenshot of the check form with plate preview -->

The main landing page features a license plate check form with:

- **City picker** — Searchable combobox populated from the `/cities` endpoint
- **Letters input** — Auto-uppercased, max 2 characters, strips non-alphabetic input
- **Numbers input** — Max 4 digits, prevents leading zeros
- **Live plate preview** — Visual German license plate rendering that updates as you type
- **Workflow selector** — Dropdown of published workflows for the selected city
- **Form persistence** — Draft data saved to localStorage, restored on page reload

The form validates using the shared `zCheckRequestScheme` Zod schema. If the user is not logged in, the form data is persisted and the user is redirected to login with a return URL.
