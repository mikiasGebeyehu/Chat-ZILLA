import express from 'express';
import { createServer } from 'http';
import { initSocket } from './lib/socket.js';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import dotenv from 'dotenv';
import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();


const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));
app.use("/api/auth" , authRoutes)
app.use("/api/message", messageRoutes)

app.get('/', (req, res) => {
    res.send('Chat App Backend is running');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
    initSocket(server);
});