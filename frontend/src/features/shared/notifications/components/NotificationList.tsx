import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { useNotifications } from '../context/NotificationContext';

export const NotificationList: React.FC = () => {
  const { notifications } = useNotifications();

  if (notifications.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No notifications.
      </Typography>
    );
  }

  return (
    <List dense>
      {notifications.map((n) => (
        <ListItem key={n.id} divider>
          <ListItemText primary={n.title} secondary={n.message} />
        </ListItem>
      ))}
    </List>
  );
};

