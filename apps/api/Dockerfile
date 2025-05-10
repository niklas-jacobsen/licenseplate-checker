
# Use Bun image as base
FROM oven/bun:1.2 AS base
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssl

COPY . .
RUN bun install

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN bunx prisma generate --schema apps/api/prisma/schema.prisma

# Final release stage
FROM base AS release
COPY --from=base /usr/src/app/apps/api /usr/src/app/apps/api
COPY --from=base /usr/src/app/packages/shared /usr/src/app/packages/shared

WORKDIR /usr/src/app/apps/api/

USER bun
EXPOSE 8080

CMD ["bun", "run", "start"]