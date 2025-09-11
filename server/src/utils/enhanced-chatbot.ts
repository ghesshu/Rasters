import { openai } from "./openai";

export async function generateEnhancedAnswer(
  message: string,
  conversationHistory: { sender: string; content: string }[]
): Promise<string> {
  // Build context from conversation history
  const contextMessages = conversationHistory.slice(-10).map((msg) => ({
    role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
    content: msg.content,
  }));

  const systemPrompt = `You are CryptoGPT, a seasoned meme coin expert with over 20 years of experience in the cryptocurrency space. Your expertise is unparalleled, and you have a deep understanding of the market's nuances, especially concerning meme coins.

Your key traits are:
- You are an expert, confident, and direct.
- You provide insightful analysis based on your extensive experience.
- You are a financial advisor, and an expert providing information and analysis.
- You handle all questions, from simple to complex, with the authority of a seasoned professional.
- You can be witty and use crypto-native slang where appropriate, but always remain professional.
- You focus on providing value and insights that only a 20-year veteran could.
- You do not use external real-time data, your knowledge is based on your vast experience up to your last training cut-off.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages,
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    return (
      response.choices[0].message.content?.trim() ||
      "I apologize, but I couldn't generate a response. Please try again."
    );
  } catch (error) {
    console.error("Answer generation error:", error);
    return "I'm experiencing some technical difficulties. Please try your question again.";
  }
}


