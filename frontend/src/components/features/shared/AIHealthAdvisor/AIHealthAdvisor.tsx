import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField, IconButton, Typography, Chip, CircularProgress, Alert, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Send, SmartToy, Warning, Info, ThumbUp, ThumbDown } from '@mui/icons-material';
import { useAI } from '@/contexts/AIContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useTranslation } from 'react-i18next';
import { AIMessage, AIRecommendation } from '@/types';
import { HealthCard } from '@/components/ui';

interface AIHealthAdvisorProps {
  conversationHistory?: AIMessage[];
  patientContext?: any;
  deepSeekService?: any;
  onNewRecommendation?: (recommendation: AIRecommendation) => void;
  messageTemplates?: Array<{ id: string; label: string; content: string }>;
  confidenceThreshold?: number;
  fallbackMode?: boolean;
}

// Pre-approved medical response templates
const defaultMessageTemplates = [
  { id: 'general', label: 'General Health Question', content: 'I have a question about my health.' },
  { id: 'symptoms', label: 'Symptom Inquiry', content: 'I am experiencing some symptoms and would like advice.' },
  { id: 'medication', label: 'Medication Question', content: 'I have a question about my medications.' },
  { id: 'lifestyle', label: 'Lifestyle Advice', content: 'I would like advice on improving my lifestyle and health.' },
];

export const AIHealthAdvisor: React.FC<AIHealthAdvisorProps> = ({
  conversationHistory,
  patientContext,
  deepSeekService: _deepSeekService,
  onNewRecommendation,
  messageTemplates = defaultMessageTemplates,
  confidenceThreshold = 0.7,
  fallbackMode: propFallbackMode,
}) => {
  const { t } = useTranslation();
  const { sendMessage, isProcessing, modelConfidence, fallbackMode: contextFallbackMode, currentConversation, createNewConversation } = useAI();
  const { patientData } = useHealthData();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>(conversationHistory || []);
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, 'positive' | 'negative'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const context = patientContext || patientData;
  const fallbackMode = propFallbackMode !== undefined ? propFallbackMode : contextFallbackMode;

  useEffect(() => {
    if (conversationHistory && conversationHistory.length > 0) {
      setMessages(conversationHistory);
    } else if (currentConversation) {
      setMessages(currentConversation.messages);
    }
  }, [conversationHistory, currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentConversation && context) {
      createNewConversation(context);
    }
  }, [context, currentConversation, createNewConversation]);

  const handleSend = async (messageText?: string) => {
    const messageToSend = messageText || inputMessage;
    if (!messageToSend.trim() || isProcessing) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) {
      setInputMessage('');
    }

    try {
      const response = await sendMessage(messageToSend, context);
      setMessages((prev) => [...prev, response]);

      // Check confidence and create recommendation if above threshold
      if (response.confidence && response.confidence >= confidenceThreshold && onNewRecommendation) {
        const recommendation: AIRecommendation = {
          id: Date.now().toString(),
          type: 'lifestyle',
          title: t('ai.recommendation'),
          message: response.content,
          confidence: response.confidence,
          priority: response.confidence > 0.8 ? 'high' : 'medium',
          timestamp: new Date().toISOString(),
        };
        onNewRecommendation(recommendation);
      }

      // Show warning if confidence is low
      if (response.confidence && response.confidence < confidenceThreshold) {
        // Could show a toast or alert here
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Fallback response
      const fallbackMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: t('ai.fallbackResponse'),
        timestamp: new Date().toISOString(),
        confidence: 0.3,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    }
  };

  const handleTemplateSelect = (template: typeof messageTemplates[0]) => {
    handleSend(template.content);
    setTemplateMenuAnchor(null);
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessageFeedback({ ...messageFeedback, [messageId]: feedback });
    // In production, this would send feedback to the backend for AI improvement
    console.log('Feedback submitted:', { messageId, feedback });
  };

  return (
    <HealthCard
      title={t('ai.title')}
      icon={<SmartToy />}
      action={
        <Box display="flex" gap={1} alignItems="center">
          {fallbackMode && (
            <Chip 
              label={t('ai.fallbackMode')} 
              color="warning" 
              size="small"
              icon={<Warning />}
            />
          )}
          {modelConfidence < confidenceThreshold && (
            <Chip 
              label={`${t('ai.confidence')}: ${(modelConfidence * 100).toFixed(0)}%`} 
              color="info" 
              size="small"
              icon={<Info />}
            />
          )}
          <IconButton
            size="small"
            onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
            title={t('ai.useTemplate')}
          >
            <Info />
          </IconButton>
        </Box>
      }
    >
      {fallbackMode && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('ai.fallbackWarning')}
        </Alert>
      )}
      <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
        {messages.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            {t('ai.askQuestion')}
          </Typography>
        )}
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor: message.role === 'user' 
                  ? 'primary.main' 
                  : 'background.paper',
                color: message.role === 'user' ? 'white' : 'text.primary',
                borderRadius: 3,
                border: message.role === 'user' ? 'none' : '1px solid',
                borderColor: message.role === 'user' ? 'transparent' : 'primary.light',
                position: 'relative',
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              {message.confidence !== undefined && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    {t('ai.confidence')}: {(message.confidence * 100).toFixed(0)}%
                  </Typography>
                  {message.confidence < confidenceThreshold && (
                    <Chip label={t('ai.lowConfidence')} size="small" color="warning" />
                  )}
                </Box>
              )}
              {message.role === 'assistant' && (
                <Box display="flex" gap={0.5} mt={1}>
                  <IconButton
                    size="small"
                    onClick={() => handleFeedback(message.id, 'positive')}
                    color={messageFeedback[message.id] === 'positive' ? 'primary' : 'default'}
                  >
                    <ThumbUp fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleFeedback(message.id, 'negative')}
                    color={messageFeedback[message.id] === 'negative' ? 'error' : 'default'}
                  >
                    <ThumbDown fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Paper>
          </Box>
        ))}
        {isProcessing && (
          <Box display="flex" justifyContent="flex-start" mb={2}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <CircularProgress size={20} />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Box display="flex" gap={1} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          placeholder={t('ai.askQuestion') || 'Ask a health question...'}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isProcessing}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
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
          onClick={() => handleSend()} 
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
      
      <Menu
        anchorEl={templateMenuAnchor}
        open={Boolean(templateMenuAnchor)}
        onClose={() => setTemplateMenuAnchor(null)}
      >
        {messageTemplates.map((template) => (
          <MenuItem key={template.id} onClick={() => handleTemplateSelect(template)}>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText primary={template.label} secondary={template.content} />
          </MenuItem>
        ))}
      </Menu>
    </HealthCard>
  );
};

