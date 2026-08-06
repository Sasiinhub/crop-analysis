
import { Language } from '../contexts/LanguageContext';

interface CropTranslation {
  en: string;
  ta: string;
}

// Database of common crops and their translations
// Keys are normalized (lowercase) for matching, but values are display-ready
const CROP_DB: CropTranslation[] = [
  { en: "Maize", ta: "மक्काச்சோளம்" },
  { en: "Banana", ta: "வாழை" },
  { en: "Banana(nantheram)", ta: "வாழை (நேந்திரன்)" },
  { en: "Cotton", ta: "பருத்தி" },
  { en: "Rice", ta: "அரிசி" },
  { en: "Paddy", ta: "நெல்" },
  { en: "Wheat", ta: "கோதுமை" },
  { en: "Sugarcane", ta: "கரும்பு" },
  { en: "Potato", ta: "உருளைக்கிழங்கு" },
  { en: "Tomato", ta: "தக்காளி" },
  { en: "Onion", ta: "வெங்காயம்" },
  { en: "Chilli", ta: "மிளகாய்" },
  { en: "Coconut", ta: "தேங்காய்" },
  { en: "Groundnut", ta: "வேர்க்கடலை" }, // Nilakkadalai
  { en: "Turmeric", ta: "மஞ்சள்" },
  { en: "Mango", ta: "மாம்பழம்" },
  { en: "Tapioca", ta: "மரவள்ளி" },
  { en: "Black Gram", ta: "உளுந்து" },
  { en: "Brinjal", ta: "கத்தரிக்காய்" },
  { en: "Sunflower", ta: "சூரியகாந்தி" },
  { en: "Pumpkin", ta: "பூசணி" },
  { en: "Gingelly", ta: "எள்" },
  { en: "Watermelon", ta: "தர்பூசணி" }
];

export const getTranslatedCropName = (originalName: string, targetLang: Language): string => {
  if (!originalName) return "";
  
  const normalizedInput = originalName.toLowerCase().trim();

  // 1. Try to find by English Key
  const matchEn = CROP_DB.find(crop => crop.en.toLowerCase() === normalizedInput);
  if (matchEn) {
    return matchEn[targetLang];
  }

  // 2. Try to find by Tamil Key (Reverse Lookup)
  const matchTa = CROP_DB.find(crop => crop.ta === normalizedInput);
  if (matchTa) {
    return matchTa[targetLang];
  }

  // Fallback: If no match, return original. 
  return originalName;
};
