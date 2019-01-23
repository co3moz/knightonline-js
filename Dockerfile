FROM node:10.14.2
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 15100-15109 15001
CMD [ "node", "." ]