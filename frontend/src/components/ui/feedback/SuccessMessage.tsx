import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface SuccessMessageProps {
  title?: string;
  message: string;
  onClose?: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ title, message, onClose }) => {
  return (
    <Alert severity="success" onClose={onClose}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};

