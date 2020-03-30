FROM node:alpine
RUN apk --no-cache add git && npm install -g peer
COPY ./entrypoint.sh entrypoint.sh
ENV PORT=3333
ENTRYPOINT ./entrypoint.sh
