
# Use Bun image as base
FROM oven/bun:1.3 AS base
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssl

COPY . .
RUN bun install

# Prisma 7 reads its CLI config from apps/api/prisma.config.ts, so generate
# from that directory. Generating needs no database connection.
RUN cd apps/api && bunx prisma generate

# Final release stage
FROM base AS release
COPY --from=base /usr/src/app/apps/api /usr/src/app/apps/api
COPY --from=base /usr/src/app/packages/shared /usr/src/app/packages/shared

WORKDIR /usr/src/app/apps/api/

USER bun
EXPOSE 8080

CMD ["bun", "run", "start"]