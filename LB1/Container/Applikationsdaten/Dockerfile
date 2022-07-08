FROM node:16

RUN apt update

WORKDIR /app/

COPY package*.json ./

COPY app.js ./

RUN npm install

EXPOSE 8080

CMD [ "npm", "start"]