FROM node:8
WORKDIR /auth-app
COPY package.json /auth-app
RUN npm install
COPY . /auth-app
#CMD node server.js
CMD ["npm","start"]docker 
EXPOSE 8092
