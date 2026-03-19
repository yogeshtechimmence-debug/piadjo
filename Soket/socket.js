// socket.js
let io;

export const initSocket = (server) => {
  io = server;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_chat", ({ offer_id }) => {
      const room = `OFFER_${offer_id}`;
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};