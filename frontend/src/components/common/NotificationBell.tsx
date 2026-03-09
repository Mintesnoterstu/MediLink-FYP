import React from 'react';
import { Badge, IconButton, IconButtonProps } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useUI } from '@/features/shared/ui/context/UIContext';

export const NotificationBell: React.FC<IconButtonProps> = (props) => {
  const { notifications } = useUI();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <IconButton color="inherit" {...props}>
      <Badge badgeContent={unreadCount} color="error">
        <Notifications />
      </Badge>
    </IconButton>
  );
};

