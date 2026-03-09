import { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  PatientData,
  Medication,
  Appointment,
  SymptomAnalysis,
  AIRecommendation,
  VitalSigns,
} from '@/types';
import { healthDataService } from '@/services/healthDataService';

interface HealthDataState {
  patientData: PatientData | null;
  appointments: Appointment[];
  symptomAnalyses: SymptomAnalysis[];
  aiRecommendations: AIRecommendation[];
  isLoading: boolean;
  error: string | null;
}

type HealthDataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PATIENT_DATA'; payload: PatientData }
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'SET_SYMPTOM_ANALYSES'; payload: SymptomAnalysis[] }
  | { type: 'ADD_SYMPTOM_ANALYSIS'; payload: SymptomAnalysis }
  | { type: 'SET_AI_RECOMMENDATIONS'; payload: AIRecommendation[] }
  | { type: 'ADD_AI_RECOMMENDATION'; payload: AIRecommendation }
  | { type: 'UPDATE_MEDICATION'; payload: Medication }
  | { type: 'ADD_MEDICATION'; payload: Medication }
  | { type: 'REMOVE_MEDICATION'; payload: string }
  | { type: 'ADD_VITAL_SIGNS'; payload: VitalSigns }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: HealthDataState = {
  patientData: null,
  appointments: [],
  symptomAnalyses: [],
  aiRecommendations: [],
  isLoading: false,
  error: null,
};

function healthDataReducer(state: HealthDataState, action: HealthDataAction): HealthDataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PATIENT_DATA':
      return { ...state, patientData: action.payload };
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map((apt) =>
          apt.id === action.payload.id ? action.payload : apt
        ),
      };
    case 'SET_SYMPTOM_ANALYSES':
      return { ...state, symptomAnalyses: action.payload };
    case 'ADD_SYMPTOM_ANALYSIS':
      return { ...state, symptomAnalyses: [...state.symptomAnalyses, action.payload] };
    case 'SET_AI_RECOMMENDATIONS':
      return { ...state, aiRecommendations: action.payload };
    case 'ADD_AI_RECOMMENDATION':
      return { ...state, aiRecommendations: [...state.aiRecommendations, action.payload] };
    case 'UPDATE_MEDICATION':
      if (!state.patientData) return state;
      return {
        ...state,
        patientData: {
          ...state.patientData,
          currentMedications: state.patientData.currentMedications.map((med) =>
            med.id === action.payload.id ? action.payload : med
          ),
        },
      };
    case 'ADD_MEDICATION':
      if (!state.patientData) return state;
      return {
        ...state,
        patientData: {
          ...state.patientData,
          currentMedications: [...state.patientData.currentMedications, action.payload],
        },
      };
    case 'REMOVE_MEDICATION':
      if (!state.patientData) return state;
      return {
        ...state,
        patientData: {
          ...state.patientData,
          currentMedications: state.patientData.currentMedications.filter(
            (med) => med.id !== action.payload
          ),
        },
      };
    case 'ADD_VITAL_SIGNS':
      if (!state.patientData) return state;
      return {
        ...state,
        patientData: {
          ...state.patientData,
          vitalSigns: [...(state.patientData.vitalSigns || []), action.payload],
        },
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface HealthDataContextType extends HealthDataState {
  loadPatientData: (patientId: string) => Promise<void>;
  loadAppointments: (patientId: string) => Promise<void>;
  createAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  addSymptomAnalysis: (analysis: SymptomAnalysis) => void;
  loadSymptomAnalyses: (patientId: string) => Promise<void>;
  loadAIRecommendations: (patientId: string) => Promise<void>;
  updateMedication: (medication: Medication) => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  removeMedication: (medicationId: string) => Promise<void>;
  addVitalSigns: (vitals: VitalSigns) => Promise<void>;
  updatePatientData: (data: Partial<PatientData>) => Promise<void>;
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export function HealthDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(healthDataReducer, initialState);

  const loadPatientData = async (patientId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await healthDataService.getPatientData(patientId);
      dispatch({ type: 'SET_PATIENT_DATA', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadAppointments = async (patientId: string) => {
    try {
      const appointments = await healthDataService.getAppointments(patientId);
      dispatch({ type: 'SET_APPOINTMENTS', payload: appointments });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const createAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment = await healthDataService.createAppointment(appointment);
      dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateAppointment = async (appointment: Appointment) => {
    try {
      const updated = await healthDataService.updateAppointment(appointment);
      dispatch({ type: 'UPDATE_APPOINTMENT', payload: updated });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const addSymptomAnalysis = (analysis: SymptomAnalysis) => {
    dispatch({ type: 'ADD_SYMPTOM_ANALYSIS', payload: analysis });
  };

  const loadSymptomAnalyses = async (patientId: string) => {
    try {
      const analyses = await healthDataService.getSymptomAnalyses(patientId);
      dispatch({ type: 'SET_SYMPTOM_ANALYSES', payload: analyses });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const loadAIRecommendations = async (patientId: string) => {
    try {
      const recommendations = await healthDataService.getAIRecommendations(patientId);
      dispatch({ type: 'SET_AI_RECOMMENDATIONS', payload: recommendations });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updateMedication = async (medication: Medication) => {
    try {
      await healthDataService.updateMedication(medication);
      dispatch({ type: 'UPDATE_MEDICATION', payload: medication });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    try {
      const newMedication = await healthDataService.addMedication(medication);
      dispatch({ type: 'ADD_MEDICATION', payload: newMedication });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const removeMedication = async (medicationId: string) => {
    try {
      await healthDataService.removeMedication(medicationId);
      dispatch({ type: 'REMOVE_MEDICATION', payload: medicationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const addVitalSigns = async (vitals: VitalSigns) => {
    try {
      await healthDataService.addVitalSigns(vitals);
      dispatch({ type: 'ADD_VITAL_SIGNS', payload: vitals });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updatePatientData = async (data: Partial<PatientData>) => {
    if (!state.patientData) return;
    try {
      const updated = await healthDataService.updatePatientData(state.patientData.id, data);
      dispatch({ type: 'SET_PATIENT_DATA', payload: updated });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  return (
    <HealthDataContext.Provider
      value={{
        ...state,
        loadPatientData,
        loadAppointments,
        createAppointment,
        updateAppointment,
        addSymptomAnalysis,
        loadSymptomAnalyses,
        loadAIRecommendations,
        updateMedication,
        addMedication,
        removeMedication,
        addVitalSigns,
        updatePatientData,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
}

export function useHealthData() {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
}

