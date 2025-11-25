# ---------
# Build stage
# ---------
FROM node:20-alpine AS build
WORKDIR /app

# Copy only the package manifests first for better layer caching
COPY package*.json ./
COPY vite-react-template-main/package*.json ./vite-react-template-main/

# Install dependencies (root postinstall installs the app deps in the subfolder)
RUN npm ci

# Copy the application source
COPY vite-react-template-main ./vite-react-template-main

# Build the app (runs the sub-project build via root script)
RUN npm run build

# ---------
# Runtime stage
# ---------
FROM nginx:1.27-alpine AS runtime

# Copy built assets to nginx html directory
COPY --from=build /app/vite-react-template-main/dist /usr/share/nginx/html

# Use SPA-friendly nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 by convention
EXPOSE 80

# Use default nginx startup
CMD ["nginx", "-g", "daemon off;"]
