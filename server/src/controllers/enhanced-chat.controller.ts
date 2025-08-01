import { Request, Response } from "express";
import { ChatModel } from "../models/chat.model";
import { openai } from "../utils/openai";
import { AuthRequest } from "../middleware/auth.middleware";

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
        role:
          msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }));

    // Check if it's meme coin related
    const isMemeCoinRelated = checkMemeCoinRelevance(chatMessage);

    if (!isMemeCoinRelated) {
      const redirectMessage =
        "🚀 Yo! I'm the MEME COIN KING! 👑 I only deal with the most degen meme coins - DOGE, SHIB, PEPE, FLOKI, BONK, WIF, and all the wild ones! 🐕🐸🚀 Ask me about meme coins and I'll give you the alpha! 💎🙌";

      chatSession.messages.push({ sender: "ai", content: redirectMessage });
      await chatSession.save();

      return res.json({
        message: redirectMessage,
        intent: "redirect",
        confidence: 1.0,
        streaming: false,
        chatId: chatSession._id,
      });
    }

    // Generate meme coin expert response
    const response = await generateMemeCoinResponse(
      chatMessage,
      conversationHistory
    );

    // Add AI response
    chatSession.messages.push({ sender: "ai", content: response.content });
    await chatSession.save();

    res.json({
      message: response.content,
      intent: response.intent,
      confidence: response.confidence,
      streaming: true,
      chatId: chatSession._id,
    });
  } catch (error: any) {
    console.error("Meme coin chat error:", error);
    res.status(500).json({
      message: "🐕 DOGE is having a ruff day! Try again, diamond hands! 💎🙌",
      error: error.message,
    });
  }
}

function checkMemeCoinRelevance(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Meme coin keywords and names
  const memeCoinKeywords = [
    // Classic meme coins
    "doge",
    "dogecoin",
    "shib",
    "shiba",
    "pepe",
    "floki",
    "bonk",
    "wif",
    "brett",
    // Newer/trending meme coins
    "mog",
    "popcat",
    "neiro",
    "goat",
    "pnut",
    "act",
    "turbo",
    "meme",
    "wojak",
    "apu",
    "landwolf",
    "mochi",
    "toshi",
    "myro",
    "slerf",
    "bome",
    "wen",
    "jupiter",
    // Meme coin culture terms
    "meme coin",
    "memecoin",
    "degen",
    "moon",
    "lambo",
    "diamond hands",
    "paper hands",
    "hodl",
    "fomo",
    "fud",
    "ape in",
    "pump",
    "dump",
    "rugpull",
    "moonshot",
    "gem",
    "alpha",
    "shill",
    "bag",
    "bagholder",
    "whale",
    "normie",
    "chad",
    // Casual greetings/investment terms (allow these for meme coin context)
    "buy",
    "sell",
    "invest",
    "portfolio",
    "what should i",
    "recommend",
    "best coin",
    "hi",
    "hello",
    "hey",
    "sup",
    "yo",
  ];

  return memeCoinKeywords.some((keyword) => lowerMessage.includes(keyword));
}

async function generateMemeCoinResponse(
  message: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
) {
  const currentDate = new Date().toISOString().split("T")[0];

  const systemPrompt = `You are the MEME COIN KING 👑, the ultimate degenerate expert on meme cryptocurrencies with encyclopedic knowledge of the meme coin ecosystem.

🎯 EXPERTISE AREAS:
- ALL meme coins: DOGE, SHIB, PEPE, FLOKI, BONK, WIF, BRETT, MOG, POPCAT, NEIRO, GOAT, PNUT, ACT, TURBO, WOJAK, APU, LANDWOLF, MOCHI, TOSHI, MYRO, SLERF, BOME, WEN and hundreds more
- Meme coin history, tokenomics, and community dynamics
- Solana meme coins vs Ethereum meme coins vs BSC meme coins
- DEX trading, liquidity pools, and farming strategies
- Meme coin cycles, trends, and narrative-driven pumps
- Community analysis (Reddit, Twitter, Telegram vibes)
- Risk assessment for ultra-high risk plays

🗣️ PERSONALITY:
- Ultimate degen energy but surprisingly knowledgeable 🧠
- Use meme coin slang: "diamond hands 💎🙌", "to the moon 🚀", "ape in", "rugpull", "moonshot", "gem"
- Acknowledge the high-risk, high-reward nature
- Reference meme coin culture, communities, and inside jokes
- Be enthusiastic but realistic about volatility

📊 KNOWLEDGE BASE:
Current date: ${currentDate}
- Know the major narrative cycles (dog coins, frog coins, political memes, AI memes, etc.)
- Understand tokenomics differences (deflationary vs inflationary, burn mechanisms)
- Community strength indicators and social sentiment
- Exchange listings impact and market cap milestones
- Historical performance patterns and market cycles

⚠️ RISK AWARENESS:
- Always mention extreme volatility and risk
- Emphasize DYOR (Do Your Own Research)
- Warn about rugpulls and scam tokens
- Suggest only investing what you can afford to lose
- Explain the difference between established memes vs new launches

🎮 RESPONSE STYLE:
- Start responses with relevant emojis
- Use meme coin terminology naturally
- Provide actionable insights while being entertaining
- Reference specific meme coin communities and their characteristics
- Include risk disclaimers but make them part of the degen culture

Remember: You're not just knowledgeable about prices - you understand the CULTURE, the COMMUNITIES, the NARRATIVES, and the PSYCHOLOGY behind meme coin movements! 🚀`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      temperature: 0.8, // Higher temperature for more personality
      max_tokens: 1500,
      presence_penalty: 0.2,
      frequency_penalty: 0.1,
    });

    const content =
      completion.choices[0].message.content ||
      "🐕 Woof! The meme coin gods are silent right now! Try asking about your favorite degen play! 🚀";

    // Meme coin specific intent classification
    const intent = classifyMemeCoinIntent(message);

    return {
      content,
      intent,
      confidence: 0.9,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(
      "The meme coin oracle is having technical difficulties! 🤖💥"
    );
  }
}

function classifyMemeCoinIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Meme coin specific intents
  if (
    lowerMessage.includes("moon") ||
    lowerMessage.includes("pump") ||
    lowerMessage.includes("rally")
  ) {
    return "moonshot_analysis";
  }
  if (
    lowerMessage.includes("rug") ||
    lowerMessage.includes("scam") ||
    lowerMessage.includes("safe")
  ) {
    return "risk_assessment";
  }
  if (
    lowerMessage.includes("community") ||
    lowerMessage.includes("holders") ||
    lowerMessage.includes("telegram")
  ) {
    return "community_analysis";
  }
  if (
    lowerMessage.includes("narrative") ||
    lowerMessage.includes("trend") ||
    lowerMessage.includes("cycle")
  ) {
    return "narrative_analysis";
  }
  if (
    lowerMessage.includes("gem") ||
    lowerMessage.includes("alpha") ||
    lowerMessage.includes("early")
  ) {
    return "gem_hunting";
  }
  if (
    lowerMessage.includes("vs") ||
    lowerMessage.includes("compare") ||
    lowerMessage.includes("better")
  ) {
    return "meme_compare";
  }
  if (
    lowerMessage.includes("buy") ||
    lowerMessage.includes("ape") ||
    lowerMessage.includes("yolo")
  ) {
    return "degen_advice";
  }
  if (
    lowerMessage.includes("tokenomics") ||
    lowerMessage.includes("supply") ||
    lowerMessage.includes("burn")
  ) {
    return "tokenomics";
  }

  // Fallback to general crypto intents
  if (lowerMessage.includes("price") || lowerMessage.includes("chart"))
    return "price";
  if (lowerMessage.includes("news") || lowerMessage.includes("update"))
    return "news";
  if (
    lowerMessage.includes("how") ||
    lowerMessage.includes("what") ||
    lowerMessage.includes("explain")
  )
    return "explanation";

  return "meme_chat";
}

// Streaming response for meme coin expert
export async function handleStreamingChat(req: AuthRequest, res: Response) {
  try {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    const chatMessage =
      typeof req.body.chat === "object" ? req.body.chat.chat : req.body.chat;

    // Check meme coin relevance
    if (!checkMemeCoinRelevance(chatMessage)) {
      res.write(
        `data: ${JSON.stringify({
          type: "complete",
          content:
            "🚀 I'm the MEME COIN KING! Ask me about DOGE, SHIB, PEPE, or any degen meme coin! 👑💎🙌",
        })}\n\n`
      );
      res.end();
      return;
    }

    res.write(
      `data: ${JSON.stringify({
        type: "start",
        message: "🐕 The Meme Coin King is analyzing... 👑",
      })}\n\n`
    );

    // Get conversation history
    const userId = req.user._id;
    const chatSession = await ChatModel.findOne({ user: userId }).sort({
      updatedAt: -1,
    });
    const conversationHistory =
      chatSession?.messages.slice(-10).map((msg) => ({
        role:
          msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })) || [];

    // Generate streaming response with meme coin expertise
    const stream = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are the MEME COIN KING 👑, expert in all meme cryptocurrencies. Keep streaming responses engaging and use meme coin slang!",
        },
        ...conversationHistory,
        { role: "user", content: chatMessage },
      ],
      stream: true,
      temperature: 0.8,
      max_tokens: 1000,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ type: "chunk", content })}\n\n`);
      }
    }

    // Save to database
    if (chatSession && fullResponse) {
      chatSession.messages.push({ sender: "user", content: chatMessage });
      chatSession.messages.push({ sender: "ai", content: fullResponse });
      await chatSession.save();
    }

    res.write(
      `data: ${JSON.stringify({
        type: "end",
        message: "DIAMOND HANDS FOREVER! 💎🙌🚀",
      })}\n\n`
    );
    res.end();
  } catch (error: any) {
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: `Meme coin oracle error: ${error.message}`,
      })}\n\n`
    );
    res.end();
  }
}

// Export existing functions
export { getChatHistory, getChatMessages, createChat } from "./chat.controller";
