import express from "express";
import { protectedRoute } from '../middleware/auth.middleware.js';
import { getMessages, getUserForSidebar, sendMessage, markAsRead } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectedRoute, getUserForSidebar);
router.get("/:id", protectedRoute, getMessages);

router.post("/send/:id", protectedRoute, sendMessage);
router.post("/:id", protectedRoute, sendMessage);
router.post("/read/:id", protectedRoute, markAsRead);

export default router;