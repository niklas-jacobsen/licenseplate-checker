# Use the official Bun image
FROM ghcr.io/oven-sh/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package files and bun.lockb if it exists
COPY package.json bun.lockb* ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Expose the port that the application will run on
EXPOSE 3000

# Start the application with database migrations
CMD ["sh", "-c", "npx prisma migrate deploy && bun run start"]
