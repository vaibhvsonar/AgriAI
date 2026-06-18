// AgriAI Knowledge Base – 38 PlantVillage Disease Classes

export const DISEASE_CLASSES = [
  { id: 0, name: 'Apple___Apple_scab', label: 'Apple Scab', crop: 'Apple', isHealthy: false },
  { id: 1, name: 'Apple___Black_rot', label: 'Apple Black Rot', crop: 'Apple', isHealthy: false },
  { id: 2, name: 'Apple___Cedar_apple_rust', label: 'Cedar Apple Rust', crop: 'Apple', isHealthy: false },
  { id: 3, name: 'Apple___healthy', label: 'Healthy', crop: 'Apple', isHealthy: true },
  { id: 4, name: 'Blueberry___healthy', label: 'Healthy', crop: 'Blueberry', isHealthy: true },
  { id: 5, name: 'Cherry___Powdery_mildew', label: 'Powdery Mildew', crop: 'Cherry', isHealthy: false },
  { id: 6, name: 'Cherry___healthy', label: 'Healthy', crop: 'Cherry', isHealthy: true },
  { id: 7, name: 'Corn___Cercospora_leaf_spot', label: 'Cercospora Leaf Spot', crop: 'Corn', isHealthy: false },
  { id: 8, name: 'Corn___Common_rust', label: 'Common Rust', crop: 'Corn', isHealthy: false },
  { id: 9, name: 'Corn___Northern_Leaf_Blight', label: 'Northern Leaf Blight', crop: 'Corn', isHealthy: false },
  { id: 10, name: 'Corn___healthy', label: 'Healthy', crop: 'Corn', isHealthy: true },
  { id: 11, name: 'Grape___Black_rot', label: 'Black Rot', crop: 'Grape', isHealthy: false },
  { id: 12, name: 'Grape___Esca', label: 'Esca (Black Measles)', crop: 'Grape', isHealthy: false },
  { id: 13, name: 'Grape___Leaf_blight', label: 'Leaf Blight', crop: 'Grape', isHealthy: false },
  { id: 14, name: 'Grape___healthy', label: 'Healthy', crop: 'Grape', isHealthy: true },
  { id: 15, name: 'Orange___Haunglongbing', label: 'Huanglongbing (Citrus Greening)', crop: 'Orange', isHealthy: false },
  { id: 16, name: 'Peach___Bacterial_spot', label: 'Bacterial Spot', crop: 'Peach', isHealthy: false },
  { id: 17, name: 'Peach___healthy', label: 'Healthy', crop: 'Peach', isHealthy: true },
  { id: 18, name: 'Pepper___Bacterial_spot', label: 'Bacterial Spot', crop: 'Pepper', isHealthy: false },
  { id: 19, name: 'Pepper___healthy', label: 'Healthy', crop: 'Pepper', isHealthy: true },
  { id: 20, name: 'Potato___Early_blight', label: 'Early Blight', crop: 'Potato', isHealthy: false },
  { id: 21, name: 'Potato___Late_blight', label: 'Late Blight', crop: 'Potato', isHealthy: false },
  { id: 22, name: 'Potato___healthy', label: 'Healthy', crop: 'Potato', isHealthy: true },
  { id: 23, name: 'Raspberry___healthy', label: 'Healthy', crop: 'Raspberry', isHealthy: true },
  { id: 24, name: 'Soybean___healthy', label: 'Healthy', crop: 'Soybean', isHealthy: true },
  { id: 25, name: 'Squash___Powdery_mildew', label: 'Powdery Mildew', crop: 'Squash', isHealthy: false },
  { id: 26, name: 'Strawberry___Leaf_scorch', label: 'Leaf Scorch', crop: 'Strawberry', isHealthy: false },
  { id: 27, name: 'Strawberry___healthy', label: 'Healthy', crop: 'Strawberry', isHealthy: true },
  { id: 28, name: 'Tomato___Bacterial_spot', label: 'Bacterial Spot', crop: 'Tomato', isHealthy: false },
  { id: 29, name: 'Tomato___Early_blight', label: 'Early Blight', crop: 'Tomato', isHealthy: false },
  { id: 30, name: 'Tomato___Late_blight', label: 'Late Blight', crop: 'Tomato', isHealthy: false },
  { id: 31, name: 'Tomato___Leaf_Mold', label: 'Leaf Mold', crop: 'Tomato', isHealthy: false },
  { id: 32, name: 'Tomato___Septoria_leaf_spot', label: 'Septoria Leaf Spot', crop: 'Tomato', isHealthy: false },
  { id: 33, name: 'Tomato___Spider_mites', label: 'Spider Mites (Two-spotted)', crop: 'Tomato', isHealthy: false },
  { id: 34, name: 'Tomato___Target_Spot', label: 'Target Spot', crop: 'Tomato', isHealthy: false },
  { id: 35, name: 'Tomato___Yellow_Leaf_Curl_Virus', label: 'Yellow Leaf Curl Virus', crop: 'Tomato', isHealthy: false },
  { id: 36, name: 'Tomato___mosaic_virus', label: 'Tomato Mosaic Virus', crop: 'Tomato', isHealthy: false },
  { id: 37, name: 'Tomato___healthy', label: 'Healthy', crop: 'Tomato', isHealthy: true },
]

