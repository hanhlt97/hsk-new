FROM node:24-alpine
ENV NODE_ENV=production PORT=3000 DB_PATH=/data/data.db
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY public ./public
RUN mkdir -p /data && chown -R node:node /data /app
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/me || exit 1
CMD ["node", "server/index.js"]
