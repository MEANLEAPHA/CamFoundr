import { io } from "socket.io-client";

let socket = null;

export const connectSocket = ({ token, userId, username, avatar_url }) => {

  if (!token || !userId) {
    console.error("Invalid socket auth");
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(
    import.meta.env.VITE_SERVER_URL,
    {
      auth: {
        token,
      },

      query: {
        userId,
        username,
        avatar_url
      },

      transports: ["websocket"],

      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    }
  );

  return socket;
};

export const disconnectSocket = () => {

  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;