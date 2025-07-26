import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { handleGoogleLogin } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the ID token from the URL hash
        const params = new URLSearchParams(window.location.hash.substring(1));
        const idToken = params.get('id_token');
        
        console.log('Processing callback with token:', idToken ? 'Token present' : 'No token');
        
        if (!idToken) {
          throw new Error('No ID token found in URL');
        }

        // Send the token to your backend
        console.log('Sending token to backend...');
        await handleGoogleLogin(idToken);
        
        console.log('Login successful, redirecting...');
        // Redirect back to home page
        navigate('/');
      } catch (error) {
        console.error('Failed to process Google callback:', error);
        setError(error.message || 'Authentication failed');
        // Don't navigate away immediately on error so user can see the error
      }
    };

    handleCallback();
  }, [navigate, handleGoogleLogin]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <Typography color="error">
          Authentication Error: {error}
        </Typography>
        <Typography>
          Please check if the backend server is running at http://localhost:3000
        </Typography>
        <Typography
          component="button"
          onClick={() => navigate('/')}
          sx={{
            cursor: 'pointer',
            textDecoration: 'underline',
            border: 'none',
            background: 'none',
            color: 'primary.main'
          }}
        >
          Return to Home
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography>
        Processing Google Sign-In...
      </Typography>
    </Box>
  );
};

export default GoogleCallback; 