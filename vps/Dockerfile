FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.js ./
ENV NODE_ENV=production
EXPOSE 3210
CMD ["node", "server.js"]
