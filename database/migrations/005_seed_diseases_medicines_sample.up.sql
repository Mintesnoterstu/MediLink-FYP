-- Sample rows aligned with frontend mock IDs (extend to full 30/20 from diseasesData.ts / medicinesData.ts)

INSERT INTO diseases (
  slug, name, name_am, category, description, description_am,
  symptoms, symptoms_am, causes, causes_am, prevention, prevention_am,
  treatment, treatment_am, severity, body_regions, prevalence
)
VALUES (
  'hyp1',
  'Hypertension',
  'የደም ግፊት',
  'chronic',
  'High blood pressure is a common condition often called the silent killer because it has no symptoms until serious complications occur.',
  'ከፍተኛ የደም ግፊት ብዙውን ጊዜ ድብቅ ገዳይ ተብሎ የሚጠራ የተለመደ በሽታ ነው።',
  ARRAY['No early symptoms', 'Severe headaches', 'Fatigue'],
  ARRAY['ቀደምት ምልክቶች የሉም', 'ከባድ ራስ ምታት', 'ድካም'],
  ARRAY['Family history', 'High salt intake', 'Obesity'],
  ARRAY['የቤተሰብ ታሪክ', 'ከፍተኛ የጨው አጠቃቀም', 'ከመጠን ያለፈ ውፍረት'],
  ARRAY['Reduce salt intake', 'Exercise 30 min daily'],
  ARRAY['የጨው አጠቃቀምን ይቀንሱ', 'በየቀኑ ለ30 ደቂቃ የአካል ብቃት እንቅስቃሴ ያድርጉ'],
  ARRAY['Lifestyle changes', 'Blood pressure medications', 'Regular monitoring'],
  ARRAY['የአኗኗር ዘይቤ ለውጦች', 'የደም ግፊት መድሀኒቶች', 'መደበኛ ክትትል'],
  'moderate',
  ARRAY['head', 'chest', 'heart', 'kidneys'],
  '{"region": "Jimma Zone", "prevalence": "high"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO medicines (
  slug, name, name_am, category, description, description_am,
  uses, uses_am, dosage, dosage_am, side_effects, contraindications, safety_warnings,
  requires_prescription, ministry_approved, scientific_evidence, preparation, preparation_am,
  indications, indications_am, contraindications_am, safety_warnings_am, medication_interactions,
  cultural_context, cultural_context_am
)
VALUES (
  'honey1',
  'Honey',
  'ማር',
  'traditional',
  'Natural honey is traditionally used for cough, sore throat, and wound healing.',
  'የተፈጥሮ ማር በባህላዊ መንገድ ለሳል፣ ለጉሮሮ ህመም እና ቁስል ፈውስ ያገለግላል።',
  ARRAY['Cough relief', 'Soothing throat'],
  ARRAY['የሳል ማስታገቻ', 'የጉሮሮ ማረጋገጫ'],
  '1-2 teaspoons, 2-3 times daily as needed',
  '1-2 የሻይ ማንኪያ፣ በቀን 2-3 ጊዜ እንደአስፈላጊነቱ',
  ARRAY[]::text[],
  ARRAY['Children under 1 year', 'Diabetes (use with caution)'],
  ARRAY['Never give to infants under 1 year (risk of botulism)'],
  false,
  true,
  'strong',
  'Take 1-2 teaspoons directly or mix with warm water or tea.',
  '1-2 የሻይ ማንኪያ በቀጥታ ይውሰዱ ወይም ከሞቀ ውሃ ወይም ሻይ ጋር ይቀላቅሉ።',
  ARRAY['Cough', 'Sore throat', 'Mild burns', 'Wounds'],
  ARRAY['ሳል', 'የጉሮሮ ህመም', 'ትንሽ ቃጠሎ', 'ቁስሎች'],
  ARRAY['ከ1 ዓመት በታች ለሆኑ ልጆች', 'የስኳር በሽታ (በጥንቃቄ ይጠቀሙ)'],
  ARRAY['ከ1 ዓመት በታች ለሆኑ ጨቅላዎች በጭራሽ አይስጡ (የቦቱሊዝም አደጋ)'],
  ARRAY[]::text[],
  'Used for generations in Ethiopian households for coughs and colds.',
  'ለሳል እና ለጉንፋን በኢትዮጵያ ቤተሰቦች ውስጥ ለትውልድ ሲያገለግል ቆይቷል።'
)
ON CONFLICT (slug) DO NOTHING;
