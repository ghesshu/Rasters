import { Response } from "express";
import { ChatModel } from "../models/chat.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateEnhancedAnswer } from "../utils/enhanced-chatbot";
import { getChatHistory, getChatMessages, createChat } from "./chat.controller";

export async function handleEnhancedChat(req: AuthRequest, res: Response) {
  try {
    // Extract message and chat ID
    let chatMessage: string;
    let chatId: string | undefined;

    if (typeof req.body.chat === "object" && req.body.chat !== null) {
      chatMessage = req.body.chat.chat;
      chatId = req.body.chat.chatId;
    } else {
      chatMessage = req.body.chat;
      chatId = req.body.chatId;
    }

    const userId = req.user._id;

    // Find or create chat session
    let chatSession;
    if (chatId) {
      chatSession = await ChatModel.findOne({ _id: chatId, user: userId });
    } else {
      chatSession = await ChatModel.findOne({ user: userId }).sort({
        updatedAt: -1,
      });
    }

    if (!chatSession) {
      chatSession = new ChatModel({ user: userId, messages: [] });
    }

    // Add user message
    chatSession.messages.push({ sender: "user", content: chatMessage });

    // Get conversation history for context
    const conversationHistory = chatSession.messages
      .slice(-10) // Last 10 messages for context
      .map((msg) => ({
        sender: msg.sender,
        content: msg.content,
      }));

    // Generate expert response
    const response = await generateEnhancedAnswer(
      chatMessage,
      conversationHistory
    );

    // Add AI response
    chatSession.messages.push({ sender: "ai", content: response });
    await chatSession.save();

    res.json({
      message: response,
      intent: "expert_response",
      confidence: 1.0,
      streaming: false,
      chatId: chatSession._id,
    });
  } catch (error: any) {
    console.error("Enhanced chat error:", error);
    res.status(500).json({
      message: "I'm experiencing some technical difficulties. Please try your question again.",
      error: error.message,
    });
  }
}

// Export existing functions from chat.controller
export { getChatHistory, getChatMessages, createChat };
