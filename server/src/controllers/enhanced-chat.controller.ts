import { Request, Response } from "express";
import { ChatModel } from "../models/chat.model";
import {
  enhancedSearch,
  enhancedIntentDetection,
  smartCryptoRelevanceCheck,
  generateEnhancedAnswer,
  enhancedScrapeUrls
} from "../utils/enhanced-chatbot";
import { AuthRequest } from "../middleware/auth.middleware";

// Update the import
import { 
  generateCryptoFinancialAdvice, 
  fetchCryptoData, 
  searchCrypto,
  getTrendingCryptos,
  getMarketMovers
} from "../utils/meme-coin-advisor";

// Update the handleEnhancedChat function
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

    // Get conversation history
    const conversationHistory = chatSession.messages.map(msg => ({
      sender: msg.sender,
      content: msg.content
    }));

    const recentMessages = conversationHistory.slice(-10).map(msg => msg.content);

    // Get comprehensive crypto data
    const [searchData, cryptoData, trendingData] = await Promise.all([
      enhancedSearch(chatMessage),
      fetchCryptoData(chatMessage), // Now handles ANY crypto
      getTrendingCryptos()
    ]);

    const searchContext = [
      ...searchData.serpResults.map(r => r.snippet),
      ...searchData.newsResults.map(r => r.snippet)
    ].join(' ');

    // Enhanced intent detection (fixed)
    const intentAnalysis = await enhancedIntentDetection(chatMessage, recentMessages);

    // Smart relevance check (now allows all crypto)
    const relevanceCheck = await smartCryptoRelevanceCheck(
      chatMessage,
      recentMessages,
      searchContext
    );

    if (!relevanceCheck.shouldRespond) {
      const politeDecline = `🚀 Hey there! I'm CRYPTO CHAD, your aggressive crypto advisor! I cover ALL cryptocurrencies - Bitcoin, Ethereum, meme coins, DeFi, Layer 2s, you name it! 💎🙌 ${relevanceCheck.suggestion || 'Ask me about any crypto to buy, sell, or HODL! 🚀'}`;
      
      chatSession.messages.push({
        sender: "ai",
        content: politeDecline
      });
      
      await chatSession.save();
      
      res.json({
        message: politeDecline,
        intent: intentAnalysis.intent,
        cryptoRelevance: intentAnalysis.cryptoRelevance,
        streaming: false
      });
      return;
    }

    // Generate comprehensive crypto financial advice
    const answer = await generateCryptoFinancialAdvice(
      chatMessage,
      conversationHistory,
      searchData,
      cryptoData
    );

    // Add AI response
    chatSession.messages.push({ sender: "ai", content: answer });
    await chatSession.save();

    res.json({
      message: answer,
      intent: intentAnalysis.intent,
      cryptoRelevance: intentAnalysis.cryptoRelevance,
      confidence: intentAnalysis.confidence,
      cryptoData: cryptoData,
      trendingData: trendingData,
      streaming: true,
      chatId: chatSession._id
    });

  } catch (error: any) {
    console.error('Enhanced chat error:', error);
    res.status(500).json({ 
      message: "🚀 CRYPTO CHAD is having technical difficulties! But keep HODLing! 💎🙌", 
      error: error.message 
    });
  }
}

// Streaming response endpoint
export async function handleStreamingChat(req: AuthRequest, res: Response) {
  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Implementation for streaming responses would go here
    // This is a placeholder for the streaming functionality
    
    res.write(`data: ${JSON.stringify({ type: 'start', message: 'Processing your request...' })}\n\n`);
    
    // Process the request (similar to handleEnhancedChat but with streaming)
    // ...
    
    res.write(`data: ${JSON.stringify({ type: 'end', message: 'Response complete' })}\n\n`);
    res.end();
    
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
}

// Export existing functions with enhancements
export { getChatHistory, getChatMessages, createChat } from './chat.controller';