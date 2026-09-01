ARG NODE_VERSION=22.9.0

FROM node:${NODE_VERSION}-alpine

#ENV NODE_ENV development

WORKDIR /usr/src/app

COPY ./package.json package-lock.json ./ 
RUN npm ci --legacy-peer-deps 

COPY . .

EXPOSE 5173

CMD ["npm", "run", "start"]
