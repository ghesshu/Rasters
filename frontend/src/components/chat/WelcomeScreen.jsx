import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Fade,
  IconButton,
  Chip,
} from "@mui/material";
import {
  TrendingUp as TrendingIcon,
  Psychology as AIIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  AutoAwesome as SparklesIcon,
} from "@mui/icons-material";
import ChatInput from "./ChatInput";
import logoSrc from "../../assets/logo.png";

const TRENDING_TOPICS = [
  {
    title: "Explore DeFi yield strategies",
    description: "Learn about liquidity mining and yield farming",
    icon: <TrendingIcon />,
    color: "primary",
  },
  {
    title: "Compare Layer 2 solutions",
    description: "Understand scaling solutions for Ethereum",
    icon: <SpeedIcon />,
    color: "secondary",
  },
  {
    title: "Understand MEV protection",
    description: "Protect against maximum extractable value",
    icon: <SecurityIcon />,
    color: "error",
  },
  {
    title: "Learn about liquid staking",
    description: "Stake ETH while maintaining liquidity",
    icon: <AnalyticsIcon />,
    color: "success",
  },
];

const QUICK_ACTIONS = [
  "What's happening in crypto today?",
  "Explain blockchain basics",
  "Help me understand smart contracts",
  "What are the risks of DeFi?",
];

const WelcomeScreen = ({ onSendMessage, messageSending, onSidebarToggle }) => {
  const handleTopicClick = (topic) => {
    onSendMessage(topic.title);
  };

  const handleQuickAction = (action) => {
    onSendMessage(action);
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Add Header */}
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
        </Box>
      </Paper>

      {/* Background decoration */}
      <Box
        sx={{
          position: "absolute",
          top: 64, // Account for header height
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)",
          zIndex: 0,
        }}
      />

      {/* Main content - adjust to account for header */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Container maxWidth="md">
          <Fade in timeout={800}>
            <Box sx={{ textAlign: "center", mb: 8 }}>
              {/* Logo */}
              <Box
                component="img"
                src="/src/assets/logo.png"
                alt="Rasters Logo"
                sx={{
                  width: 70,
                  // height: 80,
                  mb: 4,
                  filter:
                    "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(246deg) brightness(104%) contrast(97%)",
                  animation: "float 3s ease-in-out infinite",
                  "@keyframes float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                  },
                }}
              />

              {/* Main heading */}
              <Typography
                variant="h2"
                sx={{
                  color: "text.primary",
                  textAlign: "center",
                  mb: 2,
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                What can I help you with?
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  mb: 6,
                  maxWidth: 600,
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                I'm your AI assistant specialized in blockchain, DeFi, and crypto
                markets. Ask me anything or explore the topics below.
              </Typography>

              {/* Input Area */}
              <Box sx={{ mb: 6, maxWidth: 600, mx: "auto" }}>
                <ChatInput
                  onSendMessage={onSendMessage}
                  disabled={messageSending}
                  loading={messageSending}
                  placeholder="Ask me anything about crypto, DeFi, or blockchain..."
                />
              </Box>
            </Box>
          </Fade>

          {/* Quick Actions */}
          <Fade in timeout={1000} style={{ transitionDelay: "200ms" }}>
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  mb: 3,
                  fontWeight: 600,
                }}
              >
                Quick Questions
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1,
                  maxWidth: 800,
                  mx: "auto",
                }}
              >
                {QUICK_ACTIONS.map((action, index) => (
                  <Chip
                    key={index}
                    label={action}
                    onClick={() => handleQuickAction(action)}
                    variant="outlined"
                    sx={{
                      px: 2,
                      py: 0.5,
                      height: 40,
                      width: 200,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        transform: "translateY(-2px)",
                        boxShadow: 2,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Fade>

          {/* Trending Topics */}
          {/* <Fade in timeout={1200} style={{ transitionDelay: "400ms" }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mb: 4,
                  fontWeight: 600,
                }}
              >
                <TrendingIcon color="primary" />
                Trending Topics
              </Typography>

              <Grid container spacing={3} sx={{ maxWidth: 1000, mx: "auto" }}>
                {TRENDING_TOPICS.map((topic, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      onClick={() => handleTopicClick(topic)}
                      sx={{
                        p: 3,
                        height: "100%",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        border: 1,
                        borderColor: "divider",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 4,
                          borderColor: `${topic.color}.main`,
                          bgcolor: `${topic.color}.light`,
                          "& .topic-icon": {
                            color: `${topic.color}.main`,
                            transform: "scale(1.1)",
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                      >
                        <Box
                          className="topic-icon"
                          sx={{
                            color: "text.secondary",
                            transition: "all 0.3s ease",
                            mt: 0.5,
                          }}
                        >
                          {topic.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "text.primary",
                              mb: 1,
                              fontWeight: 600,
                              fontSize: "1.1rem",
                            }}
                          >
                            {topic.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              lineHeight: 1.5,
                            }}
                          >
                            {topic.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade> */}
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;
