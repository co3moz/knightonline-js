FROM node:10.14.2
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 80
CMD [ "node", "." ]