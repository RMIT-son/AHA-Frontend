FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

# Copy everything first
COPY . .

# 🔥 Explicitly copy .env.production
COPY .env.production .env.production

# ✅ Set environment + build
ENV NODE_ENV=production
RUN yarn build --mode production

# Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8085
CMD ["nginx", "-g", "daemon off;"]
