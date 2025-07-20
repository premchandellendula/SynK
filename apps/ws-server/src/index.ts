import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from "http";
import cors from 'cors'
import { initializeSocket } from './socket';

const app = express();
const server = createServer(app);

const allowedOrigins = ["http://localhost:3000"]
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

app.get("/", (req, res) => {
    res.send("Server is live!");
});

initializeSocket(server, allowedOrigins);

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});