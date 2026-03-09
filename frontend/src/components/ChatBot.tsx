import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Send, SmartToy } from '@mui/icons-material';

type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
}

const CHAT_ENDPOINT =
  import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5001/api/chat';

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am the MediLink medical assistant. Ask me a medical question (English or አማርኛ) based on our medical encyclopedia.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      setLoading(true);
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const answer: string = data.answer || '';

      const botMsg: Message = {
        id: `${Date.now()}-bot`,
        role: 'assistant',
        content:
          answer ||
          "I don't know based on this medical book. / በዚህ የሕክምና መጽሐፍ መሠረት አላወቅም።",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat request failed', err);
      setError(
        'Unable to reach the medical chatbot. Please check that the backend is running and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 640,
        mx: 'auto',
        my: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: { xs: 480, sm: 560 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            gap: 1,
          }}
        >
          <SmartToy color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={800}>
              MediLink Medical Chatbot
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Answers from a medical encyclopedia only. For emergencies call 907.
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 1 }}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            mb: 2,
            pr: 1,
          }}
        >
          {messages.map((m) => (
            <Box
              key={m.id}
              sx={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: m.role === 'user' ? 'primary.main' : 'grey.100',
                  color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  whiteSpace: 'pre-wrap',
                  fontSize: 14,
                }}
              >
                {m.content}
              </Box>
            </Box>
          ))}
          <div ref={endRef} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <TextField
            multiline
            maxRows={3}
            fullWidth
            placeholder="Type your medical question here (English or አማርኛ)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? <CircularProgress size={22} /> : <Send />}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatBot;

