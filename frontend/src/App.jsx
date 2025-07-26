import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, useMediaQuery, Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "./theme";
import HomePage from "./pages/home/HomePage";
import ChatPage from "./pages/chat/ChatPage";
import GoogleCallback from "./components/auth/GoogleCallback";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () => createAppTheme(prefersDarkMode ? "dark" : "light"),
    [prefersDarkMode]
  );

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box
            sx={{
              minHeight: "100vh",
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route
                path="/auth/google/callback"
                element={<GoogleCallback />}
              />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
