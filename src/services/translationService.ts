import i18n from '@/i18n/config';

export const translationService = {
  translate(key: string, options?: any): string {
    return i18n.t(key, options) as string;
  },

  translateMedicalTerm(term: string, language: 'en' | 'am'): string {
    // Medical term dictionary - in production, use a comprehensive medical terminology database
    const medicalTerms: Record<string, { en: string; am: string }> = {
      'headache': { en: 'Headache', am: 'ራስ ምታት' },
      'fever': { en: 'Fever', am: 'ትኩሳት' },
      'cough': { en: 'Cough', am: 'ሳል' },
      'chest pain': { en: 'Chest Pain', am: 'ደረት ምታት' },
      'nausea': { en: 'Nausea', am: 'ማቅለሽለሽ' },
      'diabetes': { en: 'Diabetes', am: 'ስኳር በሽታ' },
      'hypertension': { en: 'Hypertension', am: 'የደም ግፊት' },
      'medication': { en: 'Medication', am: 'መድሃኒት' },
      'appointment': { en: 'Appointment', am: 'ቀጠሮ' },
      'symptom': { en: 'Symptom', am: 'ምልክት' },
    };

    const termLower = term.toLowerCase();
    const translation = medicalTerms[termLower];
    
    if (translation) {
      return translation[language];
    }
    
    // Fallback to i18n if term not in dictionary
    return i18n.t(`medicalTerms.${term}`, { lng: language, defaultValue: term });
  },

  getCurrentLanguage(): 'en' | 'am' {
    return (i18n.language || 'en') as 'en' | 'am';
  },

  setLanguage(language: 'en' | 'am'): void {
    i18n.changeLanguage(language);
  },
};

