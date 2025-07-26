import axios from "axios";
import { Intent } from "../customTypes";
import { openai } from "./openai";
import * as cheerio from "cheerio";
import { ChatModel } from "../models/chat.model";

// Enhanced search with multiple sources
export async function enhancedSearch(query: string): Promise<{
  serpResults: { snippet: string; url: string; title: string }[];
  newsResults: { snippet: string; url: string; title: string; date?: string }[];
  cryptoData?: any;
}> {
  try {
    const [serpResults, newsResults, cryptoData] = await Promise.allSettled([
      fetchFromSerp(query),
      fetchCryptoNews(query),
      fetchCryptoData(query)
    ]);

    return {
      serpResults: serpResults.status === 'fulfilled' ? serpResults.value : [],
      newsResults: newsResults.status === 'fulfilled' ? newsResults.value : [],
      cryptoData: cryptoData.status === 'fulfilled' ? cryptoData.value : null
    };
  } catch (error) {
    console.error('Enhanced search error:', error);
    return { serpResults: [], newsResults: [] };
  }
}

export async function fetchFromSerp(
  query: string
): Promise<{ snippet: string; url: string; title: string }[]> {
  try {
    const response = await axios.post(
      "https://google.serper.dev/search",
      { q: `${query} cryptocurrency crypto blockchain`, num: 5 },
      {
        headers: {
          "X-API-KEY": process.env.SERP_KEY || "b12aaa98c71f4e7efc348bd3cd815b8b1b68a8aa",
          "Content-Type": "application/json",
        },
      }
    );
    
    const data = response.data;
    if (!data?.organic?.length) return [];
    
    return data.organic.slice(0, 5).map((item: any) => ({
      snippet: item.snippet || '',
      url: item.link,
      title: item.title || ''
    }));
  } catch (error: any) {
    console.error("fetchFromSerp error:", error.message);
    return [];
  }
}

export async function fetchCryptoNews(
  query: string
): Promise<{ snippet: string; url: string; title: string; date?: string }[]> {
  try {
    const response = await axios.post(
      "https://google.serper.dev/news",
      { q: `${query} cryptocurrency crypto news`, num: 3 },
      {
        headers: {
          "X-API-KEY": process.env.SERP_KEY || "b12aaa98c71f4e7efc348bd3cd815b8b1b68a8aa",
          "Content-Type": "application/json",
        },
      }
    );
    
    const data = response.data;
    if (!data?.news?.length) return [];
    
    return data.news.slice(0, 3).map((item: any) => ({
      snippet: item.snippet || '',
      url: item.link,
      title: item.title || '',
      date: item.date
    }));
  } catch (error: any) {
    console.error("fetchCryptoNews error:", error.message);
    return [];
  }
}

export async function fetchCryptoData(query: string): Promise<any> {
  try {
    // Extract potential crypto symbols from query
    const cryptoSymbols = extractCryptoSymbols(query);
    if (cryptoSymbols.length === 0) return null;

    // Use CoinGecko API for real-time data
    const promises = cryptoSymbols.map(async (symbol) => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
        );
        return { symbol, data: response.data };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter(r => r !== null);
  } catch (error) {
    console.error('fetchCryptoData error:', error);
    return null;
  }
}

function extractCryptoSymbols(query: string): string[] {
  const cryptoMap: { [key: string]: string } = {
    'bitcoin': 'bitcoin',
    'btc': 'bitcoin',
    'ethereum': 'ethereum',
    'eth': 'ethereum',
    'cardano': 'cardano',
    'ada': 'cardano',
    'solana': 'solana',
    'sol': 'solana',
    'dogecoin': 'dogecoin',
    'doge': 'dogecoin',
    'shiba': 'shiba-inu',
    'shib': 'shiba-inu',
    'polygon': 'matic-network',
    'matic': 'matic-network',
    'chainlink': 'chainlink',
    'link': 'chainlink'
  };

  const lowerQuery = query.toLowerCase();
  const symbols: string[] = [];
  
  Object.entries(cryptoMap).forEach(([key, value]) => {
    if (lowerQuery.includes(key)) {
      symbols.push(value);
    }
  });

  return [...new Set(symbols)];
}

