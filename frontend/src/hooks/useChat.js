import { useState, useEffect } from "react";
import chatService from "../services/chat.service";

export const useChat = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load chat history
  const loadChatHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const chatHistory = await chatService.getChatHistory();
      setChats(chatHistory);
      if (chatHistory.length > 0 && !activeChat) {
        setActiveChat(chatHistory[0]);
      }
    } catch (err) {
      setError("Failed to load chat history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for active chat
  const loadMessages = async (chatId) => {
    if (!chatId) return;

    setLoading(true);
    setError(null);
    try {
      const chatMessages = await chatService.getChatMessages(chatId);
      setMessages(chatMessages);
    } catch (err) {
      setError("Failed to load messages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (message) => {
    setLoading(true);
    setError(null);
    try {
      const response = await chatService.sendMessage({
        chat: message,
        chatId: activeChat._id,
      });
      // Refresh messages after sending
      if (activeChat) {
        await loadMessages(activeChat._id);
      } else {
        // If this is a new chat, refresh chat history to get the new chat
        await loadChatHistory();
      }
      return response;
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change active chat
  const selectChat = (chat) => {
    setActiveChat(chat);
  };

  // Create a new chat
  const createNewChat = () => {
    setActiveChat(null);
    setMessages([]);
  };

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat._id);
    }
  }, [activeChat]);

  // Load chat history on initial mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  return {
    chats,
    activeChat,
    messages,
    loading,
    error,
    sendMessage,
    selectChat,
    createNewChat,
    refreshChats: loadChatHistory,
  };
};
