import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Fade,
  Alert,
  Snackbar,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatMain from "../../components/chat/ChatMain";
import ChatService from "../../services/chat.service";
import { useAuth } from "../../contexts/AuthContext";

const INITIAL_MESSAGE = {
  id: "welcome",
  type: "assistant",
  content: "Hello! I'm your AI assistant. How can I help you today?",
  timestamp: new Date().toISOString(),
};

const ChatPage = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery("(min-width:1024px)");

  const [state, setState] = useState({
    selectedModel: "gpt-4",
    activeChat: null,
    chats: {},
    loading: true,
    messageSending: false,
    error: null,
    sidebarOpen: false,
    // Remove sidebarCollapsed from state
  });

  const [notifications, setNotifications] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const abortControllerRef = useRef(null);

  // Optimized state updates
  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const showNotification = useCallback((message, severity = "info") => {
    setNotifications({ open: true, message, severity });
  }, []);

  // Add sidebar toggle handler
  const handleSidebarToggle = useCallback(() => {
    updateState({ sidebarOpen: !state.sidebarOpen });
  }, [state.sidebarOpen, updateState]);

  // Remove handleSidebarCollapse function completely

  // Modified sidebar close handler
  const handleSidebarClose = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: false }));
  }, []);

  // Enhanced message handling with proper error boundaries
  const handleSendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim() || state.messageSending) return;

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        updateState({ messageSending: true, error: null });

        const userMessage = {
          id: `user-${Date.now()}`,
          type: "user",
          sender: "user", // Explicitly set sender
          content: messageText,
          timestamp: new Date().toISOString(),
        };

        // Handle new chat creation or existing chat
        let chatId = state.activeChat;
        let updatedChats = { ...state.chats };

        if (!chatId) {
          const title =
            messageText.length > 40
              ? `${messageText.substring(0, 40)}...`
              : messageText;

          const response = await ChatService.createChat(title);
          chatId = response.chat._id;

          updatedChats[chatId] = {
            id: chatId,
            title: response.chat.title,
            timestamp: new Date(response.chat.createdAt).toLocaleString(),
            messages: [userMessage],
            isTyping: true,
            createdAt: response.chat.createdAt, // Keep original for sorting
          };

          updateState({
            activeChat: chatId,
            chats: updatedChats,
          });

          navigate(`?chatId=${chatId}`, { replace: true });
        } else {
          // Add to existing chat - make a deep copy to ensure we don't lose messages
          const existingMessages = [...(updatedChats[chatId]?.messages || [])];
          updatedChats[chatId] = {
            ...updatedChats[chatId],
            messages: [...existingMessages, userMessage],
            isTyping: true,
          };

          updateState({
            chats: updatedChats,
          });
        }

        // Send message with abort signal
        const response = await ChatService.sendMessage(messageText, chatId, {
          signal: abortControllerRef.current.signal,
        });

        if (response?.aiMessage) {
          // Get the latest state to ensure we have the most up-to-date messages
          const latestChats = { ...state.chats };
          const latestMessages = [...(latestChats[chatId]?.messages || [])];

          // Make sure the user message is still there
          const hasUserMessage = latestMessages.some(
            (msg) =>
              msg.id === userMessage.id ||
              (msg.type === "user" && msg.content === userMessage.content)
          );

          // If user message is missing, add it back
          const updatedMessages = hasUserMessage
            ? latestMessages
            : [...latestMessages, userMessage];

          // Add AI message
          updatedMessages.push({
            ...response.aiMessage,
            id: `ai-${Date.now()}`,
            type: "assistant",
            streaming: true,
          });

          latestChats[chatId] = {
            ...latestChats[chatId],
            messages: updatedMessages,
            isTyping: false,
          };

          updateState({
            chats: latestChats,
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sending message:", error);
          showNotification(
            "Failed to send message. Please try again.",
            "error"
          );
          updateState({ error: error.message });
        }
      } finally {
        updateState({ messageSending: false });
      }
    },
    [state, updateState, navigate, showNotification]
  );

  // Enhanced chat selection with loading states
  const handleSelectChat = useCallback(
    async (chatId) => {
      if (chatId === state.activeChat) return;

      try {
        updateState({ loading: true });

        // If no chatId is provided, try to extract it from the URL
        let targetChatId = chatId;
        if (!targetChatId) {
          const params = new URLSearchParams(location.search);
          targetChatId = params.get("chatId");
        }

        // If we still don't have a chatId, return early
        if (!targetChatId) {
          updateState({ loading: false });
          return;
        }

        if (!state.chats[targetChatId]?.messages?.length) {
          const messages = await ChatService.getChatMessages(targetChatId);
          updateState({
            chats: {
              ...state.chats,
              [targetChatId]: {
                ...state.chats[targetChatId],
                messages,
              },
            },
          });
        }

        updateState({ activeChat: targetChatId, loading: false });
        navigate(`?chatId=${targetChatId}`, { replace: true });
      } catch (error) {
        console.error("Error selecting chat:", error);
        showNotification("Failed to load chat.", "error");
        updateState({ loading: false });
      }
    },
    [state, updateState, navigate, showNotification, location.search]
  );

  // Create new chat with better UX
  const handleNewChat = useCallback(() => {
    updateState({
      activeChat: null,
      loading: false,
    });
    navigate("/chat", { replace: true });
  }, [updateState, navigate]);

  // Initial load effect
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const chatHistory = await ChatService.getChatHistory();
        const chatsObject = {};

        chatHistory.forEach((chat) => {
          chatsObject[chat._id] = {
            id: chat._id,
            title: chat.title,
            timestamp: new Date(chat.createdAt).toLocaleString(),
            messages: chat.messages || [],
            createdAt: chat.createdAt, // Keep original for sorting
          };
        });

        const params = new URLSearchParams(location.search);
        const chatId = params.get("chatId"); // This extracts the ID from URL

        updateState({
          chats: chatsObject,
          activeChat: chatId && chatsObject[chatId] ? chatId : null, // Maps URL ID to active chat
          loading: false,
        });
      } catch (error) {
        console.error("Error loading chat history:", error);
        showNotification("Failed to load chat history.", "error");
        updateState({ loading: false, error: error.message });
      }
    };

    loadChatHistory();
  }, [location.search, updateState, showNotification]);

  // Add this useEffect to ensure sidebar updates when new chats are added
  useEffect(() => {
    // Force re-render of sidebar when chats change
    if (state.activeChat && state.chats[state.activeChat]) {
      // This ensures the sidebar reflects the latest chat data
      const activeChat = state.chats[state.activeChat];
      if (activeChat && (!activeChat.title || !activeChat.timestamp)) {
        // If title or timestamp is missing, refetch the chat data
        const refreshChat = async () => {
          try {
            const chatHistory = await ChatService.getChatHistory();
            const updatedChat = chatHistory.find(
              (chat) => chat._id === state.activeChat
            );
            if (updatedChat) {
              updateState({
                chats: {
                  ...state.chats,
                  [state.activeChat]: {
                    ...state.chats[state.activeChat],
                    title: updatedChat.title,
                    timestamp: new Date(updatedChat.createdAt).toLocaleString(),
                  },
                },
              });
            }
          } catch (error) {
            console.error("Failed to refresh chat data:", error);
          }
        };
        refreshChat();
      }
    }
  }, [state.activeChat, state.chats]);

  const currentMessages =
    state.activeChat &&
    state.chats[state.activeChat]?.messages &&
    state.chats[state.activeChat].messages.length > 0
      ? state.chats[state.activeChat].messages
      : [INITIAL_MESSAGE];

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Fade in timeout={300}>
        <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
          {/* Conditional Sidebar for Large Screens */}
          {isLargeScreen && state.sidebarOpen && (
            <Box
              sx={{
                width: 280,
                height: "100%",
                borderRight: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                flexShrink: 0,
              }}
            >
              <ChatSidebar
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                activeChat={state.activeChat}
                chats={Object.values(state.chats).sort((a, b) => {
                  // Sort by createdAt timestamp - newest first
                  const dateA = new Date(a.createdAt || a.timestamp || 0);
                  const dateB = new Date(b.createdAt || b.timestamp || 0);
                  return dateB - dateA;
                })}
                loading={state.loading}
                collapsed={false}
                onToggleCollapse={() => {}}
                onClose={undefined} // No close button on large screens
              />
            </Box>
          )}

          {/* Main Chat Area */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              width: "100%",
            }}
          >
            <ChatMain
              messages={currentMessages}
              selectedModel={state.selectedModel}
              onModelChange={(model) =>
                setState((prev) => ({ ...prev, selectedModel: model }))
              }
              onSendMessage={handleSendMessage}
              loading={state.loading}
              messageSending={state.messageSending}
              isTyping={state.chats[state.activeChat]?.isTyping}
              error={state.error}
              onSidebarToggle={handleSidebarToggle}
            />
          </Box>

          {/* Overlay Sidebar for Small Screens */}
          {!isLargeScreen && (
            <Drawer
              anchor="left"
              open={state.sidebarOpen}
              onClose={handleSidebarClose}
              variant="temporary"
              sx={{
                "& .MuiDrawer-paper": {
                  width: 280,
                  boxSizing: "border-box",
                },
              }}
            >
              <ChatSidebar
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                activeChat={state.activeChat}
                chats={Object.values(state.chats)}
                loading={state.loading}
                collapsed={false}
                onToggleCollapse={() => {}}
                onClose={handleSidebarClose} // Close button for small screens
              />
            </Drawer>
          )}
        </Box>
      </Fade>

      {/* Enhanced notifications */}
      <Snackbar
        open={notifications.open}
        autoHideDuration={4000}
        onClose={() => setNotifications((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={notifications.severity}
          onClose={() => setNotifications((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {notifications.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatPage;