export const DISEASE_KNOWLEDGE_BASE = {
  'Apple___Apple_scab': {
    severity: 'Moderate',
    symptoms: [
      'Olive-green or brown spots on leaves',
      'Velvety fungal growth on lower leaf surface',
      'Distorted, cracked fruit with scab lesions',
      'Early defoliation in severe cases',
    ],
    causes: 'Caused by the fungus Venturia inaequalis; spreads through wet, cool conditions in spring.',
    treatments: [
      'Apply fungicides (captan, mancozeb, or myclobutanil) at bud break',
      'Remove and destroy infected fallen leaves',
      'Ensure proper spacing for airflow',
      'Prune dense canopy to reduce moisture retention',
    ],
    prevention: [
      'Plant scab-resistant apple varieties',
      'Apply protective fungicide sprays in early spring',
      'Rake and compost or burn fallen leaves in autumn',
      'Maintain dry foliage through drip irrigation',
    ],
    economicImpact: 'Can reduce yield by 30–70% in severe outbreaks.',
  },
  'Tomato___Late_blight': {
    severity: 'Severe',
    symptoms: [
      'Water-soaked gray-green spots on older leaves',
      'White fungal growth on leaf undersides in humid conditions',
      'Brown-black stem lesions',
      'Rapid wilting and plant collapse',
      'Greasy brown patches on fruit',
    ],
    causes: 'Caused by Phytophthora infestans; thrives in cool, moist conditions (60–70°F).',
    treatments: [
      'Apply copper-based fungicides or chlorothalonil immediately',
      'Remove and destroy all infected plant material',
      'Avoid overhead irrigation',
      'Apply mancozeb preventatively',
    ],
    prevention: [
      'Use certified disease-free transplants',
      'Plant resistant varieties (e.g., Mountain Magic)',
      'Improve field drainage and air circulation',
      'Apply fungicides preventatively during wet weather',
    ],
    economicImpact: 'Historically devastated the Irish Potato Famine; can destroy 100% of crop within days.',
  },
  'Tomato___Early_blight': {
    severity: 'Moderate',
    symptoms: [
      'Dark brown spots with concentric rings (target-like) on older leaves',
      'Yellow halo surrounding lesions',
      'Severe defoliation starting from lower leaves',
      'Sunken dark lesions with concentric rings on fruit',
    ],
    causes: 'Caused by Alternaria solani; favored by warm temperatures (24–29°C) and high humidity.',
    treatments: [
      'Apply chlorothalonil, mancozeb, or copper fungicides',
      'Remove infected lower leaves promptly',
      'Stake plants to improve air circulation',
      'Ensure balanced fertilization',
    ],
    prevention: [
      'Rotate crops — avoid tomatoes in same field for 3+ years',
      'Mulch around plant bases to prevent soil splash',
      'Water at soil level in the morning',
      'Plant resistant varieties where available',
    ],
    economicImpact: 'Causes 20–30% yield loss annually in susceptible areas.',
  },
  'Corn___Common_rust': {
    severity: 'Moderate',
    symptoms: [
      'Small, circular to elongated cinnamon-brown pustules on both leaf surfaces',
      'Pustules rupture to release powdery rusty-red spores',
      'Yellowing leaves surrounding pustules',
      'Premature leaf death in severe cases',
    ],
    causes: 'Caused by Puccinia sorghi; spores spread by wind from southern regions.',
    treatments: [
      'Apply triazole fungicides (propiconazole, tebuconazole) at early stage',
      'Scout regularly, especially after rainy weather',
      'Remove heavily infected plant debris post-harvest',
    ],
    prevention: [
      'Plant rust-resistant hybrid corn varieties',
      'Ensure proper plant spacing for air circulation',
      'Monitor and apply fungicides preventatively in high-risk years',
    ],
    economicImpact: 'Yield losses of 10–40% in susceptible hybrids under severe pressure.',
  },
  'Potato___Late_blight': {
    severity: 'Severe',
    symptoms: [
      'Water-soaked pale greenish spots on leaf margins',
      'White mold growth on lower leaf surfaces',
      'Dark brown stem lesions',
      'Infected tubers show rusty-brown rot',
    ],
    causes: 'Caused by Phytophthora infestans; same pathogen that caused the Great Famine.',
    treatments: [
      'Apply metalaxyl + mancozeb, or cymoxanil-based fungicides',
      'Destroy infected crop residue immediately',
      'Stop irrigation if blight appears',
      'Hill up soil around plants to protect tubers',
    ],
    prevention: [
      'Use certified seed potatoes free from disease',
      'Plant resistant varieties (e.g., Sarpo Mira)',
      'Monitor weather using blight forecasting tools',
      'Apply preventative fungicide sprays in wet seasons',
    ],
    economicImpact: 'Causes billions in global crop losses annually.',
  },
}

