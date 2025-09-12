import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import WalletConnectButton from "../../components/wallet/WalletConnectButton";
import "../../components/home/HomePage.css";
import logoSrc from "../../assets/logo.png";

const BackgroundElements = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {CRYPTO_SYMBOLS.map((item, index) => {
        const baseX = parseFloat(item.left);
        const baseY = parseFloat(item.top);

        const mouseInfluence = 0.1;
        const x = baseX + (mousePosition.x - baseX) * mouseInfluence;
        const y = baseY + (mousePosition.y - baseY) * mouseInfluence;

        return (
          <Typography
            key={index}
            className={`floating-symbol float-${index + 1}`}
            sx={{
              fontSize: item.size,
              left: `${x}%`,
              top: `${y}%`,
              transition: "left 2s ease-out, top 2s ease-out",
            }}
          >
            {item.symbol}
          </Typography>
        );
      })}

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          pointerEvents: "none",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q25,40 50,60 T100,50 T150,60 T200,40"
            stroke="white"
            fill="none"
            strokeWidth="2"
          />
          <path
            d="M0,60 Q35,30 70,50 T140,40 T200,50"
            stroke="white"
            fill="none"
            strokeWidth="1"
            opacity="0.5"
          />
        </svg>
      </Box>
    </>
  );
};

const CRYPTO_SYMBOLS = [
  { symbol: "₿", size: "4rem", left: "15%", top: "20%" },
  { symbol: "Ξ", size: "3.5rem", left: "75%", top: "15%" },
  { symbol: "◎", size: "3rem", left: "45%", top: "75%" },
  { symbol: "₮", size: "3.2rem", left: "85%", top: "65%" },
  { symbol: "⟠", size: "3.8rem", left: "25%", top: "60%" },
  { symbol: "₿", size: "3rem", left: "5%", top: "45%" },
  { symbol: "Ξ", size: "2.8rem", left: "92%", top: "35%" },
  { symbol: "◎", size: "3.5rem", left: "35%", top: "25%" },
  { symbol: "⟠", size: "2.5rem", left: "65%", top: "85%" },
  { symbol: "₮", size: "2.2rem", left: "55%", top: "5%" },
  { symbol: "₿", size: "2rem", left: "82%", top: "88%" },
  { symbol: "Ξ", size: "4.2rem", left: "8%", top: "80%" },
  { symbol: "◎", size: "2.8rem", left: "95%", top: "12%" },
  { symbol: "⟠", size: "3.3rem", left: "18%", top: "40%" },
  { symbol: "₮", size: "2.7rem", left: "72%", top: "45%" },
];

const HomePageContent = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // If user is already authenticated, redirect to chat
  useEffect(() => {
    if (user && !loading) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4a148c 0%, #0d1b4b 100%)",
        display: "flex",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BackgroundElements />
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 4,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left side - Logo */}
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="Rasters Logo"
            sx={{
              width: "60%",
              maxWidth: 300,
              filter: "brightness(0) invert(1)",
            }}
          />
        </Box>

        {/* Right side - Wallet Auth */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 440,
            p: 4,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderRadius: 2,
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Welcome to Rasters AI
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mb: 4, opacity: 0.8 }}>
            Connect your wallet to get started with AI-powered crypto trading
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
            {/* Wallet Connect Button */}
            <Box sx={{ width: "100%", maxWidth: 300 }}>
              <WalletConnectButton />
            </Box>

            {/* Features List */}
            <Box sx={{ mt: 4, textAlign: "left", width: "100%" }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
                Why Choose Rasters AI?
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ fontSize: "1.2rem" }}>🤖</Typography>
                  <Typography variant="body1">AI-powered trading insights</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ fontSize: "1.2rem" }}>🔒</Typography>
                  <Typography variant="body1">Secure wallet-based authentication</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ fontSize: "1.2rem" }}>📊</Typography>
                  <Typography variant="body1">Real-time market analysis</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ fontSize: "1.2rem" }}>⚡</Typography>
                  <Typography variant="body1">Lightning-fast execution</Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="caption" sx={{ mt: 3, textAlign: "center", opacity: 0.7 }}>
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
              No personal information required - just your wallet signature.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const HomePage = () => {
  return <HomePageContent />;
};

export default HomePage;
