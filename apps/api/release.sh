#!/bin/bash
set -euo pipefail

echo "Running Prisma migrations..."
# Uses prisma.config.ts, which connects over DIRECT_DATABASE_URL (not the pooler).
bunx prisma migrate deploy

echo "Running seed script..."
bun run db:seed

echo "Release tasks completed."
