export default {
    SOCKET_IO_PATH: (process.env.SOCKET_IO_PATH || 'socket.io') as string,
    CLIENT_HOST_PATH: (process.env.CLIENT_HOST_PATH || '/') as string
}