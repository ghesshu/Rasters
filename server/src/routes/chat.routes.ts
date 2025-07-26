import { Router } from "express";
import {
  handleChat,
  getChatHistory,
  getChatMessages,
  createChat,
} from "../controllers/chat.controller";
import { authenticate } from "../middleware/auth.middleware";
import {
  handleEnhancedChat,
  handleStreamingChat,
} from "../controllers/enhanced-chat.controller";

const router = Router();

// Enhanced chat endpoint
router.post("/chat", authenticate, handleEnhancedChat);

// Streaming chat endpoint
router.post("/stream", authenticate, handleStreamingChat);

router.post("/chatt", authenticate, handleChat);
router.get("/chat/history", authenticate, getChatHistory);
router.get("/chat/:chatId/messages", authenticate, getChatMessages);
router.post("/chat/create", authenticate, createChat);

export default router;
