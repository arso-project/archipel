FROM mhart/alpine-node:10

WORKDIR /app
COPY . .

# If you have native dependencies, you'll need extra tools
RUN apk add --no-cache make gcc python git

RUN yarn install
RUN yarn run bootstrap
RUN yarn run build

EXPOSE 8080
EXPOSE 3282/udp
EXPOSE 3282/tcp

CMD ["yarn", "start"]