// Enhanced intent detection with more categories
export async function enhancedIntentDetection(
  message: string,
  conversationHistory: string[]
): Promise<{
  intent: Intent;
  confidence: number;
  cryptoRelevance: 'high' | 'medium' | 'low' | 'none';
  conversationalIntent: 'greeting' | 'casual' | 'question' | 'request' | 'other';
}> {
  const contextualPrompt = `
Analyze this message for a MEME COIN investment advisor.

Current message: "${message}"

Recent conversation context:
${conversationHistory.slice(-6).join('\n')}

Respond in this EXACT format (no extra text):
INTENT: [one of: price, trend, sentiment, recommendation, news, compare, explanation, event, regulation, tax, joke, technology, partnership, security, analysis, tutorial, unknown]
CONFIDENCE: [0.0-1.0]
CRYPTO_RELEVANCE: [high|medium|low|none]
CONVERSATIONAL_INTENT: [greeting|casual|question|request|other]
REASONING: [brief explanation]

Focus on meme coins like DOGE, SHIB, PEPE, FLOKI, etc.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use GPT-3.5 for structured responses
      messages: [
        {
          role: "system",
          content: "You are a meme coin investment analyzer. Follow the exact format requested."
        },
        { role: "user", content: contextualPrompt }
      ],
      temperature: 0.1,
      max_tokens: 200
    });

    const content = response.choices[0].message.content || '';
    
    // Parse the structured response
    const intentMatch = content.match(/INTENT:\s*([^\n]+)/);
    const confidenceMatch = content.match(/CONFIDENCE:\s*([0-9.]+)/);
    const relevanceMatch = content.match(/CRYPTO_RELEVANCE:\s*([^\n]+)/);
    const conversationalMatch = content.match(/CONVERSATIONAL_INTENT:\s*([^\n]+)/);
    
    return {
      intent: (intentMatch?.[1]?.trim() as Intent) || 'unknown',
      confidence: parseFloat(confidenceMatch?.[1] || '0.5'),
      cryptoRelevance: (relevanceMatch?.[1]?.trim() as any) || 'none',
      conversationalIntent: (conversationalMatch?.[1]?.trim() as any) || 'other'
    };
  } catch (error) {
    console.error('Intent detection error:', error);
    return {
      intent: 'unknown',
      confidence: 0.5,
      cryptoRelevance: 'none',
      conversationalIntent: 'other'
    };
  }
}

// Also fix the smartCryptoRelevanceCheck function
export async function smartCryptoRelevanceCheck(
  message: string,
  conversationHistory: string[],
  searchResults: string
): Promise<{
  shouldRespond: boolean;
  reason: string;
  suggestion?: string;
}> {
  // Always allow meme coin discussions and casual conversation
  const memeCoins = ['doge', 'shib', 'pepe', 'floki', 'bonk', 'wif', 'meme', 'safemoon'];
  const hasMemeCoins = memeCoins.some(coin => message.toLowerCase().includes(coin));
  
  if (hasMemeCoins) {
    return {
      shouldRespond: true,
      reason: "Meme coin discussion detected"
    };
  }

  const casualPatterns = [
    /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
    /how are you/i,
    /what's up/i,
    /thank you/i,
    /thanks/i,
    /bye|goodbye/i,
    /nice to meet you/i,
    /what.*buy/i,
    /invest/i,
    /portfolio/i
  ];

  if (casualPatterns.some(pattern => pattern.test(message.trim()))) {
    return {
      shouldRespond: true,
      reason: "Investment or casual conversation allowed"
    };
  }

  // Use simpler AI check without JSON format
  const prompt = `Is this message about meme coins, cryptocurrency investment, or casual conversation? Message: "${message}"

Respond with: YES or NO
If NO, suggest redirecting to meme coins.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a meme coin relevance checker. Respond with YES/NO and optional suggestion." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 100
    });

    const result = response.choices[0].message.content || '';
    const shouldRespond = result.toLowerCase().includes('yes');
    
    return {
      shouldRespond,
      reason: shouldRespond ? "AI approved" : "Not meme coin related",
      suggestion: shouldRespond ? undefined : "Try asking about DOGE, SHIB, PEPE, or other meme coins! 🚀"
    };
  } catch (error) {
    console.error('Relevance check error:', error);
    return {
      shouldRespond: true,
      reason: "Error in relevance check, defaulting to respond"
    };
  }
}

