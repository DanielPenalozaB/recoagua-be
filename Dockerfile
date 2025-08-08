FROM node:20-slim

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy all other files
COPY . .

# Build the app (only needed for production)
# RUN npm run build

# Expose the app port
EXPOSE 4000

# Start the app (default command, can be overridden in compose)
CMD ["npm", "run", "start:prod"]