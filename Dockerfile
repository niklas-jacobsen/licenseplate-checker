# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

ENV HOST=0.0.0.0

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bunx prisma generate
# [optional] tests & build
# RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app .

# run the app
USER bun
EXPOSE 8080

#RUN bunx prisma migrate deploy

# Use ENTRYPOINT to run the migration before starting the app
ENTRYPOINT ["sh", "-c", "bunx prisma migrate deploy && bun run start"]