// Enhanced answer generation with streaming support
export async function generateEnhancedAnswer(
  message: string,
  conversationHistory: { sender: string; content: string }[],
  searchData: any,
  intent: Intent,
  cryptoRelevance: string
): Promise<string> {
  // Build context from conversation history
  const contextMessages = conversationHistory.slice(-10).map(msg => ({
    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.content
  }));

  // Prepare search context
  const searchContext = [
    searchData.serpResults?.map((r: any) => `${r.title}: ${r.snippet}`).join('\n\n'),
    searchData.newsResults?.map((r: any) => `[NEWS] ${r.title}: ${r.snippet}`).join('\n\n'),
    searchData.cryptoData ? `[PRICE DATA] ${JSON.stringify(searchData.cryptoData)}` : ''
  ].filter(Boolean).join('\n\n---\n\n');

  const systemPrompt = `You are CryptoGPT, an advanced cryptocurrency and blockchain expert assistant. You have access to real-time data and comprehensive knowledge.

Key traits:
- Provide accurate, up-to-date information about crypto markets, technology, and trends
- Use real-time data when available
- Be conversational and helpful
- Handle casual conversation naturally while maintaining crypto expertise
- Provide detailed explanations for complex topics
- Include relevant links and sources when helpful
- Use emojis appropriately to make responses engaging

Current context:
- User intent: ${intent}
- Crypto relevance: ${cryptoRelevance}
- Real-time search data available: ${searchContext ? 'Yes' : 'No'}`;

  const userPrompt = `${message}

${searchContext ? `\n\nReal-time context:\n${searchContext}` : ''}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages.slice(-8), // Include recent conversation
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    return response.choices[0].message.content?.trim() || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Answer generation error:', error);
    return "I'm experiencing some technical difficulties. Please try your question again.";
  }
}

// Function to create embeddings for semantic search
export async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding creation error:', error);
    return null;
  }
}

// Enhanced web scraping with better content extraction
export async function enhancedScrapeUrls(
  urls: string[]
): Promise<{ url: string; content: string; title: string; summary: string }[]> {
  const results: { url: string; content: string; title: string; summary: string }[] = [];
  
  for (const url of urls.slice(0, 3)) { // Limit to 3 URLs for performance
    try {
      const { data } = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      
      // Remove unwanted elements
      $('script, style, nav, footer, header, .advertisement, .ads').remove();
      
      const title = $('title').text().trim() || $('h1').first().text().trim();
      const content = $('article, .content, .post, main, .article-body')
        .text()
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 2000);
      
      // Generate AI summary of the content
      const summary = await generateContentSummary(content.slice(0, 1000));
      
      results.push({ url, content, title, summary });
    } catch (e) {
      results.push({ 
        url, 
        content: "Failed to scrape.", 
        title: "Unavailable",
        summary: "Content could not be accessed."
      });
    }
  }
  
  return results;
}

async function generateContentSummary(content: string): Promise<string> {
  if (!content || content.length < 100) return "No summary available.";
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Summarize the following content in 2-3 sentences, focusing on key crypto/blockchain information."
        },
        { role: "user", content: content }
      ],
      temperature: 0.3,
      max_tokens: 150
    });
    
    return response.choices[0].message.content?.trim() || "Summary unavailable.";
  } catch {
    return "Summary generation failed.";
  }
}