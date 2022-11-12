# FROM peerjs/peerjs-server:0.5.3

# RUN apk --no-cache add certbot

# WORKDIR /peer-server
# RUN mkdir /peerjs-ssl
# COPY ./entrypoint.sh ./entrypoint.sh
# RUN chmod 775 ./entrypoint.sh
# ENTRYPOINT [ "./entrypoint.sh" ]


FROM peerjs/peerjs-server
RUN apk --no-cache add certbot && npm install -g peer
WORKDIR /app
COPY ./entrypoint.sh entrypoint.sh
RUN ["chmod", "+x", "/app/entrypoint.sh"]
ENTRYPOINT ./entrypoint.sh