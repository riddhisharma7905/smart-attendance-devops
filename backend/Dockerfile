FROM node:22-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the backend source code
COPY . .

# Expose the backend port
EXPOSE 5001

# Run the server
CMD ["node", "server.js"]
