import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoSrc from "../../assets/logo.png";

const SignUpModal = ({ open, onClose, onSwitchToSignIn }) => {
  const { handleLocalRegister, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isFormValid = useMemo(() => {
    return (
      name.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      password.length >= 6
    );
  }, [name, email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please fill in all fields correctly.");
      return;
    }

    try {
      await handleLocalRegister(name, email, password);
      // Add a small delay to show success state before navigation
      setTimeout(() => {
        onClose();
        navigate("/chat", { replace: true });
      }, 500);
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          borderRadius: 2,
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          backgroundImage: "none",
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <DialogContent sx={{ p: 4, color: "white" }}>
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: -16,
              top: -16,
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            component="img"
            src={logoSrc}
            alt="Rasters Logo"
            sx={{
              width: "120px",
              height: "auto",
              filter: "brightness(0) invert(1)",
              display: "block",
              mx: "auto",
              mb: 4,
            }}
          />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="center"
            fontWeight="bold"
          >
            Create your account
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.1)" }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}
          >
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />

            <Typography
              variant="caption"
              sx={{
                mt: 1,
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              By signing up, you agree to the Terms of Service and Privacy
              Policy, including Cookie Use.
            </Typography>

            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading || !isFormValid}
              sx={{
                mt: 2,
                backgroundColor: "#1d9bf0",
                "&:hover": {
                  backgroundColor: "#1a8cd8",
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(29, 155, 240, 0.5)",
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create account"
              )}
            </Button>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Already have an account?{" "}
                <Button
                  variant="text"
                  onClick={onSwitchToSignIn}
                  sx={{
                    color: "#1d9bf0",
                    textTransform: "none",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": {
                      backgroundColor: "transparent",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpModal;