// Fallback generic knowledge for classes not in the explicit KB
export const GENERIC_DISEASE_TEMPLATE = {
  severity: 'Moderate',
  symptoms: [
    'Discoloration or spots on leaf surface',
    'Unusual growth patterns or texture changes',
    'Wilting or abnormal leaf curling',
    'Reduced plant vigor and stunted growth',
  ],
  causes: 'Fungal, bacterial, or viral pathogen; spread through air, water, or soil contact.',
  treatments: [
    'Apply appropriate fungicide or bactericide based on disease type',
    'Remove and destroy infected plant material',
    'Improve air circulation through proper pruning',
    'Consult a local agricultural extension officer',
  ],
  prevention: [
    'Practice crop rotation to break disease cycles',
    'Use certified disease-free seeds and transplants',
    'Ensure proper drainage and avoid water stress',
    'Apply preventative sprays during high-risk periods',
  ],
  economicImpact: 'Variable impact; early detection significantly reduces crop losses.',
}

export function getDiseaseInfo(className) {
  const explicit = DISEASE_KNOWLEDGE_BASE[className]
  if (explicit) return explicit
  return GENERIC_DISEASE_TEMPLATE
}

export const STATS = [
  { value: 94, suffix: '%', label: 'Validation Accuracy', desc: 'CNN model on PlantVillage dataset' },
  { value: 38, suffix: '', label: 'Disease Classes', desc: 'Across 14 crop species' },
  { value: 54000, suffix: '+', label: 'Training Images', desc: 'High-quality leaf photographs' },
  { value: 2, suffix: 's', label: 'Inference Time', desc: 'Average per image prediction' },
]

export const CROPS = [
  'Tomato', 'Potato', 'Corn', 'Apple', 'Grape', 'Pepper',
  'Cherry', 'Peach', 'Strawberry', 'Squash', 'Soybean',
  'Raspberry', 'Blueberry', 'Orange',
]

