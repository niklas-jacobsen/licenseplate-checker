# Application of Clean Code

This file provides information on what aspects of writing clean code have been applied in the project

## Table of Contents

- [Principles followed](#principles-followed)
- [Code analysis tools](#code-analysis-tools)

## Principles followed

The following principles of clean code have been implemented.

**Clear project structure for folders and filenames** \
Related files are grouped into folders in accordance with the functionality they provide, e.g. `/controllers` or `/validatiors` which makes scaling of the project much easier. Files also have a matching suffix added to their name to ease navigation when, for example, performing a project-wide search query for a file.

**Functions and classes serve only a single responsibility** \
Functions and classes have been written to be self-documenting and only serving the purpose they were named after according to the Single Responsibility Principle (SRP).

**Reusable components and utilities** \
Reusable common logic, namely validators, utilities, and shared types, have been modularized into reusable components and put into their own subdirectories: `/validators`, `/utils`, `/types`. Reusing these components throughout different parts of the project reduces the risk of inconsistenty that comes with duplicate code.

**Descriptive and Appropriate Error Handling** \
Error messages provide clear information and status codes to the user on what went wrong. This reduces confusion for users of the app and makes debugging easier.

**Avoiding nesting code and early exits** \
Nested if-else statements have been replaced with linear if chains and early return patterns where applicable. This keeps the code easier to follow and overall more beatiful.

**Use of Pure functions** \
Wherever possible, functions have been written to only work with the arguments they are given. Arguments are also self-describing where applicable. For example, environment variables are parsed into typed strings, which allowed functions accessing them to be rewritten to be fully pure.

## Code analysis tools

**Prettier** - Used as an in editor extension as well as a step during linting to ensure code formatting is consistent and readable.

**eslint** - Tool used for linting code before every commit and for every pull request created.

**GitHub CodeQL** - Scanning code for security vulnerabilities on every commit and on a weekly basis. Prevents commits from containing secrets and detects vulnerabilites.

**Dependabot** - Continuously checks for outdated dependencies with the ability to update them with a pull request. Also warns about vulnerabilities in modules.
