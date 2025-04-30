# Use Bun official image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app
ENV HOST=0.0.0.0

# Install dependencies once
FROM base AS install

# Copy only the files needed for install
COPY . .

# Install prod dependencies only
RUN bun install

WORKDIR /usr/src/app/apps/api

# Build app and generate Prisma client
RUN bunx prisma generate && \
    bun run build

# Final production image
FROM base AS release

# Optional: ENV for DB
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copy node_modules and dist from previous stage
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY --from=install /usr/src/app .

USER bun
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "bunx prisma migrate deploy && bun run db:seed && bun run start"]
