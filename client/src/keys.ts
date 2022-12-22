export default {
  ROOM_SERVER_URL: (import.meta.env.VITE_APP_ROOM_SERVER_URL ||
    "/room-server") as string,

  PEERJS_HOST: import.meta.env.VITE_APP_PEERJS_HOST as string,
  PEERJS_PATH: import.meta.env.VITE_APP_PEERJS_PATH as string,
  PEERJS_PORT: parseInt(import.meta.env.VITE_APP_PEERJS_PORT!),
  PEERJS_SECURE: (import.meta.env.VITE_APP_PEERJS_SECURE as string) === "true",
};
