# Production image for SATDAF (Express + Vite build).
# Development/preview uses the Base44 compose setup instead; this file is for a VPS.

FROM node:22-bookworm-slim AS build
WORKDIR /app

# package-lock.json is out of sync with package.json, so resolve from package.json.
# --legacy-peer-deps: @tailwindcss/vite and recharts peer ranges conflict.
COPY package.json ./
RUN npm install --no-package-lock --legacy-peer-deps --no-audit --no-fund \
    && npm install react-is@^19 --no-save --no-package-lock --legacy-peer-deps --no-audit --no-fund

COPY . .
RUN npm run build


FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# server.ts is bundled by esbuild with external packages, so runtime keeps node_modules.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
