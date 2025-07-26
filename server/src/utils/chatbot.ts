import axios from "axios";
import { Intent } from "../customTypes";
import { openai } from "./openai";
import * as cheerio from "cheerio";

// utils/search.ts
export async function fetchFromSerp(
  chat: string
): Promise<{ snippet: string; url: string }[]> {
  try {
    const response = await axios.post(
      "https://google.serper.dev/search",
      { q: chat },
      {
        headers: {
          "X-API-KEY":
            process.env.SERP_KEY || "b12aaa98c71f4e7efc348bd3cd815b8b1b68a8aa",
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;
    if (!data?.organic?.length) return [];
    return data.organic.slice(0, 3).map((item: any) => ({
      snippet: `${item.title}\n${item.snippet}`,
      url: item.link,
    }));
  } catch (error: any) {
    console.error("fetchFromSerp error:", error.message);
    return [];
  }
}

export async function scrapeUrls(
  urls: string[]
): Promise<{ url: string; content: string }[]> {
  const results: { url: string; content: string }[] = [];
  for (const url of urls) {
    try {
      const { data } = await axios.get(url, { timeout: 7000 });
      const $ = cheerio.load(data);
      // Extract main text content (customize as needed)
      const content = $("body")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1000);
      results.push({ url, content });
    } catch (e) {
      results.push({ url, content: "Failed to scrape." });
    }
  }
  return results;
}

// utils/intent.ts
export async function detectIntent(chat: string): Promise<Intent> {
  const prompt = `Classify the following user message into one of these intents: price, trend, sentiment, recommendation, news, compare, explanation, event, regulation, tax, joke, unknown.\nMessage: "${chat}"\nRespond ONLY with the intent.`;
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an intent classifier for crypto chatbots.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0,
  });
  return (res.choices[0].message.content?.trim() as Intent) || "unknown";
}

export async function isCrypto(
  chat: string,
  serpResult: string
): Promise<boolean> {
  if (!chat || typeof chat !== "string") {
    return false;
  }
  const prompt = `Given the following user message and related search result, is the topic about cryptocurrency or blockchain?\n\nUser message: "${chat}"\n\nSearch result: "${serpResult}"\n\nRespond with only the word 'true' if yes, otherwise 'false'.`;
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a crypto relevance detector." },
      { role: "user", content: prompt },
    ],
    temperature: 0,
  });
  return res.choices[0].message.content?.toLowerCase().trim() === "true";
}

// utils/generateAnswer.ts
export async function generateAnswer(
  chat: string,
  search: string,
  intent: Intent
): Promise<string> {
  const prompt = `User message: "${chat}"
Relevant search results: ${search}
Intent: ${intent}
Generate a helpful, detailed, and comprehensive answer for the user. If the context requires, provide a lengthy and in-depth response. Use the search results and scraped content as much as possible. If the intent is 'joke', make it crypto-themed.`;
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful crypto chatbot." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1200, // increase for longer answers
  });
  return (
    res.choices[0].message.content?.trim() ||
    "Sorry, I couldn't generate an answer."
  );
}

export function extractUrlsFromSerpResult(result: string): {
  count: number;
  urls: string[];
} {
  const urlRegex =
    /https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:/?#[\]@!$&'()*+,;=]*)/gi;
  const urls = result.match(urlRegex) || [];
  return { count: urls.length, urls };
}
