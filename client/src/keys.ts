export default {
    SIGNALLING_SERVER_SOCKET_IO_PATH: (process.env.VUE_APP_SIGNALLING_SERVER_SOCKET_IO_PATH || 'signalling-server/socket.io') as string,
    SIGNALLING_SERVER_URI: (process.env.VUE_APP_SIGNALLING_SERVER_URI || '/')
};