FROM node:9 as builder
RUN mkdir -p /opt/ptin/amalia/schoolfrontend
WORKDIR /opt/ptin/amalia/schoolfrontend/
ADD src ./src
COPY foundations-webct-* ./
COPY package.json ./
COPY angular.json ./
COPY tsconfig.json ./
COPY tslint.json ./
RUN npm install --verbose
RUN npm rebuild node-sass
RUN npm run buildProd
FROM nginx:1.15.9-alpine
RUN mkdir -p /opt/ptin/amalia/schoolfrontend
WORKDIR /opt/ptin/amalia/schoolfrontend/
## Copy our default nginx config                                                                                   
COPY nginx-config/default.conf /etc/nginx/conf.d/
COPY --from=builder /opt/ptin/amalia/schoolfrontend/dist/schoolFrontEnd-v2 /opt/ptin/amalia/schoolfrontend/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
