import { Disease, VerifiedRemedy } from '@/types';
import { apiClient } from '@/services/apiClient';

function normalizeMedicineCategory(category: string): VerifiedRemedy['category'] {
  const normalized = String(category || '').toLowerCase();
  if (normalized === 'modern' || normalized === 'otc') return 'modern';
  if (normalized === 'prescription') return 'prescription';
  return 'traditional';
}

export const catalogService = {
  async getDiseases(): Promise<Disease[]> {
    const response = await apiClient.get('/diseases');
    return (response.data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      nameAmharic: row.name_am,
      category: row.category,
      description: row.description,
      descriptionAmharic: row.description_am,
      symptoms: row.symptoms || [],
      symptomsAmharic: row.symptoms_am || [],
      causes: row.causes || [],
      causesAmharic: row.causes_am || [],
      prevention: row.prevention || [],
      preventionAmharic: row.prevention_am || [],
      treatment: row.treatment || [],
      treatmentAmharic: row.treatment_am || [],
      severity: row.severity || 'mild',
      prevalence: row.prevalence || undefined,
      bodyRegions: row.body_regions || [],
      seasonal: row.seasonal || [],
      seasonalAmharic: row.seasonal_am || [],
      videoUrl: row.video_url || undefined,
    }));
  },

  async getMedicines(): Promise<VerifiedRemedy[]> {
    const response = await apiClient.get('/medicines');
    return (response.data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      nameAmharic: row.name_am,
      category: normalizeMedicineCategory(row.category),
      bodyPart: 'general',
      healthGoal: 'pain',
      description: row.description,
      descriptionAmharic: row.description_am,
      preparation: row.preparation || row.description,
      preparationAmharic: row.preparation_am || row.description_am,
      dosage: row.dosage || '',
      dosageAmharic: row.dosage_am || row.dosage || '',
      indications: row.uses || [],
      indicationsAmharic: row.uses_am || [],
      contraindications: row.contraindications || [],
      contraindicationsAmharic: row.contraindications_am || [],
      verificationLevel: 'verified',
      ministryApproved: true,
      scientificEvidence: 'moderate',
      safetyWarnings: row.safety_warnings || [],
      safetyWarningsAmharic: row.safety_warnings_am || [],
      medicationInteractions: [],
      culturalContext: row.cultural_context || '',
      culturalContextAmharic: row.cultural_context_am || '',
      imageUrl: row.image_url || undefined,
    }));
  },
};
