import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
  Chip,
  Fade,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Send as SendIcon, Stop as StopIcon } from "@mui/icons-material";

const ChatInput = ({
  onSendMessage,
  disabled,
  loading,
  placeholder = "Type your message...",
}) => {
  const [message, setMessage] = useState("");
  const [isMultiline, setIsMultiline] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    const messageToSend = message;
    setMessage(""); // Clear immediately for better UX
    setIsMultiline(false);

    await onSendMessage(messageToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    setIsMultiline(value.includes("\n") || value.length > 80);
  };

  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [message]);

  const canSend = message.trim() && !disabled;
  const isAtLimit = message.length > 2000;

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        p: 1.5,
        m: 2, // Adds margin on all sides
        // OR use specific margin properties:
        // mt: 2, // margin-top
        // mb: 2, // margin-bottom
        // ml: 2, // margin-left
        // mr: 2, // margin-right
        // mx: 2, // margin horizontal (left and right)
        // my: 2, // margin vertical (top and bottom)
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        borderRadius: 3,
        border: 2,
        borderColor: loading ? "warning.main" : "divider",
        transition: "all 0.2s ease",
        "&:focus-within": {
          borderColor: "primary.main",
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}25`,
        },
        ...(isAtLimit && {
          borderColor: "error.main",
        }),
      }}
    >
      {/* Main input area */}
      <Box sx={{ flex: 1 }}>
        <TextField
          ref={inputRef}
          fullWidth
          multiline
          maxRows={6}
          variant="standard"
          placeholder={placeholder}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: "1rem",
              lineHeight: 1.5,
              "& .MuiInputBase-input": {
                p: 1,
                minHeight: "24px",
                resize: "none",
                "&::placeholder": {
                  color: "text.secondary",
                  opacity: 0.7,
                },
              },
            },
          }}
        />

        {/* Character count and status indicators */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 0.5,
            minHeight: 20,
          }}
        >
          {message.length > 100 && (
            <Fade in>
              <Chip
                label={`${message.length}/2000`}
                size="small"
                variant="outlined"
                color={isAtLimit ? "error" : "default"}
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Fade>
          )}

          {loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Sending...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          pb: 1,
        }}
      >
        {/* Primary send button */}
        <Tooltip title={loading ? "Stop generating" : "Send message (Enter)"}>
          <IconButton
            type="submit"
            disabled={!canSend && !loading}
            sx={{
              bgcolor: loading ? "error.main" : "primary.main",
              color: "white",
              width: 40,
              height: 40,
              "&:hover": {
                bgcolor: loading ? "error.dark" : "primary.dark",
                transform: "scale(1.05)",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabled",
                color: "action.disabled",
              },
              transition: "all 0.2s ease",
            }}
          >
            {loading ? (
              <StopIcon fontSize="small" />
            ) : (
              <SendIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default ChatInput;
