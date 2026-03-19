import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import figures from "figures";
import path from "path";
import http from "http";
import auth_Routes from "./router/AuthAllRoutes/auth.routes.js";
import { initSocket } from "./Soket/socket.js";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const io = new Server(server, {
  cors: { origin: "*" },
}); 

initSocket(io);


app.use("/piadjo", auth_Routes);

const PORT = process.env.PORT;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} ${figures.tick}`);
});
