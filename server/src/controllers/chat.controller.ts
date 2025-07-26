import { Request, Response } from "express";
import { ChatModel } from "../models/chat.model";
import {
  detectIntent,
  fetchFromSerp,
  generateAnswer,
  isCrypto,
  scrapeUrls,
} from "../utils/chatbot";
import { AuthRequest } from "../middleware/auth.middleware";

export async function handleChat(req: AuthRequest, res: Response) {
  try {
    // Extract chat message and chatId from request body
    // Handle both formats: {chat: string} and {chat: {chat: string, chatId: string}}
    let chatMessage: string;
    let chatId: string | undefined;

    if (typeof req.body.chat === "object" && req.body.chat !== null) {
      // Format: {chat: {chat: string, chatId: string}}
      chatMessage = req.body.chat.chat;
      chatId = req.body.chat.chatId;
    } else {
      // Format: {chat: string, chatId?: string}
      chatMessage = req.body.chat;
      chatId = req.body.chatId;
    }

    const userId = req.user._id; // Get user ID from middleware

    // Find the specific chat by ID instead of the most recent one
    let chatSession;
    if (chatId) {
      chatSession = await ChatModel.findOne({ _id: chatId, user: userId });
    } else {
      // Fallback to the previous behavior if no chatId is provided
      chatSession = await ChatModel.findOne({ user: userId }).sort({
        updatedAt: -1,
      });
    }

    if (!chatSession) {
      chatSession = new ChatModel({ user: userId, messages: [] });
    }

    // Add the message content as a string, not an object
    chatSession.messages.push({ sender: "user", content: chatMessage });

    const serpResults = await fetchFromSerp(chatMessage);
    const snippets = serpResults.map((r) => r.snippet).join("\n\n");
    const urls = serpResults.map((r) => r.url);
    const intent = await detectIntent(chatMessage);
    const cryptoRelated = await isCrypto(chatMessage, snippets);
    if (!cryptoRelated) {
      chatSession.messages.push({
        sender: "ai",
        content: "Please ask a crypto-related question.",
      });
      await chatSession.save();
      res.json({
        message: "Please ask a crypto-related question.",
        streaming: false,
        // intent,
        // snippets,
        // urls,
      });
      return;
    }
    const scraped = await scrapeUrls(urls);
    const scrapedText = scraped
      .map((r) => `From ${r.url}: ${r.content}`)
      .join("\n\n");
    const answer = await generateAnswer(
      chatMessage,
      snippets + "\n\n" + scrapedText,
      intent
    );
    chatSession.messages.push({ sender: "ai", content: answer });
    await chatSession.save();
    res.json({ intent, message: answer, streaming: true });
    return;
  } catch (e: any) {
    res.status(500).json({ message: "Something went wrong", error: e.message });
    return;
  }
}

// Endpoint to get all chat history for a user
export async function getChatHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user._id;
    const chats = await ChatModel.find({ user: userId }).sort({
      updatedAt: -1,
    });
    res.json(chats);
  } catch (e: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch chat history", error: e.message });
  }
}

export async function getChatMessages(req: Request, res: Response) {
  try {
    const { chatId } = req.params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    res.json(chat.messages);
  } catch (e: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: e.message });
  }
}

export async function createChat(req: AuthRequest, res: Response) {
  try {
    const { title } = req.body;
    const userId = req.user._id;

    // Create a new chat with the provided title
    const newChat = new ChatModel({
      user: userId,
      messages: [],
      title: title,
    });

    await newChat.save();

    res.status(201).json({
      message: "Chat created successfully",
      chat: newChat,
    });
  } catch (e: any) {
    res
      .status(500)
      .json({ message: "Failed to create chat", error: e.message });
  }
}
