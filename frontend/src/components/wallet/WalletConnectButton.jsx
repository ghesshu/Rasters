import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { AccountBalanceWallet as WalletIcon } from "@mui/icons-material";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const WalletConnectButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const connector =
      connectors.find((c) => c.name === "MetaMask") || connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<WalletIcon />}
        onClick={() => disconnect()}
        disabled={true}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          minWidth: "auto",
          px: 2,
          opacity: 0.7,
          cursor: "not-allowed",
          "&:hover": {
            opacity: 0.7,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="caption" sx={{ lineHeight: 1 }}>
            Connected
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1, fontWeight: 500 }}>
            {formatAddress(address)}
          </Typography>
        </Box>
      </Button>
    );
  }

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
        "&:hover": {
          bgcolor: "primary.dark",
        },
      }}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnectButton;