export const TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    role: 'Tomato Farmer, Maharashtra',
    text: 'AgriAI identified late blight in my tomato crop within seconds. I applied treatment immediately and saved nearly 70% of my harvest. This tool is a lifesaver!',
    rating: 5,
    avatar: 'RK',
    crop: 'Tomato',
  },
  {
    name: 'Priya Sharma',
    role: 'Agricultural Extension Officer, Punjab',
    text: 'We use AgriAI during our field visits. The 94% accuracy is remarkable, and the treatment recommendations align with our best-practice guidelines perfectly.',
    rating: 5,
    avatar: 'PS',
    crop: 'Wheat',
  },
  {
    name: 'David Okafor',
    role: 'Corn Farmer, Nigeria',
    text: 'The platform is incredibly easy to use. I just take a photo of the leaf and get an instant diagnosis. The prevention tips have helped me plan better for next season.',
    rating: 5,
    avatar: 'DO',
    crop: 'Corn',
  },
]

export const DETECTION_HISTORY = [
  { id: 1, crop: 'Tomato', disease: 'Late Blight', confidence: 96.2, severity: 'Severe', date: '2026-06-17', status: 'Treated' },
  { id: 2, crop: 'Corn', disease: 'Common Rust', confidence: 91.7, severity: 'Moderate', date: '2026-06-15', status: 'Monitoring' },
  { id: 3, crop: 'Apple', disease: 'Apple Scab', confidence: 88.4, severity: 'Moderate', date: '2026-06-14', status: 'Treated' },
  { id: 4, crop: 'Potato', disease: 'Early Blight', confidence: 94.1, severity: 'Moderate', date: '2026-06-12', status: 'Treated' },
  { id: 5, crop: 'Tomato', disease: 'Healthy', confidence: 99.1, severity: '—', date: '2026-06-10', status: 'Healthy' },
  { id: 6, crop: 'Grape', disease: 'Black Rot', confidence: 85.3, severity: 'Severe', date: '2026-06-08', status: 'Treated' },
  { id: 7, crop: 'Cherry', disease: 'Powdery Mildew', confidence: 92.8, severity: 'Low', date: '2026-06-06', status: 'Treated' },
]

export const CHART_DATA_ACCURACY = [
  { week: 'W1', accuracy: 89 },
  { week: 'W2', accuracy: 91 },
  { week: 'W3', accuracy: 90 },
  { week: 'W4', accuracy: 93 },
  { week: 'W5', accuracy: 92 },
  { week: 'W6', accuracy: 94 },
  { week: 'W7', accuracy: 95 },
  { week: 'W8', accuracy: 94 },
]

export const CHART_DATA_DISEASES = [
  { name: 'Late Blight', value: 28, color: '#e63946' },
  { name: 'Early Blight', value: 22, color: '#f4a261' },
  { name: 'Common Rust', value: 16, color: '#ffd166' },
  { name: 'Bacterial Spot', value: 14, color: '#4cc9f0' },
  { name: 'Healthy', value: 12, color: '#52b788' },
  { name: 'Other', value: 8, color: '#6b8f76' },
]

export const PIPELINE_STEPS = [
  { id: 1, icon: '📸', label: 'Image Upload', desc: 'Farmer uploads leaf photo via web or mobile' },
  { id: 2, icon: '⚙️', label: 'FastAPI Backend', desc: 'Secure REST API processes the request' },
  { id: 3, icon: '🔬', label: 'Disease Detection Agent', desc: 'Agent routes image to CNN model' },
  { id: 4, icon: '🧠', label: 'CNN Model (.keras)', desc: 'Deep learning model analyzes 38 disease classes' },
  { id: 5, icon: '📊', label: 'Disease Prediction', desc: 'Confidence scores & class probabilities returned' },
  { id: 6, icon: '💡', label: 'Recommendation Agent', desc: 'AI agent queries knowledge base' },
  { id: 7, icon: '📚', label: 'Knowledge Base (JSON)', desc: 'Disease-specific treatment database' },
  { id: 8, icon: '💊', label: 'Treatment & Prevention', desc: 'Actionable guidance delivered to farmer' },
]
