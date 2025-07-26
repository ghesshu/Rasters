import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Fade, Alert, Snackbar, Drawer, useMediaQuery, useTheme } from "@mui/material";
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
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg')); // lg breakpoint (1200px+)
  
  const [state, setState] = useState({
    selectedModel: "gpt-4",
    activeChat: null,
    chats: {},
    loading: true,
    messageSending: false,
    error: null,
    sidebarOpen: false, // Will be set based on screen size
    sidebarCollapsed: false, // Add this line
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

  // Add sidebar close handler
  // const handleSidebarClose = useCallback(() => {
  //   updateState({ sidebarOpen: false });
  // }, [updateState]);

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
          const hasUserMessage = latestMessages.some(msg => 
            msg.id === userMessage.id || 
            (msg.type === "user" && msg.content === userMessage.content)
          );
          
          // If user message is missing, add it back
          const updatedMessages = hasUserMessage ? 
            latestMessages : 
            [...latestMessages, userMessage];
          
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

        if (!state.chats[chatId]?.messages?.length) {
          const messages = await ChatService.getChatMessages(chatId);
          updateState({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                messages,
              },
            },
          });
        }

        updateState({ activeChat: chatId, loading: false });
        navigate(`?chatId=${chatId}`, { replace: true });
      } catch (error) {
        console.error("Error selecting chat:", error);
        showNotification("Failed to load chat.", "error");
        updateState({ loading: false });
      }
    },
    [state, updateState, navigate, showNotification]
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
          };
        });

        const params = new URLSearchParams(location.search);
        const chatId = params.get("chatId");

        updateState({
          chats: chatsObject,
          activeChat: chatId && chatsObject[chatId] ? chatId : null,
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

  const currentMessages =
    state.activeChat && state.chats[state.activeChat]?.messages && 
    state.chats[state.activeChat].messages.length > 0
      ? state.chats[state.activeChat].messages
      : [INITIAL_MESSAGE];

  // Set sidebar open by default on larger screens
  useEffect(() => {
    setState(prev => ({ ...prev, sidebarOpen: isLargeScreen }));
  }, [isLargeScreen]);

  // Remove this duplicate declaration - the original one at line 51 should be kept
  // const handleSidebarToggle = useCallback(() => {
  //   setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  // }, []);

  // Modified sidebar close handler
  const handleSidebarClose = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: false }));
  }, []);

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
              onModelChange={(model) => setState(prev => ({ ...prev, selectedModel: model }))}
              onSendMessage={handleSendMessage}
              loading={state.loading}
              messageSending={state.messageSending}
              isTyping={state.chats[state.activeChat]?.isTyping}
              error={state.error}
              onSidebarToggle={handleSidebarToggle}
            />
          </Box>

          {/* Overlay Sidebar using Drawer */}
          <Drawer
            anchor="left"
            open={state.sidebarOpen}
            onClose={handleSidebarClose}
            variant={isLargeScreen ? "persistent" : "temporary"} // Persistent on large screens
            sx={{
              '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
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
              onClose={!isLargeScreen ? handleSidebarClose : undefined} // Only show close on small screens
            />
          </Drawer>
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
