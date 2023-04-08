FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g prisma

COPY . .

RUN npm install argon2

RUN npx prisma generate

EXPOSE 3333

CMD [ "npm", "start" ]