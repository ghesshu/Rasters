import React, { useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { AccountBalanceWallet as WalletIcon } from "@mui/icons-material";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const WalletConnectButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, handleWalletAuth, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if Phantom is installed - this takes priority over everything
  const isPhantomInstalled = window?.phantom?.ethereum;

  const handleConnect = () => {
    // Check if Phantom is installed
    if (!isPhantomInstalled) {
      // Redirect to Phantom installation page
      window.open('https://phantom.app/', '_blank');
      return;
    }

    // Look for Phantom first, then fall back to injected wallets
    const connector = connectors.find((c) => c.name === "Phantom") || 
                   connectors.find((c) => c.name === "Injected") || 
                   connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      // Generate a default name based on wallet address
      const defaultName = `User ${address.slice(0, 6)}`;
      await handleWalletAuth('phantom', defaultName);
      navigate('/chat');
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Authentication failed: ' + error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // FORCE Install Phantom if Phantom is not detected - this overrides all other states
  if (!isPhantomInstalled) {
    return (
      <Button
        variant="contained"
        size="small"
        startIcon={<WalletIcon />}
        onClick={handleConnect}
        disabled={isPending}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          bgcolor: "warning.main",
          "&:hover": { bgcolor: "warning.dark" },
        }}
      >
        Install Phantom
      </Button>
    );
  }

  // If user is authenticated and Phantom is installed
  if (user && isConnected && address) {
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<WalletIcon />}
        onClick={handleDisconnect}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          minWidth: "auto",
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Typography variant="caption" sx={{ lineHeight: 1 }}>
            {user.name}
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1, fontWeight: 500 }}>
            {formatAddress(address)}
          </Typography>
        </Box>
      </Button>
    );
  }

  // If wallet is connected but user is not authenticated (and Phantom is installed)
  if (isConnected && address && !user) {
    return (
      <Button
        variant="contained"
        size="small"
        startIcon={<WalletIcon />}
        onClick={handleAuthenticate}
        disabled={isAuthenticating}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          bgcolor: "success.main",
          "&:hover": { bgcolor: "success.dark" },
        }}
      >
        {isAuthenticating ? "Authenticating..." : "Sign In"}
      </Button>
    );
  }

  // If wallet is not connected (and Phantom is installed)
  return (
    <Button
      variant="contained"
      size="small"
      startIcon={<WalletIcon />}
      onClick={handleConnect}
      disabled={isPending}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        bgcolor: "primary.main",
        "&:hover": { bgcolor: "primary.dark" },
      }}
    >
      {isPending ? "Connecting..." : "Connect Phantom"}
    </Button>
  );
};

export default WalletConnectButton;
