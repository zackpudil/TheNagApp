FROM node:latest

WORKDIR /app

COPY *.js /app/
COPY ./controllers/*.js /app/controllers/
COPY ./utils/*.js /app/utils/
COPY ./schedulers/*.js /app/schedulers/

COPY package.json /app

RUN yarn install

EXPOSE 3000
CMD node server.js
