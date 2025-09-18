import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  IconButton,
  Divider,
  Collapse,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Chat as ChatIcon,
  AccountBalanceWallet as WalletIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useDisconnect } from "wagmi";
import { useAuth } from "../../contexts/AuthContext";
import WalletConnectButton from "../wallet/WalletConnectButton";
import logoSrc from "../../assets/logo.png";

const ChatSidebar = ({
  onNewChat,
  onSelectChat,
  activeChat,
  chats = [],
  loading,
  collapsed = false, // Keep this prop for compatibility but won't use collapse functionality
  onToggleCollapse, // Keep this prop for compatibility
  onClose,
}) => {
  const { user, logout } = useAuth();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const [menuState, setMenuState] = useState({ anchorEl: null, chatId: null });

  const handleLogout = async () => {
    try {
      await logout();
      disconnect(); // Disconnect the wallet
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Still disconnect wallet and navigate even if logout fails
      disconnect();
      navigate("/", { replace: true });
    }
  };

  const handleChatMenu = (event, chatId) => {
    event.stopPropagation();
    setMenuState({ anchorEl: event.currentTarget, chatId });
  };

  const handleMenuClose = () => {
    setMenuState({ anchorEl: null, chatId: null });
  };

  const handleMenuAction = (action) => {
    const { chatId } = menuState;
    handleMenuClose();

    switch (action) {
      case "edit":
        // Implement edit chat title
        console.log("Edit chat:", chatId);
        break;
      case "archive":
        // Implement archive chat
        console.log("Archive chat:", chatId);
        break;
      case "delete":
        // Implement delete chat
        console.log("Delete chat:", chatId);
        break;
      default:
        break;
    }
  };

  const sidebarWidth = collapsed ? 70 : 280;

  return (
    <Box
      sx={{
        width: 280, // Fixed width, no more dynamic sizing
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        position: "relative",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // Changed from conditional
          borderBottom: 1,
          borderColor: "divider",
          minHeight: 64,
        }}
      >
        <Box
          onClick={onNewChat}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            transition: "opacity 0.2s",
            "&:hover": { opacity: 0.8 },
          }}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="Logo"
            sx={{
              height: 32,
              filter:
                "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(246deg) brightness(104%) contrast(97%)",
            }}
          />
          <Typography variant="h6" color="primary" fontWeight="700">
            Rasters AI
          </Typography>
        </Box>

        {/* Remove the expand/collapse button completely */}
      </Box>

      {/* New Chat Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewChat}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            height: 48,
            borderRadius: 2,
            "&:hover": {
              bgcolor: "primary.dark",
              transform: "translateY(-1px)",
              boxShadow: 3,
            },
            transition: "all 0.2s ease",
          }}
        >
          New Chat
        </Button>
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1 }}>
        <List sx={{ py: 0 }}>
          {chats.map((chat) => (
            <ListItem key={chat.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={chat.id === activeChat}
                onClick={() => onSelectChat(chat.id)}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  minHeight: 48,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      bgcolor: "primary.main",
                    },
                  },
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color:
                      chat.id === activeChat
                        ? "primary.contrastText"
                        : "primary.main",
                    justifyContent: "center",
                  }}
                >
                  <ChatIcon fontSize="small" />
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: chat.id === activeChat ? 600 : 400,
                        mb: 0.25,
                        color: chat.id === activeChat ? "white" : "inherit",
                      }}
                    >
                      {chat.title}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.8,
                        color:
                          chat.id === activeChat
                            ? "rgba(255, 255, 255, 0.8)"
                            : "text.secondary",
                      }}
                    >
                      {chat.timestamp}
                    </Typography>
                  }
                />

                <IconButton
                  size="small"
                  onClick={(e) => handleChatMenu(e, chat.id)}
                  sx={{
                    opacity: 0,
                    ml: 1,
                    color: "inherit",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                    ".MuiListItemButton-root:hover &": {
                      opacity: 1,
                    },
                  }}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}

          {chats.length === 0 && !loading && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No chats yet. Start a new conversation!
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Bottom Actions */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        {/* Wallet Connection */}
        {/* <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <WalletConnectButton />
        </Box> */}

        {/* User Profile Section */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                    border: 2,
                    borderColor: "background.paper",
                  }}
                />
              }
            >
              <IconButton size="small" sx={{ mr: 1 }}>
                {/* <PersonIcon /> */}
              </IconButton>
            </Badge>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight="600" noWrap>
                {user?.name || "User"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Logout">
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: "error.main",
                  "&:hover": {
                    bgcolor: "error.light",
                    color: "error.dark",
                  },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: 3,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          },
        }}
      >
        <Divider />
        <MenuItem
          onClick={() => handleMenuAction("delete")}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ChatSidebar;
