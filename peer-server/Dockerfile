FROM node:alpine
ENV PORT=3333
RUN apk --no-cache add git && npm install -g peer
COPY ./entrypoint.sh entrypoint.sh
ENTRYPOINT ./entrypoint.sh
