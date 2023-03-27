FROM node:16-alpine3.12

ARG DISCORD_GUILD_ID
ARG DISCORD_CLIENT_ID
ARG BOT_TOKEN
ARG BOT_INVISIBLE

ENV NODE_ENV production
ENV LANG C.UTF-8
ENV EDITOR nano

RUN apk add dumb-init
RUN mkdir /data

# APP dir
WORKDIR /app

# NODE_MODULES
COPY package*.json ./
RUN npm install --production

# APP
COPY . .

# REQUIS: les variables d'environnement DISCORD_GUILD_ID, DISCORD_CLIENT_ID et BOT_TOKEN au build fournis en ARGS!
ENV DISCORD_GUILD_ID $DISCORD_GUILD_ID
ENV DISCORD_CLIENT_ID $DISCORD_CLIENT_ID
ENV BOT_TOKEN $BOT_TOKEN
ENV BOT_INVISIBLE $BOT_INVISIBLE

# REGISTER bot commands
RUN node register

# RUN
CMD ["dumb-init", "node", "index"]

