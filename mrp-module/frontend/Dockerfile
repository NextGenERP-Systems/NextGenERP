FROM node:20-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_MRP_DEMO_MODE=false
ENV NEXT_PUBLIC_MRP_DEMO_MODE=$NEXT_PUBLIC_MRP_DEMO_MODE
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p public
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3005
ENV PORT 3005
CMD ["node", "server.js"]
