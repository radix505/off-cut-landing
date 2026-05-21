FROM node:20-bookworm-slim AS build

WORKDIR /app

# Vite bakes VITE_* env vars into the static bundle at build time, so any
# such variable has to arrive as a Docker --build-arg and be re-exported
# as ENV before `npm run build` runs. Add new build-args here when you
# introduce more VITE_* knobs.
ARG VITE_GTM_ID=""
ENV VITE_GTM_ID=$VITE_GTM_ID

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
ENV DB_PATH=/data/bookings.sqlite

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src/data ./src/data
COPY --from=build /app/package.json ./package.json

RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]
