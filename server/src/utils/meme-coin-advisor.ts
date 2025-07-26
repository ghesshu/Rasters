import { openai } from "./openai";
import { enhancedSearch } from "./enhanced-chatbot";
import axios from "axios";

// Generalized crypto data fetching - can handle ANY coin
export async function fetchCryptoData(query: string): Promise<any> {
  try {
    // Extract potential crypto symbols from the user's query
    const cryptoSymbols = extractCryptoSymbolsFromQuery(query);
    
    // If specific coins mentioned, get their data
    if (cryptoSymbols.length > 0) {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbols.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_1h_change=true`
      );
      return response.data;
    }
    
    // Otherwise, get trending meme coins as default
    const trendingResponse = await axios.get(
      'https://api.coingecko.com/api/v3/search/trending'
    );
    
    // Get top trending coins data
    const trendingIds = trendingResponse.data.coins.slice(0, 10).map((coin: any) => coin.item.id);
    const priceResponse = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${trendingIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_1h_change=true`
    );
    
    return priceResponse.data;
  } catch (error) {
    console.error('Crypto data fetch error:', error);
    return null;
  }
}

// Enhanced crypto symbol extraction from any query
function extractCryptoSymbolsFromQuery(query: string): string[] {
  const cryptoMap: { [key: string]: string } = {
    // Major cryptos
    'bitcoin': 'bitcoin',
    'btc': 'bitcoin',
    'ethereum': 'ethereum',
    'eth': 'ethereum',
    'binance': 'binancecoin',
    'bnb': 'binancecoin',
    'cardano': 'cardano',
    'ada': 'cardano',
    'solana': 'solana',
    'sol': 'solana',
    'xrp': 'ripple',
    'ripple': 'ripple',
    'polygon': 'matic-network',
    'matic': 'matic-network',
    'chainlink': 'chainlink',
    'link': 'chainlink',
    'avalanche': 'avalanche-2',
    'avax': 'avalanche-2',
    'polkadot': 'polkadot',
    'dot': 'polkadot',
    
    // Meme coins (priority)
    'dogecoin': 'dogecoin',
    'doge': 'dogecoin',
    'shiba': 'shiba-inu',
    'shib': 'shiba-inu',
    'pepe': 'pepe',
    'floki': 'floki',
    'bonk': 'bonk',
    'dogwifhat': 'dogwifhat',
    'wif': 'dogwifhat',
    'memecoin': 'memecoin',
    'baby doge': 'baby-doge-coin',
    'babydoge': 'baby-doge-coin',
    'samoyed': 'samoyedcoin',
    'samo': 'samoyedcoin',
    'safemoon': 'safemoon-2',
    'akita': 'akita-inu',
    'kishu': 'kishu-inu',
    'dogelon': 'dogelon-mars',
    'elon': 'dogelon-mars',
    
    // DeFi tokens
    'uniswap': 'uniswap',
    'uni': 'uniswap',
    'aave': 'aave',
    'compound': 'compound-governance-token',
    'comp': 'compound-governance-token',
    'maker': 'maker',
    'mkr': 'maker',
    'curve': 'curve-dao-token',
    'crv': 'curve-dao-token',
    
    // Layer 2s
    'arbitrum': 'arbitrum',
    'arb': 'arbitrum',
    'optimism': 'optimism',
    'op': 'optimism',
    
    // Other popular coins
    'litecoin': 'litecoin',
    'ltc': 'litecoin',
    'bitcoin cash': 'bitcoin-cash',
    'bch': 'bitcoin-cash',
    'stellar': 'stellar',
    'xlm': 'stellar',
    'cosmos': 'cosmos',
    'atom': 'cosmos',
    'algorand': 'algorand',
    'algo': 'algorand',
    'tezos': 'tezos',
    'xtz': 'tezos',
    'near': 'near',
    'aptos': 'aptos',
    'apt': 'aptos',
    'sui': 'sui',
    'injective': 'injective-protocol',
    'inj': 'injective-protocol'
  };

  const lowerQuery = query.toLowerCase();
  const symbols: string[] = [];
  
  // Check for exact matches and partial matches
  Object.entries(cryptoMap).forEach(([key, value]) => {
    if (lowerQuery.includes(key)) {
      symbols.push(value);
    }
  });

  return [...new Set(symbols)];
}

