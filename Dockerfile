FROM node:16

# Install build tools and dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g prisma

COPY . .
COPY tsconfig.json ./

# Rebuild the argon2 binary
RUN npm rebuild argon2

RUN npx prisma generate
RUN npm run build

EXPOSE 3333

CMD [ "node", "dist/index.js" ]