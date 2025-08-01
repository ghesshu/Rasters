import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Fade,
  Container,
  Alert,
  Skeleton,
  Fab,
  IconButton,
} from "@mui/material";
import {
  AutoAwesome as SparklesIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";

const ChatMain = ({
  messages,
  onSendMessage,
  loading,
  messageSending,
  isTyping,
  error,
  onSidebarToggle, // Add this prop
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const isNewChat = messages.length <= 1 && messages[0]?.id === "welcome";

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom();
    }
  }, [messages, isScrolledUp]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsScrolledUp(!isAtBottom);
  };

  // Loading skeleton for initial load
  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Skeleton variant="rectangular" height={40} />
        </Paper>

        <Container maxWidth="md" sx={{ flex: 1, py: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} sx={{ display: "flex", gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton
                    variant="rectangular"
                    height={80}
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Container>

        <Paper sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Container maxWidth="md">
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 3 }}
            />
          </Container>
        </Paper>
      </Box>
    );
  }

  // Welcome screen for new chats
  if (isNewChat) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          bgcolor: "background.default",
        }}
      >
        <WelcomeScreen
          onSendMessage={onSendMessage}
          messageSending={messageSending}
          onSidebarToggle={onSidebarToggle}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1,
          borderRadius: 0,
          boxShadow: "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={onSidebarToggle}>
            <MenuIcon />
          </IconButton>
          <SparklesIcon color="primary" />
          <Typography variant="h6" color="text.primary" fontWeight="600">
            AI Assistant
          </Typography>
          {isTyping && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontStyle: "italic" }}
            >
              typing...
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ m: 2, borderRadius: 2 }}
          onClose={() => {
            /* Handle error dismissal */
          }}
        >
          {error}
        </Alert>
      )}

      {/* Messages Area */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
          scrollBehavior: "smooth",
        }}
        onScroll={handleScroll}
      >
        <Container maxWidth="md" sx={{ py: 2, minHeight: "100%" }}>
          <ChatMessages
            messages={messages}
            isTyping={isTyping}
            messageSending={messageSending}
          />
          <div ref={messagesEndRef} />
        </Container>

        {/* Scroll to bottom FAB */}
        {isScrolledUp && (
          <Fade in>
            <Fab
              size="small"
              color="primary"
              onClick={() => scrollToBottom()}
              sx={{
                position: "absolute",
                bottom: 20,
                right: 20,
                boxShadow: 3,
                "&:hover": {
                  transform: "scale(1.1)",
                },
                transition: "transform 0.2s ease",
              }}
            >
              <ArrowDownIcon />
            </Fab>
          </Fade>
        )}
      </Box>

      {/* Input Area */}

      <div className="mb-4">
        <Container maxWidth="md">
          <ChatInput
            onSendMessage={onSendMessage}
            disabled={messageSending}
            loading={messageSending}
            placeholder="Ask me anything..."
          />
        </Container>
      </div>
      {/* <Paper
        elevation={3}
        sx={{
          p: 2,
          // borderTop: 1,
          // borderColor: "divider",
          // bgcolor: "background.paper",
          zIndex: 1,
        }}
      >
        <Container maxWidth="md">
          <ChatInput
            onSendMessage={onSendMessage}
            disabled={messageSending}
            loading={messageSending}
            placeholder="Ask me anything..."
          />
        </Container>
      </Paper> */}
    </Box>
  );
};

export default ChatMain;
