// backend/src/index.js
import express from 'express';
import { createServer } from 'http';
import { initSocket } from './lib/socket.js';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN 
  || (process.env.NODE_ENV === 'production' 
      ? 'https://chat-zilla-frontend-mhba.onrender.com'
      : 'http://localhost:5173');

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Handle preflight for all routes
app.options('*', cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
    // Absolute path from backend/src to frontend/dist
    const frontendPath = path.join(__dirname, '../../frontend/dist'); 
    app.use(express.static(frontendPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}


// Start server & initialize DB + Socket
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
  initSocket(server);
});
