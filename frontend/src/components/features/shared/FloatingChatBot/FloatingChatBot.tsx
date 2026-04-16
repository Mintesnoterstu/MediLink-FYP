import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Collapse,
  Badge,
  Chip,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Send,
  Close,
  Minimize,
  Warning,
  OpenInFull,
  CloseFullscreen,
  Replay,
  MedicalServices,
} from '@mui/icons-material';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AIMessage } from '@/types';

interface FloatingChatBotProps {
  initialMinimized?: boolean;
}

const quickSuggestions = (isAmharic: boolean) => [
  {
    label: isAmharic ? 'ወባ ምንድን ነው?' : 'What is malaria?',
    message: 'What is malaria?',
  },
  {
    label: isAmharic ? 'የስኳር በሽታ ምልክቶች?' : 'Symptoms of diabetes?',
    message: 'Symptoms of diabetes?',
  },
  {
    label: isAmharic ? 'የደም ግፊትን እንዴት እቀንስ?' : 'How to lower blood pressure?',
    message: 'How to lower blood pressure?',
  },
];

export const FloatingChatBot: React.FC<FloatingChatBotProps> = ({ initialMinimized = true }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const { patientData } = useHealthData();
  const isAmharic = (i18n.language || '').startsWith('am');

  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fallbackMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const CHAT_ENDPOINT =
    import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5001/api/chat';

  const clearHistory = () => {
    const greeting: AIMessage = {
      id: 'greeting',
      role: 'assistant',
      content: isAmharic
        ? 'ሰላም! እኔ ሜዲ አሲስታንት ነኝ። በጋሌ ኢንሳይክሎፔዲያ ኦፍ ሜዲሲን ላይ የተመሠረተ የጤና መረጃ አቀርባለሁ።'
        : "Hello! I'm Medi Assistant. I provide health information based on the Gale Encyclopedia of Medicine.",
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
    try {
      const storageKey = `medilink.chat_history.v1.${user?.id || 'anon'}`;
      localStorage.removeItem(storageKey);
    } catch (_e) {
      // ignore
    }
  };

  // Initialize conversation on mount
  useEffect(() => {
    const storageKey = `medilink.chat_history.v1.${user?.id || 'anon'}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as AIMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-50));
          return;
        }
      }
    } catch (_e) {
      // ignore
    }

    const greeting: AIMessage = {
      id: 'greeting',
      role: 'assistant',
      content: isAmharic
        ? 'ሰላም! እኔ ሜዲ አሲስታንት ነኝ። በጋሌ ኢንሳይክሎፔዲያ ኦፍ ሜዲሲን ላይ የተመሠረተ የጤና መረጃ አቀርባለሁ።'
        : "Hello! I'm Medi Assistant. I provide health information based on the Gale Encyclopedia of Medicine.",
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist chat history locally per user
  useEffect(() => {
    const storageKey = `medilink.chat_history.v1.${user?.id || 'anon'}`;
    try {
      if (messages.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(messages.slice(-50)));
      }
    } catch (_e) {
      // ignore
    }
  }, [messages, user?.id]);

  // Update contextual greeting when route changes (only if user hasn't already had a conversation)
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].id === 'greeting')) {
      const greeting: AIMessage = {
        id: 'greeting',
        role: 'assistant',
      content: isAmharic
        ? 'ሰላም! እኔ ሜዲ አሲስታንት ነኝ። በጋሌ ኢንሳይክሎፔዲያ ኦፍ ሜዲሲን ላይ የተመሠረተ የጤና መረጃ አቀርባለሁ።'
        : "Hello! I'm Medi Assistant. I provide health information based on the Gale Encyclopedia of Medicine.",
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    }
  }, [location.pathname, t]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHasNewMessage(false);
    }
  }, [messages, isMinimized]);

  const callChatbotApi = async (content: string): Promise<string> => {
    const payload: Record<string, unknown> = {
      query: content,
      // passthrough (not used by backend now but future-proof)
      userRole: user?.role,
      currentPage: location.pathname,
      patientContext: patientData,
    };

    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Chatbot API error ${res.status}`);
    }
    const data = await res.json();
    return data.answer || '';
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setShowDisclaimer(false);

    try {
      setIsProcessing(true);
      const answer = await callChatbotApi(inputMessage);
      const botMessage: AIMessage = {
        id: `${Date.now()}-bot`,
        role: 'assistant',
        content:
          answer ||
          "I don't know based on this medical book. / በዚህ የሕክምና መጽሐፍ መሠረት አላወቅም።",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          t('chat.errorMessage') ||
          'I apologize, but I encountered an error. Please try again or consult with a healthcare provider for immediate concerns.',
        timestamp: new Date().toISOString(),
        confidence: 0.3,
        isError: true,
        retryPayload: inputMessage,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = (message: string) => {
    setInputMessage(message);
    // Auto-send quick action messages
    setTimeout(() => {
      setInputMessage('');
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setShowDisclaimer(false);

      setIsProcessing(true);
      callChatbotApi(message)
        .then((answer) => {
          const botMessage: AIMessage = {
            id: `${Date.now()}-bot`,
            role: 'assistant',
            content:
              answer ||
              "I don't know based on this medical book. / በዚህ የሕክምና መጽሐፍ መሠረት አላወቅም።",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, botMessage]);
        })
        .catch((error) => {
          console.error('Failed to send message:', error);
          const errorMessage: AIMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content:
              t('chat.errorMessage') ||
              'I apologize, but I encountered an error. Please try again or consult with a healthcare provider for immediate concerns.',
            timestamp: new Date().toISOString(),
            confidence: 0.3,
            isError: true,
            retryPayload: message,
          };
          setMessages((prev) => [...prev, errorMessage]);
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }, 100);
  };


  const quickActions = quickSuggestions(isAmharic);

  const handleRetry = (payload?: string) => {
    if (!payload || isProcessing) return;
    setInputMessage(payload);
    // re-use main send handler after setting input
    setTimeout(() => {
      handleSend();
    }, 0);
  };

  return (
    <>
      {/* Minimized Chat Bubble */}
      <Collapse in={isMinimized} orientation="vertical">
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 12, sm: 24 },
            right: { xs: 12, sm: 24 },
            zIndex: 1300,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              borderRadius: '50%',
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #25C0D3 0%, #1A9FB0 100%)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              animation: hasNewMessage ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(37, 192, 211, 0.7)',
                },
                '70%': {
                  boxShadow: '0 0 0 10px rgba(37, 192, 211, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(37, 192, 211, 0)',
                },
              },
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: 12,
              },
            }}
            onClick={() => setIsMinimized(false)}
          >
            <Badge
              badgeContent={hasNewMessage ? '!' : 0}
              color="error"
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MedicalServices sx={{ color: 'white', fontSize: 22 }} />
              </Box>
            </Badge>
          </Paper>
        </Box>
      </Collapse>

      {/* Expanded Chat Window */}
      <Collapse in={!isMinimized} orientation="vertical">
        <Box
          ref={chatContainerRef}
          sx={{
            position: 'fixed',
            bottom: { xs: 8, sm: 24 },
            right: { xs: 8, sm: 24 },
            left: { xs: 8, sm: 'auto' },
            width: isMaximized ? { xs: 'calc(100vw - 16px)', sm: 520 } : { xs: 'calc(100vw - 16px)', sm: 400 },
            maxWidth: isMaximized ? 520 : 400,
            height: isMaximized ? { xs: 'calc(100vh - 16px)', sm: 640 } : { xs: 'min(78vh, 560px)', sm: 520 },
            maxHeight: { xs: 'calc(100vh - 16px)', sm: isMaximized ? 640 : 520 },
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Paper
            elevation={16}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: 'primary.main',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #25C0D3 0%, #537C89 100%)',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MedicalServices sx={{ color: 'white', fontSize: 16 }} />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {t('chat.title') || 'Medi Assistant'}
                </Typography>
                {fallbackMode && (
                  <Chip
                    label={t('chat.fallbackMode') || 'Limited Mode'}
                    size="small"
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', height: 20 }}
                  />
                )}
              </Box>
              <Box display="flex" gap={0.5}>
                <IconButton
                  size="small"
                  onClick={() => setIsMaximized((prev) => !prev)}
                  sx={{ color: 'white' }}
                >
                  {isMaximized ? <CloseFullscreen fontSize="small" /> : <OpenInFull fontSize="small" />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setIsMinimized(true)}
                  sx={{ color: 'white' }}
                >
                  <Minimize fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsMinimized(true);
                    setShowDisclaimer(true);
                  }}
                  sx={{ color: 'white' }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Disclaimer */}
            {showDisclaimer && (
              <Alert
                severity="warning"
                icon={<Warning />}
                onClose={() => setShowDisclaimer(false)}
                sx={{
                  m: 1,
                  '& .MuiAlert-message': {
                    fontSize: '0.75rem',
                  },
                }}
              >
                <Typography variant="caption" component="div">
                  <strong>{t('chat.disclaimerTitle') || 'Medical Disclaimer:'}</strong>
                  <br />
                  {t('chat.disclaimerText') || 'I am an AI assistant providing general health information. For medical emergencies, call 907 or contact emergency services immediately. Always consult healthcare professionals for medical advice.'}
                </Typography>
              </Alert>
            )}

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {messages.map((message) => {
                const isUser = message.role === 'user';
                const isAssistant = message.role === 'assistant';
                let title: string | null = null;
                let body: string | null = null;
                if (isAssistant && message.content.includes('\n\n')) {
                  const parts = message.content.split('\n\n');
                  title = parts[0];
                  body = parts.slice(1).join('\n\n');
                }
                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        maxWidth: '80%',
                        borderRadius: 2,
                        bgcolor: isUser
                          ? 'primary.main'
                          : message.isError
                          ? 'error.light'
                          : 'background.paper',
                        color: isUser ? 'white' : 'text.primary',
                        border: isAssistant ? '1px solid' : 'none',
                        borderColor: message.isError ? 'error.main' : isAssistant ? 'primary.light' : 'transparent',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: 3,
                        },
                      }}
                    >
                      {title && body && !message.isError ? (
                        <>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, whiteSpace: 'pre-wrap' }}>
                            {title}
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {body}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>
                      )}
                      {message.isError && message.retryPayload && (
                        <Box mt={1} display="flex" justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            startIcon={<Replay fontSize="small" />}
                            onClick={() => handleRetry(message.retryPayload)}
                            sx={{ fontSize: '0.7rem', textTransform: 'none' }}
                          >
                            {t('chat.retry') || 'Retry'}
                          </Button>
                        </Box>
                      )}
                      {message.confidence !== undefined && message.confidence < 0.7 && (
                        <Chip
                          label={t('chat.lowConfidence') || 'Low Confidence'}
                          size="small"
                          color="warning"
                          sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
                        />
                      )}
                    </Paper>
                  </Box>
                );
              })}
              {isProcessing && (
                <Box display="flex" justifyContent="flex-start">
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'primary.light',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        {isAmharic ? 'ሜዲ አሲስታንት በመጻፍ ላይ ነው...' : 'Medi Assistant is typing...'}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Button size="small" variant="text" color="warning" onClick={clearHistory}>
                  {isAmharic ? 'አጥፋ' : 'Clear'}
                </Button>
              </Box>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                    placeholder={isAmharic ? 'የጤና ጥያቄዎን ይፃፉ...' : 'Type your health question...'}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={isProcessing}
                  multiline
                  maxRows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={isProcessing || !inputMessage.trim()}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&:disabled': {
                      bgcolor: 'action.disabledBackground',
                    },
                  }}
                >
                  <Send />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                {isAmharic
                  ? 'ለመላክ Enter ይጫኑ • ለአዲስ መስመር Shift+Enter'
                  : 'Press Enter to send • Shift+Enter for new line'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Collapse>
    </>
  );
};

