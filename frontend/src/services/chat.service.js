import apiClient from "./api.service";

class ChatService {
  // Send a message to the chat
  async sendMessage(chat, chatId) {
    try {
      const request = {
        chat,
        chatId,
      };
      const response = await apiClient.post("/chat", request);
      
      // Return both the original response data and extract the AI message
      return {
        ...response.data,
        aiMessage: {
          sender: "ai",
          content: response.data.message, // Extract the AI response message
          timestamp: new Date().toISOString(),
          streaming: response.data.streaming || false, // Add streaming flag
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get chat history for the current user
  async getChatHistory() {
    try {
      const response = await apiClient.get("/chat/history");
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get messages for a specific chat
  async getChatMessages(chatId) {
    try {
      const response = await apiClient.get(`/chat/${chatId}/messages`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create a new chat with a title
  async createChat(title) {
    try {
      const response = await apiClient.post("/chat/create", { title });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ChatService();
