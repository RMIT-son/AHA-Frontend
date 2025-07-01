# Step 1: Build the Vite React App
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Use nginx to serve content
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ✅ Tell Cloud Run we are listening on port 8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
