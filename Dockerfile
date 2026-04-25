# ---------- Build stage ----------
FROM node:20 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- Production stage ----------
FROM node:20 AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only what we need
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/next.config.* ./

EXPOSE 3000

USER node

CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]