# Stage 1: Build the React application
FROM node:22-alpine AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
# We use VITE_API_URL=/api so that the built frontend calls relative /api
# which nginx will proxy to the backend container.
RUN VITE_API_URL=/api npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
