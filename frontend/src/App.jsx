import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './config/wagmi';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useMediaQuery, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme';
import HomePage from './pages/home/HomePage';
import ChatPage from './pages/chat/ChatPage';
import GoogleCallback from './components/auth/GoogleCallback';
import { AuthProvider } from './contexts/AuthContext';

// Create QueryClient outside component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Create theme instance
const theme = createAppTheme();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
