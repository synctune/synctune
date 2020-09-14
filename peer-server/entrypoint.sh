#!/bin/sh

# export CERT_PATH=/peerjs-ssl/peerjs.cert
# export KEY_PATH=/peerjs-ssl/peerjs.key

# certbot certonly --standalone --agree-tos --cert-path "$CERT_PATH" --key-path "$KEY_PATH" --email antonwizkam@gmail.com --non-interactive

# node bin/peerjs --port 443 --sslkey "$KEY_PATH" --sslcert "$CERT_PATH"

node bin/peerjs --port 443