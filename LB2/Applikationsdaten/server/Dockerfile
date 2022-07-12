FROM node:16 

WORKDIR /app/

RUN apt update 

COPY . /app/

COPY package*.json .

RUN npm install

COPY . .

ENV API_PORT=3001

ENV SOCKETIO_SERVER_PORT=3000

EXPOSE 3001

EXPOSE 3000

CMD [ "npm", "start"]