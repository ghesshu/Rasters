import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Box,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const AVAILABLE_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5', description: 'Faster responses' },
  { id: 'claude-3', name: 'Claude 3', description: 'Balanced' },
];

const ChatModelSelect = ({ selectedModel, onModelChange }) => {
  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 120,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 1,
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
          },
        },
      }}
    >
      <Select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        sx={{
          color: 'white',
          '& .MuiSvgIcon-root': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '& .MuiMenuItem-root': {
                color: 'white',
              },
            },
          },
        }}
      >
        {AVAILABLE_MODELS.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesomeIcon
                sx={{
                  mr: 1,
                  fontSize: 16,
                  color: 'primary.main',
                }}
              />
              <Box>
                <Typography variant="body2">{model.name}</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  {model.description}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ChatModelSelect; 