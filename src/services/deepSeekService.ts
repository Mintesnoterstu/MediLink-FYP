import axios from 'axios';
import { AIMessage, AIRecommendation, SymptomAnalysis, AIConversation } from '@/types';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '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';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://medilink.ethiopia';
const SITE_NAME = 'MediLink Ethiopia';

// Fallback to DeepSeek direct API if OpenRouter key not available
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

// Use OpenRouter if we have the key (it's the primary method)
const useOpenRouter = !!OPENROUTER_API_KEY && OPENROUTER_API_KEY !== '';

const openRouterApi = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': SITE_URL,
    'X-Title': SITE_NAME,
  },
});

const deepSeekApi = axios.create({
  baseURL: DEEPSEEK_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
  },
});

// Response interface for both OpenRouter and DeepSeek APIs
interface DeepSeekResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    total_tokens: number;
  };
  // OpenRouter may include additional fields
  id?: string;
  model?: string;
}

export const deepSeekService = {
  async chat(message: string, patientContext?: any): Promise<AIMessage> {
    try {
      const systemPrompt = this.buildSystemPrompt(patientContext);
      
      const requestConfig = {
        model: useOpenRouter ? 'deepseek/deepseek-r1-0528:free' : 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      };

      let response;
      if (useOpenRouter) {
        // Use OpenRouter API
        response = await openRouterApi.post<DeepSeekResponse>('/chat/completions', requestConfig);
      } else {
        // Fallback to direct DeepSeek API
        response = await deepSeekApi.post<DeepSeekResponse>('/chat/completions', requestConfig);
      }

      const content = response.data.choices[0]?.message?.content || 'I apologize, I could not process your request.';
      
      // Calculate confidence based on response quality
      const confidence = this.calculateConfidence(response.data);

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        confidence,
      };
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        useOpenRouter,
        hasKey: !!OPENROUTER_API_KEY,
      });
      // Fallback to rule-based response
      return this.getFallbackResponse(message);
    }
  },

  async analyzeSymptoms(symptoms: any[], patientContext: any): Promise<SymptomAnalysis> {
    try {
      const symptomDescription = symptoms.map(s => 
        `${s.name}: severity ${s.severity}/10, duration: ${s.duration}`
      ).join('; ');

      const prompt = `Analyze these symptoms for a ${patientContext.age || 'unknown'} year old ${patientContext.gender || 'patient'}: ${symptomDescription}. 
      Medical history: ${patientContext.medicalHistory?.map((h: any) => h.diagnosis).join(', ') || 'None'}. 
      Current medications: ${patientContext.currentMedications?.map((m: any) => m.name).join(', ') || 'None'}.
      
      Provide:
      1. Possible conditions with probability scores
      2. Urgency level (low/medium/high/critical)
      3. Recommendations
      4. Confidence score (0-1)`;

      const requestConfig = {
        model: useOpenRouter ? 'deepseek/deepseek-r1-0528:free' : 'deepseek-chat',
        messages: [
          { role: 'system', content: this.buildSystemPrompt(patientContext) },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      };

      let response;
      if (useOpenRouter) {
        response = await openRouterApi.post<DeepSeekResponse>('/chat/completions', requestConfig);
      } else {
        response = await deepSeekApi.post<DeepSeekResponse>('/chat/completions', requestConfig);
      }

      const content = response.data.choices[0]?.message?.content || '';
      const analysis = this.parseSymptomAnalysis(content, symptoms);
      
      return {
        id: Date.now().toString(),
        symptoms,
        possibleConditions: analysis.conditions,
        urgencyLevel: analysis.urgency,
        recommendations: analysis.recommendations,
        confidence: analysis.confidence,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Fallback analysis
      return this.getFallbackSymptomAnalysis(symptoms);
    }
  },

  async getRecommendation(type: string, context: any): Promise<AIRecommendation> {
    try {
      const prompt = `Provide a ${type} health recommendation for this patient: ${JSON.stringify(context)}`;
      
      const requestConfig = {
        model: useOpenRouter ? 'deepseek/deepseek-r1-0528:free' : 'deepseek-chat',
        messages: [
          { role: 'system', content: this.buildSystemPrompt(context) },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      };

      let response;
      if (useOpenRouter) {
        response = await openRouterApi.post<DeepSeekResponse>('/chat/completions', requestConfig);
      } else {
        response = await deepSeekApi.post<DeepSeekResponse>('/chat/completions', requestConfig);
      }

      const content = response.data.choices[0]?.message?.content || '';
      const confidence = this.calculateConfidence(response.data);

      return {
        id: Date.now().toString(),
        type: type as any,
        title: `${type} Recommendation`,
        message: content,
        confidence,
        priority: confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        type: type as any,
        title: `${type} Recommendation`,
        message: 'Please consult with a healthcare provider for personalized advice.',
        confidence: 0.5,
        priority: 'low',
        timestamp: new Date().toISOString(),
      };
    }
  },

  async getConversations(_patientId: string): Promise<AIConversation[]> {
    // In a real implementation, this would fetch from backend
    // For now, return empty array
    return [];
  },

  buildSystemPrompt(patientContext?: any): string {
    const currentPage = patientContext?.currentPage || 'general';
    let pageContext = '';
    
    if (currentPage.includes('/diseases')) {
      pageContext = 'The user is currently viewing the Disease Library. You can help explain diseases, symptoms, prevention, and treatments.';
    } else if (currentPage.includes('/symptom-checker')) {
      pageContext = 'The user is using the Symptom Checker. Help them understand their symptoms and guide them appropriately.';
    } else if (currentPage.includes('/dashboard')) {
      pageContext = 'The user is on their health dashboard. Provide personalized advice based on their health data if available.';
    } else if (currentPage.includes('/medicine-hub')) {
      pageContext = 'The user is exploring treatments and remedies. Help them understand medical options and traditional medicine.';
    }
    
    return `You are Medi Assistant, a compassionate AI health advisor for MediLink, serving patients in Ethiopia. 
    You provide medical guidance in both English and Amharic. 
    ${patientContext ? `Patient context: Age ${patientContext.age}, Gender ${patientContext.gender}` : ''}
    ${pageContext}
    
    IMPORTANT GUIDELINES:
    - Always emphasize that you are an AI assistant providing general health information
    - For medical emergencies, immediately direct users to call 911/907 or visit the Emergency page
    - Recommend consulting healthcare providers for serious concerns and personalized advice
    - Be culturally sensitive and aware of local health conditions in Ethiopia
    - If you detect emergency symptoms (chest pain, difficulty breathing, severe bleeding, etc.), immediately recommend seeking emergency care
    - For symptom analysis, guide users to the Symptom Checker feature
    - For disease information, direct users to the Disease Library
    - Be helpful, empathetic, and clear in your responses
    - If uncertain, recommend consulting with healthcare professionals`;
  },

  calculateConfidence(response: DeepSeekResponse): number {
    // Simple confidence calculation based on response quality
    if (!response.choices || response.choices.length === 0) return 0.3;
    if (response.choices[0].finish_reason !== 'stop') return 0.5;
    return 0.85; // Default confidence for successful responses
  },

  parseSymptomAnalysis(content: string, _symptoms: any[]): {
    conditions: any[];
    urgency: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    confidence: number;
  } {
    // Simple parsing - in production, use more sophisticated NLP
    const lines = content.split('\n').filter(l => l.trim());
    const conditions: any[] = [];
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    const recommendations: string[] = [];

    lines.forEach(line => {
      if (line.toLowerCase().includes('critical') || line.toLowerCase().includes('emergency')) {
        urgency = 'critical';
      } else if (line.toLowerCase().includes('high')) {
        urgency = 'high';
      } else if (line.toLowerCase().includes('low')) {
        urgency = 'low';
      }
      
      if (line.includes('recommend') || line.includes('suggest')) {
        recommendations.push(line);
      }
    });

    // Default conditions if parsing fails
    if (conditions.length === 0) {
      conditions.push({
        condition: 'Further evaluation needed',
        probability: 0.5,
        description: 'Please consult with a healthcare provider for accurate diagnosis.',
      });
    }

    return {
      conditions,
      urgency,
      recommendations: recommendations.length > 0 ? recommendations : ['Consult a healthcare provider'],
      confidence: 0.7,
    };
  },

  getFallbackResponse(message: string): AIMessage {
    const lowerMessage = message.toLowerCase();
    
    // Detect emergency keywords
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || 
        lowerMessage.includes('critical') || lowerMessage.includes('911') || 
        lowerMessage.includes('ambulance')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'For medical emergencies, please:\n\n1. Call 911 or 907 immediately\n2. Visit our Emergency page for comprehensive emergency information\n3. Contact your nearest hospital\n\nI can help you with general health questions, but for urgent situations, please seek immediate professional medical care.',
        timestamp: new Date().toISOString(),
        confidence: 0.3,
      };
    }

    // Detect symptom-related queries
    if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || 
        lowerMessage.includes('ache') || lowerMessage.includes('fever') ||
        lowerMessage.includes('headache') || lowerMessage.includes('dizziness')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I\'m currently enhancing my medical knowledge. For symptom analysis, I recommend:\n\n• Using our Symptom Checker for detailed symptom tracking\n• Visiting our Disease Library for condition information\n• Consulting with a healthcare provider for proper diagnosis\n\nI can help guide you to the right resources on our platform.',
        timestamp: new Date().toISOString(),
        confidence: 0.3,
      };
    }

    // Detect disease/condition queries
    if (lowerMessage.includes('disease') || lowerMessage.includes('condition') || 
        lowerMessage.includes('illness') || lowerMessage.includes('sick')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'For disease information, please:\n\n• Visit our Disease Library for comprehensive condition details\n• Check symptoms, causes, prevention, and treatment options\n• Use our Symptom Checker if you\'re experiencing symptoms\n\nI can help you navigate to the right information on our platform.',
        timestamp: new Date().toISOString(),
        confidence: 0.3,
      };
    }

    // Default helpful fallback
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'I\'m currently enhancing my medical knowledge to provide better assistance.\n\nFor now, I can help you:\n• Navigate to our Symptom Checker\n• Find disease information in our Disease Library\n• Locate emergency contacts on our Emergency page\n• Guide you to relevant health resources\n\nFor immediate medical concerns, please contact healthcare providers or visit our Emergency page.',
      timestamp: new Date().toISOString(),
      confidence: 0.3,
    };
  },

  getFallbackSymptomAnalysis(symptoms: any[]): SymptomAnalysis {
    return {
      id: Date.now().toString(),
      symptoms,
      possibleConditions: [
        {
          condition: 'Requires Medical Evaluation',
          probability: 0.8,
          description: 'Please consult with a healthcare provider for proper diagnosis.',
        },
      ],
      urgencyLevel: 'medium',
      recommendations: ['Schedule an appointment with your healthcare provider', 'Monitor symptoms closely'],
      confidence: 0.5,
      timestamp: new Date().toISOString(),
    };
  },
};

