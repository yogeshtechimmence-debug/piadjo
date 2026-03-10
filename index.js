import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import figures from "figures";
import path from "path";
import { createServer } from "http";
import auth_Routes from "./router/AuthAllRoutes/auth.routes.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use("/piadjo", auth_Routes);


const PORT = process.env.PORT ;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} ${figures.tick}`);
});
