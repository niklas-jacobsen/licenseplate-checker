#!/bin/bash
set -euo pipefail

echo "Running Prisma migrations..."
bunx prisma migrate deploy --schema prisma/schema.prisma

echo "Running seed script..."
bun run db:seed

echo "Release tasks completed."
