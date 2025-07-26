export type Intent =
  | "price"
  | "trend"
  | "sentiment"
  | "recommendation"
  | "news"
  | "compare"
  | "explanation"
  | "event"
  | "regulation"
  | "tax"
  | "joke"
  | "unknown";

export interface ClassificationResult {
  intent: Intent;
  entities: {
    coins: string[];
    timeframe?: string;
    amount?: number;
    comparison?: "vs" | "against";
  };
  confidence: number;
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  circulating_supply: number;
  total_supply: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}
