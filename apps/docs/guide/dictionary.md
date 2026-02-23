# Dictionary

Definitions for frequently used terms throughout this project.

## LicenseplateCheck

> A record created by a user to monitor a personalized license plate combination.

A check consists of a `city`, `letters`, and `numbers` field modelled after the German license plate system. Checks are validated against Zod schemas shared between frontend and backend.

### Fields

- **cityId** — A German city code (1–3 characters, e.g. `B`, `HH`, `KA`). Must match an entry in the `CityAbbreviation` table
- **letters** — 1–2 uppercase letters chosen by the user
- **numbers** — 1–4 digits, no leading zeros allowed

### Check Status

| Status | Description |
|---|---|
| `UNCHECKED` | Check created, no execution has run yet |
| `AVAILABLE` | License plate is available for reservation |
| `NOT_AVAILABLE` | License plate is taken or otherwise unavailable |
| `ERROR_DURING_CHECK` | Workflow execution failed |

## CityAbbreviation

> A German city or region whose reservation website is supported by the system.

### Fields

- **id** — 1–3 character abbreviation (e.g. `B`, `HH`, `KA`)
- **name** — Full display name
- **websiteUrl** — URL of the city's license plate reservation website
- **allowedDomains** — Domains the workflow executor is allowed to navigate to
- **isPublic** — Whether the city is visible to all users. Hides authority exclusive plates

## Workflow

> A visual automation definition that describes how to check a license plate on a city's reservation website.

Workflows consist of **nodes** (actions like click, type, wait) and **edges** (connections between nodes). They are built using the [Builder](/frontend/builder), compiled to an intermediate representation (IR), and executed as Playwright code via Trigger.dev.

A workflow is either **draft** (editable, `isPublished = false`) or **published** (validated, compiled, `isPublished = true`). Publishing requires a successful test execution first.

## WorkflowExecution

> A single run of a workflow, either as a test or a scheduled check.

### Execution Status

| Status | Description |
|---|---|
| `PENDING` | Queued, waiting to run |
| `RUNNING` | Currently executing |
| `SUCCESS` | Completed successfully |
| `FAILED` | Execution encountered an error |

### Fields

- **logs** — JSON array of step-by-step execution logs
- **result** — JSON object with outcome (`available` / `unavailable`)
- **duration** — Execution time in milliseconds
- **errorMessage** / **failedAtNode** — Error details if the execution failed and on what node

## Template Variables

Placeholders in workflow node fields that are resolved at execution time. They are used as a reference for all checks executed with a workflow to input the check information into the correct fields on a city's website.
Available for Type Text, Select Option and Conditional nodes.

**License Plate variables:** CityId, Letters, Numbers, Full Plate

**User Profile group:** Saluation, Firstname, Lastname, Birthdate, Street, Streetnumber, Zipcode, City

## Node

> A single step in a workflow graph.

Each node has a **type** (e.g. `core.click`), **configuration** (e.g. CSS selector), **input handles** (incoming connections), and **output handles** (outgoing connections). See [Node Types](/frontend/node-types) for a full reference.

## Domain-Specific Language (DSL)

> A programming language designed for a specific problem domain rather than general-purpose use.

In this project, the workflow system acts as a visual DSL for browser automation. Users define automation steps through nodes and edges instead of writing code. The DSL is compiled into an [Intermediate Representation (IR)](#intermediate-representation-ir) for execution.

## Intermediate Representation (IR)

> The compiled form of a workflow graph, used for execution.

The IR transforms the visual graph into a flat list of blocks (action blocks, branch blocks, start/end blocks) that the executor can process sequentially. The compiler validates the graph, resolves edges into block references, and produces a JSON structure versioned by `irVersion` and `registryVersion`.
