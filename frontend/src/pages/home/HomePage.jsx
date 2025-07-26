import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SignInModal, SignUpModal } from "../../components/auth";
import { useAuth } from "../../contexts/AuthContext";
import "../../components/home/HomePage.css";

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
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleOpenSignIn = () => {
    setSignInModalOpen(true);
    setSignUpModalOpen(false);
  };

  const handleOpenSignUp = () => {
    setSignUpModalOpen(true);
    setSignInModalOpen(false);
  };

  const handleCloseModals = () => {
    setSignInModalOpen(false);
    setSignUpModalOpen(false);
  };

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
            src="/src/assets/logo.png"
            alt="Rasters Logo"
            sx={{
              width: "60%",
              maxWidth: 300,
              filter: "brightness(0) invert(1)",
            }}
          />
        </Box>

        {/* Right side - Auth */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 440,
            p: 4,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderRadius: 2,
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Happening now
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Join today.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleOpenSignUp}
              sx={{
                backgroundColor: "#1d9bf0",
                "&:hover": {
                  backgroundColor: "#1a8cd8",
                },
              }}
            >
              Create account
            </Button>

            <Typography variant="caption" sx={{ mt: 1, textAlign: "center" }}>
              By signing up, you agree to the Terms of Service and Privacy
              Policy, including Cookie Use.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Already have an account?
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleOpenSignIn}
                sx={{
                  borderColor: "#1d9bf0",
                  color: "#1d9bf0",
                  "&:hover": {
                    borderColor: "#1a8cd8",
                    backgroundColor: "rgba(29, 155, 240, 0.1)",
                  },
                }}
              >
                Sign in
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>

      <SignInModal
        open={signInModalOpen}
        onClose={handleCloseModals}
        onSwitchToSignUp={handleOpenSignUp}
      />
      <SignUpModal
        open={signUpModalOpen}
        onClose={handleCloseModals}
        onSwitchToSignIn={handleOpenSignIn}
      />
    </Box>
  );
};

const HomePage = () => {
  return <HomePageContent />;
};

export default HomePage;
