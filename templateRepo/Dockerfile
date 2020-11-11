FROM node:latest

WORKDIR /root

ADD package* ./
RUN npm install
ADD . ./

CMD npm start