// Search for any crypto by name/symbol using CoinGecko search
export async function searchCrypto(searchTerm: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchTerm)}`
    );
    
    const coins = response.data.coins.slice(0, 5); // Top 5 matches
    if (coins.length === 0) return null;
    
    // Get price data for found coins
    const coinIds = coins.map((coin: any) => coin.id);
    const priceResponse = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_1h_change=true`
    );
    
    return {
      searchResults: coins,
      priceData: priceResponse.data
    };
  } catch (error) {
    console.error('Crypto search error:', error);
    return null;
  }
}

// Generate financial advice for ANY crypto (with meme coin bias)
export async function generateCryptoFinancialAdvice(
  message: string,
  conversationHistory: { sender: string; content: string }[],
  searchData: any,
  cryptoData: any
): Promise<string> {
  const contextMessages = conversationHistory.slice(-8).map(msg => ({
    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.content
  }));

  const cryptoContext = cryptoData ? 
    `LIVE CRYPTO PRICES:\n${JSON.stringify(cryptoData, null, 2)}` : '';

  const searchContext = [
    searchData.serpResults?.map((r: any) => `${r.title}: ${r.snippet}`).join('\n'),
    searchData.newsResults?.map((r: any) => `[NEWS] ${r.title}: ${r.snippet}`).join('\n')
  ].filter(Boolean).join('\n\n');

  const systemPrompt = `You are CRYPTO CHAD 🚀, the most aggressive and direct cryptocurrency financial advisor!

Your personality:
- Give DIRECT investment advice ("BUY NOW", "SELL IMMEDIATELY", "HOLD TIGHT", "DCA IN")
- Cover ALL cryptocurrencies but have a special love for meme coins
- Use rocket emojis 🚀, diamond hands 💎🙌, and crypto slang
- Provide specific entry/exit points and price targets when possible
- Warn about risks but be bullish on good opportunities
- Use phrases like "This is not financial advice BUT..." then give direct advice anyway
- Be confident and decisive about ANY crypto
- Include current prices and percentage changes
- Suggest portfolio allocations (% recommendations)
- Give timeframes for trades (short-term scalp vs long-term HODL)
- Mention market cap, volume, and technical indicators

Special focus areas:
- Meme coins (DOGE, SHIB, PEPE, etc.) - EXTRA BULLISH 🚀
- Major cryptos (BTC, ETH) - Solid foundation advice
- Altcoins - High-risk high-reward plays
- DeFi tokens - Yield farming opportunities
- Layer 2s - Scaling solutions

Rules:
- Always mention "This is not financial advice" but then give specific advice
- Include risk warnings and position sizing
- Cover ANY crypto the user asks about
- Be direct about what to buy/sell/hold with percentages
- Use current market data when available
- Suggest specific portfolio allocations
- Give both short-term and long-term perspectives

Current market data available: ${cryptoData ? 'YES' : 'NO'}`;

  const userPrompt = `${message}\n\n${cryptoContext}\n\n${searchContext}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages,
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      presence_penalty: 0.2,
      frequency_penalty: 0.1
    });

    return response.choices[0].message.content?.trim() || 
      "🚀 CRYPTO CHAD here! I'm having technical difficulties, but HODL your bags! 💎🙌";
  } catch (error) {
    console.error('Crypto financial advice error:', error);
    return "🚀 Technical issues detected! But remember - buy the dip and HODL! This is not financial advice... but maybe DCA into your favorites? 💎🙌";
  }
}

// Get trending cryptocurrencies
export async function getTrendingCryptos(): Promise<any> {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/search/trending');
    return response.data;
  } catch (error) {
    console.error('Trending cryptos error:', error);
    return null;
  }
}

// Get top gainers/losers
export async function getMarketMovers(): Promise<any> {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=percent_change_24h_desc&per_page=50&page=1'
    );
    
    const gainers = response.data.slice(0, 10);
    const losers = response.data.slice(-10).reverse();
    
    return { gainers, losers };
  } catch (error) {
    console.error('Market movers error:', error);
    return null;
  }
}