# ---------- Builder ----------
    FROM node:20-alpine AS builder
    WORKDIR /app
    RUN corepack enable

    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    COPY . .
    RUN pnpm run build
    
    
    # ---------- Runner ----------
    FROM node:20-alpine
    WORKDIR /app
    RUN corepack enable
    COPY package.json ./
    COPY pnpm-lock.yaml ./
    # RUN NODE_ENV=production
    RUN pnpm install --frozen-lockfile
    
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    
    EXPOSE 3000
    CMD ["pnpm", "start"]
    