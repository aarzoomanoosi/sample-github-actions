FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node api ./api
COPY --chown=node:node web ./web

USER node

EXPOSE 3000

CMD ["npm", "start"]
