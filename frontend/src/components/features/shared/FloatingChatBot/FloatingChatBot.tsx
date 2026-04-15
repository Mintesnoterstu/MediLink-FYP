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
} from '@mui/icons-material';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AIMessage } from '@/types';
import logo from '@/assets/logo.png';

interface FloatingChatBotProps {
  initialMinimized?: boolean;
}

// Quick action buttons based on current page
const getQuickActions = (pathname: string, t: any) => {
  const actions: Array<{ label: string; message: string }> = [];

  if (pathname.includes('/diseases')) {
    actions.push(
      { label: t('chat.explainSymptoms'), message: 'Can you explain the symptoms of this disease?' },
      { label: t('chat.showPrevention'), message: 'How can I prevent this condition?' },
      { label: t('chat.findTreatments'), message: 'What are the treatment options?' }
    );
  } else if (pathname.includes('/symptom-checker')) {
    actions.push(
      { label: t('chat.analyzeSymptoms'), message: 'I need help analyzing my symptoms' },
      { label: t('chat.isThisSerious'), message: 'Is this condition serious? When should I see a doctor?' }
    );
  } else if (pathname.includes('/dashboard')) {
    actions.push(
      { label: t('chat.healthAdvice'), message: 'Can you give me personalized health advice based on my data?' },
      { label: t('chat.medicationHelp'), message: 'I have questions about my medications' }
    );
  } else if (pathname.includes('/medicine-hub')) {
    actions.push(
      { label: t('chat.treatmentInfo'), message: 'Tell me about treatment options' },
      { label: t('chat.remedyInfo'), message: 'What remedies are available?' }
    );
  } else {
    actions.push(
      { label: t('chat.generalHealth'), message: 'I have a general health question' },
      { label: t('chat.findInfo'), message: 'Help me find health information' }
    );
  }

  return actions;
};

// Get context-aware greeting based on current page
const getContextualGreeting = (pathname: string, t: any): string => {
  if (pathname.includes('/diseases')) {
    return t('chat.greetingDiseases') || "I see you're exploring our disease library. How can I help you understand any condition better?";
  } else if (pathname.includes('/symptom-checker')) {
    return t('chat.greetingSymptoms') || "I'm here to help you understand your symptoms. What would you like to know?";
  } else if (pathname.includes('/dashboard')) {
    return t('chat.greetingDashboard') || "Hello! I can provide personalized health advice based on your health data. How can I assist you?";
  } else if (pathname.includes('/medicine-hub')) {
    return t('chat.greetingMedicine') || "I can help you understand treatments and remedies. What would you like to learn about?";
  }
  return t('chat.greetingDefault') || "Hello! I'm Medi Assistant, your AI health guide. I'm here to help with health questions. How can I assist you today?";
};

export const FloatingChatBot: React.FC<FloatingChatBotProps> = ({ initialMinimized = true }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const { patientData } = useHealthData();

  const [isMinimized, setIsMinimized] = useState(initialMinimized);
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
      content: getContextualGreeting(location.pathname, t),
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
      content: getContextualGreeting(location.pathname, t),
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
        content: getContextualGreeting(location.pathname, t),
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
          };
          setMessages((prev) => [...prev, errorMessage]);
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }, 100);
  };


  const quickActions = getQuickActions(location.pathname, t);

  return (
    <>
      {/* Minimized Chat Bubble */}
      <Collapse in={isMinimized} orientation="vertical">
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              borderRadius: '50%',
              width: 64,
              height: 64,
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
                component="img"
                src={logo}
                alt="MediLink"
                sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.15)', p: 0.5 }}
              />
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
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            maxWidth: 400,
            height: 600,
            maxHeight: { xs: 'calc(100vh - 48px)', sm: 600 },
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
                  component="img"
                  src={logo}
                  alt="MediLink"
                  sx={{ width: 24, height: 24, borderRadius: 0.75, bgcolor: 'rgba(255,255,255,0.15)', p: 0.25 }}
                />
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
                  onClick={() => setIsMinimized(true)}
                  sx={{ color: 'white' }}
                >
                  <Minimize />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsMinimized(true);
                    setShowDisclaimer(true);
                  }}
                  sx={{ color: 'white' }}
                >
                  <Close />
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
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '80%',
                      borderRadius: 2,
                      bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      border: message.role === 'assistant' ? '1px solid' : 'none',
                      borderColor: message.role === 'assistant' ? 'primary.light' : 'transparent',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
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
              ))}
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
                        {t('chat.typing') || 'Typing…'}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Quick Actions */}
            {quickActions.length > 0 && messages.length <= 1 && (
              <Box sx={{ p: 1, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1, display: 'block', mb: 0.5 }}>
                  {t('chat.quickActions') || 'Quick actions:'}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      size="small"
                      variant="outlined"
                      onClick={() => handleQuickAction(action.message)}
                      sx={{
                        fontSize: '0.7rem',
                        py: 0.25,
                        px: 1,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white',
                        },
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

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
                <Typography variant="caption" color="text.secondary">
                  {t('chat.suggestions') || 'Suggestions:'}
                </Typography>
                <Button size="small" variant="text" color="warning" onClick={clearHistory}>
                  {t('chat.clearHistory') || 'Clear'}
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
                {getQuickActions(location.pathname, t).slice(0, 2).map((a) => (
                  <Chip
                    key={a.label}
                    label={a.label}
                    size="small"
                    variant="outlined"
                    onClick={() => handleQuickAction(a.message)}
                  />
                ))}
              </Box>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('chat.placeholder') || 'Type your health question...'}
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
                {t('chat.footer') || 'Press Enter to send • Shift+Enter for new line'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Collapse>
    </>
  );
};

