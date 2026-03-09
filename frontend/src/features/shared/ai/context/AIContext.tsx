import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AIConversation, AIMessage, AIRecommendation } from '@/types';
import { aiService } from '@/features/shared/ai/services/aiService';

interface AIState {
  conversations: AIConversation[];
  currentConversation: AIConversation | null;
  isProcessing: boolean;
  modelConfidence: number;
  fallbackMode: boolean;
}

type AIAction =
  | { type: 'SET_CONVERSATIONS'; payload: AIConversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: AIConversation | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: AIMessage } }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_MODEL_CONFIDENCE'; payload: number }
  | { type: 'SET_FALLBACK_MODE'; payload: boolean }
  | { type: 'CREATE_CONVERSATION'; payload: AIConversation };

const initialState: AIState = {
  conversations: [],
  currentConversation: null,
  isProcessing: false,
  modelConfidence: 1.0,
  fallbackMode: false,
};

function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversation: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.conversationId
            ? { ...conv, messages: [...conv.messages, action.payload.message] }
            : conv
        ),
        currentConversation:
          state.currentConversation?.id === action.payload.conversationId
            ? {
                ...state.currentConversation,
                messages: [...state.currentConversation.messages, action.payload.message],
              }
            : state.currentConversation,
      };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_MODEL_CONFIDENCE':
      return { ...state, modelConfidence: action.payload };
    case 'SET_FALLBACK_MODE':
      return { ...state, fallbackMode: action.payload };
    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [...state.conversations, action.payload],
        currentConversation: action.payload,
      };
    default:
      return state;
  }
}

interface AIContextType extends AIState {
  sendMessage: (message: string, patientContext?: any) => Promise<AIMessage>;
  createNewConversation: (patientContext: any) => void;
  loadConversations: (patientId: string) => Promise<void>;
  getRecommendation: (type: string, context: any) => Promise<AIRecommendation>;
  analyzeSymptoms: (symptoms: any[], patientContext: any) => Promise<any>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  const sendMessage = async (message: string, patientContext?: any): Promise<AIMessage> => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    try {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      if (state.currentConversation) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { conversationId: state.currentConversation.id, message: userMessage },
        });
      }

      const response = await aiService.chat(message, patientContext);

      dispatch({ type: 'SET_MODEL_CONFIDENCE', payload: response.confidence || 1.0 });
      dispatch({ type: 'SET_FALLBACK_MODE', payload: (response.confidence || 1.0) < 0.7 });

      if (state.currentConversation) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { conversationId: state.currentConversation.id, message: response },
        });
      }

      return response;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const createNewConversation = (patientContext: any) => {
    const conversation: AIConversation = {
      id: Date.now().toString(),
      messages: [],
      patientContext,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'CREATE_CONVERSATION', payload: conversation });
  };

  const loadConversations = async (patientId: string) => {
    try {
      const conversations = await aiService.getConversations(patientId);
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const getRecommendation = async (type: string, context: any): Promise<AIRecommendation> => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    try {
      return await aiService.getRecommendation(type, context);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const analyzeSymptoms = async (symptoms: any[], patientContext: any) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    try {
      const analysis = await aiService.analyzeSymptoms(symptoms, patientContext);
      dispatch({ type: 'SET_MODEL_CONFIDENCE', payload: analysis.confidence || 1.0 });
      return analysis;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  return (
    <AIContext.Provider
      value={{
        ...state,
        sendMessage,
        createNewConversation,
        loadConversations,
        getRecommendation,
        analyzeSymptoms,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

