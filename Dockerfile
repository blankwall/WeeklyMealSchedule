# Use Node.js 18 Alpine as the base image
FROM node:18-alpine

RUN apk update && apk add bash

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Set environment variable to development mode
ENV NODE_ENV=development

# Expose port 3000 (Next.js default port for development)
EXPOSE 3000

# Start the development server (Next.js default for dev mode)
CMD ["npm","run","dev"]
