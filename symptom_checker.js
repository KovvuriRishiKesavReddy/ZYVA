// Symptom Checker JavaScript

// Symptom databases
const primarySymptoms = [
    { id: 'headache', name: 'Headache', category: 'neurological', severity: ['mild', 'moderate', 'severe'] },
    { id: 'fever', name: 'Fever/High Temperature', category: 'general', severity: ['mild', 'moderate', 'severe'] },
    { id: 'cough', name: 'Cough', category: 'respiratory', severity: ['mild', 'moderate', 'severe'] },
    { id: 'sore_throat', name: 'Sore Throat', category: 'respiratory', severity: ['mild', 'moderate', 'severe'] },
    { id: 'runny_nose', name: 'Runny/Stuffy Nose', category: 'respiratory', severity: ['mild', 'moderate'] },
    { id: 'body_aches', name: 'Body Aches/Muscle Pain', category: 'musculoskeletal', severity: ['mild', 'moderate', 'severe'] },
    { id: 'fatigue', name: 'Fatigue/Weakness', category: 'general', severity: ['mild', 'moderate', 'severe'] },
    { id: 'nausea', name: 'Nausea', category: 'gastrointestinal', severity: ['mild', 'moderate', 'severe'] },
    { id: 'vomiting', name: 'Vomiting', category: 'gastrointestinal', severity: ['moderate', 'severe'] },
    { id: 'diarrhea', name: 'Diarrhea', category: 'gastrointestinal', severity: ['mild', 'moderate', 'severe'] },
    { id: 'stomach_pain', name: 'Stomach/Abdominal Pain', category: 'gastrointestinal', severity: ['mild', 'moderate', 'severe'] },
    { id: 'back_pain', name: 'Back Pain', category: 'musculoskeletal', severity: ['mild', 'moderate', 'severe'] },
    { id: 'joint_pain', name: 'Joint Pain', category: 'musculoskeletal', severity: ['mild', 'moderate', 'severe'] },
    { id: 'chest_pain', name: 'Chest Pain', category: 'cardiovascular', severity: ['moderate', 'severe', 'emergency'] },
    { id: 'shortness_breath', name: 'Shortness of Breath', category: 'respiratory', severity: ['moderate', 'severe', 'emergency'] },
    { id: 'dizziness', name: 'Dizziness/Lightheadedness', category: 'neurological', severity: ['mild', 'moderate', 'severe'] },
    { id: 'rash', name: 'Skin Rash/Irritation', category: 'dermatological', severity: ['mild', 'moderate', 'severe'] },
    { id: 'swelling', name: 'Swelling (face, hands, feet)', category: 'general', severity: ['mild', 'moderate', 'severe'] },
    { id: 'constipation', name: 'Constipation', category: 'gastrointestinal', severity: ['mild', 'moderate'] },
    { id: 'sleep_problems', name: 'Sleep Problems/Insomnia', category: 'neurological', severity: ['mild', 'moderate', 'severe'] }
];

const additionalSymptoms = [
    { id: 'loss_appetite', name: 'Loss of Appetite', category: 'general' },
    { id: 'weight_loss', name: 'Unexplained Weight Loss', category: 'general' },
    { id: 'weight_gain', name: 'Unexplained Weight Gain', category: 'general' },
    { id: 'night_sweats', name: 'Night Sweats', category: 'general' },
    { id: 'chills', name: 'Chills', category: 'general' },
    { id: 'frequent_urination', name: 'Frequent Urination', category: 'urological' },
    { id: 'painful_urination', name: 'Painful Urination', category: 'urological' },
    { id: 'blood_urine', name: 'Blood in Urine', category: 'urological' },
    { id: 'memory_problems', name: 'Memory Problems/Confusion', category: 'neurological' },
    { id: 'mood_changes', name: 'Mood Changes/Depression', category: 'psychological' },
    { id: 'anxiety', name: 'Anxiety/Panic Attacks', category: 'psychological' },
    { id: 'vision_changes', name: 'Vision Changes/Blurred Vision', category: 'ophthalmological' },
    { id: 'hearing_problems', name: 'Hearing Problems/Ringing in Ears', category: 'otolaryngological' },
    { id: 'hair_loss', name: 'Hair Loss', category: 'dermatological' },
    { id: 'brittle_nails', name: 'Brittle/Weak Nails', category: 'dermatological' },
    { id: 'cold_hands_feet', name: 'Cold Hands/Feet', category: 'cardiovascular' },
    { id: 'irregular_heartbeat', name: 'Irregular Heartbeat/Palpitations', category: 'cardiovascular' },
    { id: 'leg_cramps', name: 'Leg Cramps', category: 'musculoskeletal' },
    { id: 'tingling_numbness', name: 'Tingling/Numbness in Extremities', category: 'neurological' },
    { id: 'dry_mouth', name: 'Dry Mouth', category: 'general' }
];

const chronicConditions = [
    'Diabetes', 'Hypertension (High Blood Pressure)', 'Heart Disease', 'Asthma', 'COPD',
    'Arthritis', 'Thyroid Disorders', 'Kidney Disease', 'Liver Disease', 'Depression',
    'Anxiety Disorders', 'Allergies', 'Migraine', 'Chronic Pain', 'Autoimmune Disorders'
];

// Complete Disease database
const diseaseDatabase = {
    'common_cold': {
        name: 'Common Cold',
        symptoms: ['runny_nose', 'sore_throat', 'cough', 'headache', 'fatigue'],
        severity: 'low',
        description: 'A viral infection of the upper respiratory tract',
        homeRemedies: [
            'Rest and get plenty of sleep',
            'Drink warm liquids like tea with honey',
            'Use a humidifier or breathe steam',
            'Gargle with salt water for sore throat',
            'Take vitamin C supplements'
        ],
        diet: [
            'Increase fluid intake (water, herbal teas, broths)',
            'Eat citrus fruits rich in vitamin C',
            'Include ginger and garlic in meals',
            'Avoid dairy if it increases mucus production',
            'Consume warm soups and broths'
        ],
        medications: [
            'Acetaminophen or ibuprofen for aches and fever',
            'Decongestant nasal sprays (short-term use)',
            'Cough drops or throat lozenges',
            'Antihistamines for runny nose'
        ],
        doctorRequired: false,
        urgency: 'low'
    },
    'flu': {
        name: 'Influenza (Flu)',
        symptoms: ['fever', 'body_aches', 'fatigue', 'cough', 'headache', 'chills'],
        severity: 'medium',
        description: 'A viral infection that attacks the respiratory system',
        homeRemedies: [
            'Complete bed rest for 24-48 hours after fever breaks',
            'Stay hydrated with water, herbal teas, and clear broths',
            'Use a cool-mist humidifier',
            'Apply warm compresses to aching muscles',
            'Take lukewarm baths to reduce fever'
        ],
        diet: [
            'Eat light, easily digestible foods',
            'Include antioxidant-rich foods like berries',
            'Consume zinc-rich foods (nuts, seeds)',
            'Avoid alcohol and caffeine',
            'Eat probiotic foods to support immunity'
        ],
        medications: [
            'Antiviral medications (if started within 48 hours)',
            'Acetaminophen or ibuprofen for fever and aches',
            'Cough suppressants for dry cough',
            'Expectorants for productive cough'
        ],
        doctorRequired: true,
        urgency: 'medium',
        doctorReason: 'May need antiviral medication and monitoring for complications'
    },
    'gastroenteritis': {
        name: 'Gastroenteritis (Stomach Flu)',
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach_pain', 'fever', 'body_aches'],
        severity: 'medium',
        description: 'Inflammation of the stomach and intestines, usually caused by infection',
        homeRemedies: [
            'Rest and avoid solid foods initially',
            'Stay hydrated with small, frequent sips of water',
            'Try the BRAT diet (Bananas, Rice, Applesauce, Toast)',
            'Use oral rehydration solutions',
            'Apply heat pad to stomach for cramps'
        ],
        diet: [
            'Start with clear liquids (water, clear broths)',
            'Progress to BRAT diet when tolerated',
            'Avoid dairy, fatty, and spicy foods',
            'Include probiotics once symptoms improve',
            'Eat small, frequent meals'
        ],
        medications: [
            'Oral rehydration salts for dehydration',
            'Loperamide for diarrhea (if no fever)',
            'Acetaminophen for pain (avoid NSAIDs)',
            'Probiotics to restore gut flora'
        ],
        doctorRequired: true,
        urgency: 'medium',
        doctorReason: 'Need to rule out bacterial infection and monitor for dehydration'
    },
    'tension_headache': {
        name: 'Tension Headache',
        symptoms: ['headache', 'fatigue', 'sleep_problems'],
        severity: 'low',
        description: 'The most common type of headache, often stress-related',
        homeRemedies: [
            'Apply cold or warm compress to head/neck',
            'Practice relaxation techniques and deep breathing',
            'Gently massage temples and neck',
            'Take a warm bath or shower',
            'Ensure adequate sleep (7-9 hours)'
        ],
        diet: [
            'Stay well-hydrated throughout the day',
            'Limit caffeine and alcohol',
            'Eat regular meals to maintain blood sugar',
            'Include magnesium-rich foods (nuts, leafy greens)',
            'Avoid foods that trigger headaches'
        ],
        medications: [
            'Over-the-counter pain relievers (acetaminophen, ibuprofen)',
            'Aspirin (if no contraindications)',
            'Topical pain relief creams',
            'Magnesium supplements'
        ],
        doctorRequired: false,
        urgency: 'low'
    },
    'migraine': {
        name: 'Migraine',
        symptoms: ['headache', 'nausea', 'dizziness', 'vision_changes'],
        severity: 'high',
        description: 'A severe headache disorder with recurring episodes',
        homeRemedies: [
            'Rest in a quiet, dark room',
            'Apply ice pack to forehead or neck',
            'Practice stress management techniques',
            'Maintain regular sleep schedule',
            'Stay hydrated'
        ],
        diet: [
            'Identify and avoid trigger foods',
            'Maintain regular meal times',
            'Limit processed foods and additives',
            'Include riboflavin (B2) rich foods',
            'Consider magnesium supplements'
        ],
        medications: [
            'Triptans for acute episodes',
            'NSAIDs for pain relief',
            'Anti-nausea medications',
            'Preventive medications for frequent migraines'
        ],
        doctorRequired: true,
        urgency: 'high',
        doctorReason: 'Requires proper diagnosis and prescription medications for effective treatment'
    },
    'hypertension_symptoms': {
        name: 'High Blood Pressure Symptoms',
        symptoms: ['headache', 'dizziness', 'chest_pain', 'shortness_breath'],
        severity: 'high',
        description: 'Symptoms that may indicate elevated blood pressure',
        homeRemedies: [
            'Practice deep breathing exercises',
            'Engage in regular moderate exercise',
            'Reduce sodium intake immediately',
            'Practice stress reduction techniques',
            'Monitor blood pressure regularly'
        ],
        diet: [
            'Follow DASH diet (low sodium, high potassium)',
            'Increase fruits and vegetables',
            'Choose whole grains over refined',
            'Limit processed and packaged foods',
            'Include potassium-rich foods (bananas, spinach)'
        ],
        medications: [
            'Monitor blood pressure regularly',
            'Continue prescribed blood pressure medications',
            'Avoid NSAIDs which can raise BP',
            'Consider natural supplements (with doctor approval)'
        ],
        doctorRequired: true,
        urgency: 'high',
        doctorReason: 'High blood pressure requires immediate medical evaluation and monitoring'
    },
    'anxiety_symptoms': {
        name: 'Anxiety Disorder',
        symptoms: ['anxiety', 'sleep_problems', 'fatigue', 'mood_changes', 'dizziness'],
        severity: 'medium',
        description: 'Excessive worry or fear that interferes with daily activities',
        homeRemedies: [
            'Practice mindfulness and meditation',
            'Deep breathing exercises (4-7-8 technique)',
            'Regular physical exercise',
            'Limit caffeine and alcohol',
            'Maintain consistent sleep schedule'
        ],
        diet: [
            'Include omega-3 rich foods (fish, walnuts)',
            'Eat magnesium-rich foods for relaxation',
            'Limit sugar and processed foods',
            'Include complex carbohydrates',
            'Consider herbal teas (chamomile, passionflower)'
        ],
        medications: [
            'Natural supplements (magnesium, B-complex)',
            'Herbal remedies (valerian, ashwagandha)',
            'Avoid stimulants and energy drinks',
            'Consider melatonin for sleep (with doctor approval)'
        ],
        doctorRequired: true,
        urgency: 'medium',
        doctorReason: 'Professional evaluation needed to rule out other conditions and provide appropriate treatment'
    },
    'bacterial_infection': {
        name: 'Bacterial Infection',
        symptoms: ['fever', 'body_aches', 'fatigue', 'swelling'],
        severity: 'high',
        description: 'Infection caused by bacteria requiring medical treatment',
        homeRemedies: [
            'Rest and avoid strenuous activities',
            'Stay well-hydrated',
            'Apply warm compresses to affected areas',
            'Practice good hygiene to prevent spread',
            'Monitor temperature regularly'
        ],
        diet: [
            'Eat nutrient-dense foods to support immune system',
            'Include probiotic foods to support gut health',
            'Stay well-hydrated with water and clear broths',
            'Avoid alcohol and processed foods',
            'Include anti-inflammatory foods'
        ],
        medications: [
            'Antibiotics (prescription required)',
            'Acetaminophen or ibuprofen for fever and pain',
            'Probiotics during and after antibiotic treatment',
            'Topical antiseptics for skin infections'
        ],
        doctorRequired: true,
        urgency: 'high',
        doctorReason: 'Bacterial infections require antibiotic treatment to prevent complications'
    },
    'allergic_reaction': {
        name: 'Allergic Reaction',
        symptoms: ['rash', 'swelling', 'runny_nose', 'cough', 'shortness_breath'],
        severity: 'medium',
        description: 'Immune system reaction to allergens',
        homeRemedies: [
            'Remove or avoid the allergen immediately',
            'Cool compress on affected skin areas',
            'Cool bath with oatmeal or baking soda',
            'Keep fingernails short to avoid scratching',
            'Wear loose, breathable clothing'
        ],
        diet: [
            'Avoid known food allergens',
            'Include anti-inflammatory foods',
            'Stay hydrated to help flush allergens',
            'Consider natural antihistamines (quercetin)',
            'Avoid processed foods during reaction'
        ],
        medications: [
            'Antihistamines (loratadine, cetirizine)',
            'Topical corticosteroids for skin reactions',
            'Epinephrine auto-injector for severe reactions',
            'Calamine lotion for itching'
        ],
        doctorRequired: true,
        urgency: 'medium',
        doctorReason: 'Allergic reactions can worsen and may require prescription medications or allergy testing'
    },
    'dehydration': {
        name: 'Dehydration',
        symptoms: ['dizziness', 'fatigue', 'dry_mouth', 'headache'],
        severity: 'medium',
        description: 'Excessive loss of body water and electrolytes',
        homeRemedies: [
            'Drink water in small, frequent amounts',
            'Use oral rehydration solutions',
            'Rest in a cool environment',
            'Avoid alcohol and caffeine',
            'Suck on ice chips if nauseous'
        ],
        diet: [
            'Consume water-rich foods (watermelon, cucumber)',
            'Include electrolyte-rich foods (bananas, coconut water)',
            'Avoid salty and sugary foods initially',
            'Eat light, easily digestible foods',
            'Include natural electrolyte drinks'
        ],
        medications: [
            'Oral rehydration salts',
            'Electrolyte replacement drinks',
            'IV fluids for severe cases',
            'Anti-nausea medication if needed'
        ],
        doctorRequired: false,
        urgency: 'medium',
        doctorReason: 'Severe dehydration may require medical intervention'
    }
};

// Analysis mode state
let currentMode = 'basic';
let analysisResults = null;

// Initialize the symptom checker
document.addEventListener('DOMContentLoaded', function() {
    initializeSymptomChecker();
    setupEventListeners();
});

function initializeSymptomChecker() {
    populateSymptoms();
    populateChronicConditions();
}

function setupEventListeners() {
    // Mode toggle buttons
    document.getElementById('basic-mode-btn').addEventListener('click', () => toggleMode('basic'));
    document.getElementById('detailed-mode-btn').addEventListener('click', () => toggleMode('detailed'));
    
    // Form submission
    document.getElementById('symptom-form').addEventListener('submit', handleFormSubmission);
    
    // Save assessment
    document.getElementById('save-assessment').addEventListener('click', saveAssessment);
    
    // User menu toggle
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenu = document.getElementById('userMenu');
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', function() {
            userMenu.classList.toggle('hidden');
        });
    }
}

function toggleMode(mode) {
    currentMode = mode;
    
    // Update button styles
    const basicBtn = document.getElementById('basic-mode-btn');
    const detailedBtn = document.getElementById('detailed-mode-btn');
    const basicNotification = document.getElementById('basic-notification');
    const detailedNotification = document.getElementById('detailed-notification');
    
    if (mode === 'basic') {
        basicBtn.className = 'px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md transform scale-105';
        detailedBtn.className = 'px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-white/50';
        basicNotification.classList.remove('hidden');
        detailedNotification.classList.add('hidden');
        
        // Hide detailed sections
        document.getElementById('additional-symptoms-section').classList.add('hidden');
        document.getElementById('medical-history-section').classList.add('hidden');
        document.getElementById('lifestyle-section').classList.add('hidden');
    } else {
        detailedBtn.className = 'px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md transform scale-105';
        basicBtn.className = 'px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-white/50';
        detailedNotification.classList.remove('hidden');
        basicNotification.classList.add('hidden');
        
        // Show detailed sections
        document.getElementById('additional-symptoms-section').classList.remove('hidden');
        document.getElementById('medical-history-section').classList.remove('hidden');
        document.getElementById('lifestyle-section').classList.remove('hidden');
    }
}

function populateSymptoms() {
    // Populate primary symptoms
    const primaryContainer = document.getElementById('primary-symptoms');
    primarySymptoms.forEach(symptom => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <input type="checkbox" id="primary-${symptom.id}" name="primary-symptoms" value="${symptom.id}" 
                   class="symptom-checkbox mr-3">
            <label for="primary-${symptom.id}" class="text-sm text-gray-700 cursor-pointer">${symptom.name}</label>
        `;
        primaryContainer.appendChild(div);
    });
    
    // Populate additional symptoms
    const additionalContainer = document.getElementById('additional-symptoms');
    additionalSymptoms.forEach(symptom => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <input type="checkbox" id="additional-${symptom.id}" name="additional-symptoms" value="${symptom.id}" 
                   class="symptom-checkbox mr-3">
            <label for="additional-${symptom.id}" class="text-sm text-gray-700 cursor-pointer">${symptom.name}</label>
        `;
        additionalContainer.appendChild(div);
    });
}

function populateChronicConditions() {
    const container = document.getElementById('chronic-conditions');
    chronicConditions.forEach(condition => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        const conditionId = condition.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
        div.innerHTML = `
            <input type="checkbox" id="chronic-${conditionId}" name="chronic-conditions" value="${condition}" 
                   class="symptom-checkbox mr-3">
            <label for="chronic-${conditionId}" class="text-sm text-gray-700 cursor-pointer">${condition}</label>
        `;
        container.appendChild(div);
    });
}

function handleFormSubmission(event) {
    event.preventDefault();
    
    // Collect form data
    const formData = collectFormData();
    
    // Validate required fields
    if (!validateForm(formData)) {
        return;
    }
    
    // Analyze symptoms
    analysisResults = analyzeSymptoms(formData);
    
    // Display results
    displayResults(analysisResults);
    
    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

function collectFormData() {
    const formData = {
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        weight: document.getElementById('weight').value,
        height: document.getElementById('height').value,
        primarySymptoms: Array.from(document.querySelectorAll('input[name="primary-symptoms"]:checked')).map(cb => cb.value),
        additionalSymptoms: currentMode === 'detailed' ? 
            Array.from(document.querySelectorAll('input[name="additional-symptoms"]:checked')).map(cb => cb.value) : [],
        duration: document.getElementById('symptom-duration').value,
        severity: document.getElementById('overall-severity').value,
        description: document.getElementById('symptom-description').value,
        chronicConditions: currentMode === 'detailed' ? 
            Array.from(document.querySelectorAll('input[name="chronic-conditions"]:checked')).map(cb => cb.value) : [],
        currentMedications: currentMode === 'detailed' ? document.getElementById('current-medications').value : '',
        allergies: currentMode === 'detailed' ? document.getElementById('allergies').value : '',
        sleepQuality: currentMode === 'detailed' ? document.getElementById('sleep-quality').value : '',
        stressLevel: currentMode === 'detailed' ? document.getElementById('stress-level').value : '',
        exerciseFrequency: currentMode === 'detailed' ? document.getElementById('exercise-frequency').value : '',
        habits: currentMode === 'detailed' ? document.getElementById('habits').value : '',
        mode: currentMode
    };
    
    return formData;
}

function validateForm(formData) {
    const errors = [];
    
    if (!formData.age) errors.push('Age is required');
    if (!formData.gender) errors.push('Gender is required');
    if (formData.primarySymptoms.length === 0) errors.push('Please select at least one primary symptom');
    if (!formData.duration) errors.push('Symptom duration is required');
    if (!formData.severity) errors.push('Symptom severity is required');
    
    if (errors.length > 0) {
        alert('Please fill in all required fields:\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

function analyzeSymptoms(formData) {
    const allSymptoms = [...formData.primarySymptoms, ...formData.additionalSymptoms];
    const possibleConditions = [];
    
    // Score each disease based on symptom matches
    Object.keys(diseaseDatabase).forEach(diseaseKey => {
        const disease = diseaseDatabase[diseaseKey];
        let matchScore = 0;
        let totalSymptoms = disease.symptoms.length;
        
        disease.symptoms.forEach(symptom => {
            if (allSymptoms.includes(symptom)) {
                matchScore++;
            }
        });
        
        const confidence = (matchScore / totalSymptoms) * 100;
        
        if (confidence >= 30) { // Only include if at least 30% match
            possibleConditions.push({
                ...disease,
                confidence: Math.round(confidence),
                matchedSymptoms: disease.symptoms.filter(s => allSymptoms.includes(s))
            });
        }
    });
    
    // Sort by confidence
    possibleConditions.sort((a, b) => b.confidence - a.confidence);
    
    // Determine overall severity
    const overallSeverity = determineOverallSeverity(formData, possibleConditions);
    
    // Check for emergency conditions
    const emergencySymptoms = ['chest_pain', 'shortness_breath'];
    const hasEmergencySymptoms = allSymptoms.some(s => emergencySymptoms.includes(s)) || 
                                formData.severity === 'emergency';
    
    return {
        formData,
        possibleConditions: possibleConditions.slice(0, 5), // Top 5 matches
        overallSeverity,
        hasEmergencySymptoms,
        recommendations: generateRecommendations(formData, possibleConditions, overallSeverity)
    };
}

function determineOverallSeverity(formData, possibleConditions) {
    const severityMap = { mild: 1, moderate: 2, severe: 3, emergency: 4 };
    let maxSeverity = severityMap[formData.severity] || 1;
    
    // Check disease severities
    possibleConditions.forEach(condition => {
        const conditionSeverity = condition.severity === 'low' ? 1 : 
                                condition.severity === 'medium' ? 2 : 
                                condition.severity === 'high' ? 3 : 1;
        maxSeverity = Math.max(maxSeverity, conditionSeverity);
    });
    
    // Check for high-risk symptoms
    const highRiskSymptoms = ['chest_pain', 'shortness_breath', 'severe_headache'];
    if (formData.primarySymptoms.some(s => highRiskSymptoms.includes(s))) {
        maxSeverity = Math.max(maxSeverity, 3);
    }
    
    return maxSeverity === 1 ? 'low' : maxSeverity === 2 ? 'medium' : 'high';
}

function generateRecommendations(formData, possibleConditions, severity) {
    const recommendations = {
        immediate: [],
        homeRemedies: [],
        diet: [],
        medications: [],
        lifestyle: [],
        doctorRequired: false,
        urgency: severity
    };
    
    if (severity === 'high' || formData.severity === 'emergency') {
        recommendations.immediate.push('Seek immediate medical attention');
        recommendations.immediate.push('Monitor symptoms closely');
        recommendations.doctorRequired = true;
        
        if (formData.primarySymptoms.includes('chest_pain')) {
            recommendations.immediate.push('Call emergency services (911/108) if chest pain worsens');
        }
        
        if (formData.primarySymptoms.includes('shortness_breath')) {
            recommendations.immediate.push('Sit upright and try to remain calm');
            recommendations.immediate.push('If breathing difficulty persists, call emergency services');
        }
    }
    
    // Aggregate recommendations from possible conditions
    if (possibleConditions.length > 0) {
        const topCondition = possibleConditions[0];
        
        recommendations.homeRemedies = topCondition.homeRemedies || [];
        recommendations.diet = topCondition.diet || [];
        recommendations.medications = topCondition.medications || [];
        
        if (topCondition.doctorRequired) {
            recommendations.doctorRequired = true;
        }
    }
    
    // Add general recommendations based on symptoms
    addGeneralRecommendations(formData, recommendations);
    
    return recommendations;
}

function addGeneralRecommendations(formData, recommendations) {
    // Fever recommendations
    if (formData.primarySymptoms.includes('fever')) {
        recommendations.homeRemedies.push('Stay hydrated with water and clear fluids');
        recommendations.homeRemedies.push('Rest in a cool, comfortable environment');
        recommendations.medications.push('Acetaminophen or ibuprofen to reduce fever');
    }
    
    // Respiratory symptoms
    if (formData.primarySymptoms.includes('cough') || formData.primarySymptoms.includes('sore_throat')) {
        recommendations.homeRemedies.push('Gargle with warm salt water');
        recommendations.homeRemedies.push('Use a humidifier or breathe steam');
        recommendations.diet.push('Drink warm liquids like tea with honey');
    }
    
    // Gastrointestinal symptoms
    if (formData.primarySymptoms.includes('nausea') || formData.primarySymptoms.includes('vomiting')) {
        recommendations.homeRemedies.push('Eat small, frequent meals');
        recommendations.homeRemedies.push('Try ginger tea or ginger supplements');
        recommendations.diet.push('Follow BRAT diet (Bananas, Rice, Applesauce, Toast)');
    }
    
    // Pain symptoms
    if (formData.primarySymptoms.includes('headache') || formData.primarySymptoms.includes('body_aches')) {
        recommendations.homeRemedies.push('Apply cold or warm compress to affected areas');
        recommendations.homeRemedies.push('Get adequate rest and sleep');
        recommendations.medications.push('Over-the-counter pain relievers as needed');
    }
    
    // General wellness recommendations
    recommendations.lifestyle = [
        'Maintain regular sleep schedule (7-9 hours per night)',
        'Stay hydrated throughout the day',
        'Eat a balanced, nutritious diet',
        'Manage stress through relaxation techniques',
        'Avoid alcohol and smoking during illness'
    ];
    
    // Age-specific recommendations
    const age = parseInt(formData.age);
    if (age > 65) {
        recommendations.immediate.push('Consider consulting a healthcare provider due to age-related risks');
        recommendations.doctorRequired = true;
    }
    
    if (age < 18) {
        recommendations.immediate.push('Consult with a pediatrician or family doctor');
        recommendations.doctorRequired = true;
    }
}

function displayResults(results) {
    // Show results section
    document.getElementById('results-section').classList.remove('hidden');
    
    // Display overall assessment
    displayOverallAssessment(results);
    
    // Display possible conditions
    displayPossibleConditions(results.possibleConditions);
    
    // Display recommendations
    displayRecommendations(results.recommendations);
    
    // Show/hide action buttons based on recommendations
    updateActionButtons(results);
}

function displayOverallAssessment(results) {
    const { overallSeverity, hasEmergencySymptoms, possibleConditions } = results;
    
    const assessmentIcon = document.getElementById('assessment-icon');
    const assessmentTitle = document.getElementById('assessment-title');
    const assessmentDescription = document.getElementById('assessment-description');
    const summaryContainer = document.getElementById('assessment-summary');
    
    // Set icon and colors based on severity
    let iconHTML, titleText, descriptionText, iconClass;
    
    if (hasEmergencySymptoms) {
        iconClass = 'bg-red-100 text-red-600';
        iconHTML = `
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
        `;
        titleText = 'Urgent Medical Attention Required';
        descriptionText = 'Your symptoms indicate a potentially serious condition that requires immediate medical evaluation.';
    } else if (overallSeverity === 'high') {
        iconClass = 'bg-orange-100 text-orange-600';
        iconHTML = `
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        `;
        titleText = 'Medical Consultation Recommended';
        descriptionText = 'Your symptoms suggest a condition that would benefit from professional medical evaluation.';
    } else if (overallSeverity === 'medium') {
        iconClass = 'bg-yellow-100 text-yellow-600';
        iconHTML = `
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        `;
        titleText = 'Monitor Symptoms Closely';
        descriptionText = 'Your symptoms are moderate and should be monitored. Consider consulting a healthcare provider if they worsen.';
    } else {
        iconClass = 'bg-green-100 text-green-600';
        iconHTML = `
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        `;
        titleText = 'Mild Symptoms Detected';
        descriptionText = 'Your symptoms appear to be mild and may resolve with home care and rest.';
    }
    
    assessmentIcon.className = `mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconClass}`;
    assessmentIcon.innerHTML = iconHTML;
    assessmentTitle.textContent = titleText;
    assessmentDescription.textContent = descriptionText;
    
    // Create summary cards
    summaryContainer.innerHTML = '';
    
    const summaryData = [
        {
            title: 'Symptom Count',
            value: results.formData.primarySymptoms.length + results.formData.additionalSymptoms.length,
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                   </svg>`
        },
        {
            title: 'Severity Level',
            value: results.formData.severity.charAt(0).toUpperCase() + results.formData.severity.slice(1),
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                   </svg>`
        },
        {
            title: 'Duration',
            value: results.formData.duration.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                   </svg>`
        }
    ];
    
    summaryData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white bg-opacity-60 rounded-lg p-4 text-center';
        card.innerHTML = `
            <div class="text-purple-600 mb-2">${item.icon}</div>
            <div class="text-2xl font-bold text-gray-800 mb-1">${item.value}</div>
            <div class="text-sm text-gray-600">${item.title}</div>
        `;
        summaryContainer.appendChild(card);
    });
}

function displayPossibleConditions(conditions) {
    const container = document.getElementById('conditions-content');
    
    if (conditions.length === 0) {
        container.innerHTML = `
            <div class="text-gray-600">
                <p>Based on your symptoms, we couldn't identify specific conditions with high confidence. 
                This could indicate:</p>
                <ul class="mt-2 list-disc list-inside space-y-1">
                    <li>Your symptoms may be too general or early-stage</li>
                    <li>Multiple minor conditions</li>
                    <li>A condition not in our database</li>
                </ul>
                <p class="mt-2 text-sm font-medium">Consider consulting a healthcare provider for proper evaluation.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    conditions.forEach((condition, index) => {
        const conditionDiv = document.createElement('div');
        const severityClass = condition.severity === 'low' ? 'low-severity' : 
                            condition.severity === 'medium' ? 'medium-severity' : 'high-severity';
        
        conditionDiv.className = `mb-4 p-4 rounded-lg border-l-4 ${severityClass} bg-gray-50`;
        conditionDiv.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-semibold text-gray-800">${condition.name}</h4>
                <span class="text-sm font-medium text-purple-600">${condition.confidence}% match</span>
            </div>
            <p class="text-sm text-gray-600 mb-3">${condition.description}</p>
            <div class="text-xs text-gray-500">
                Matched symptoms: ${condition.matchedSymptoms.map(s => 
                    primarySymptoms.concat(additionalSymptoms).find(sym => sym.id === s)?.name || s
                ).join(', ')}
            </div>
        `;
        
        container.appendChild(conditionDiv);
    });
}

function displayRecommendations(recommendations) {
    // Immediate Actions
    const actionsContainer = document.getElementById('actions-content');
    if (recommendations.immediate.length > 0) {
        actionsContainer.innerHTML = `
            <ul class="space-y-2">
                ${recommendations.immediate.map(action => `
                    <li class="flex items-start">
                        <svg class="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        <span class="text-sm text-gray-700">${action}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        actionsContainer.innerHTML = `
            <div class="text-gray-600">
                <p class="text-sm">Continue monitoring your symptoms and follow the home care recommendations below.</p>
            </div>
        `;
    }
    
    // Home Remedies
    const remediesContainer = document.getElementById('remedies-content');
    if (recommendations.homeRemedies.length > 0) {
        remediesContainer.innerHTML = `
            <ul class="space-y-2">
                ${recommendations.homeRemedies.slice(0, 6).map(remedy => `
                    <li class="flex items-start">
                        <svg class="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span class="text-sm text-gray-700">${remedy}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        remediesContainer.innerHTML = `<p class="text-sm text-gray-600">No specific home remedies recommended at this time.</p>`;
    }
    
    // Diet Recommendations
    const dietContainer = document.getElementById('diet-content');
    if (recommendations.diet.length > 0) {
        dietContainer.innerHTML = `
            <ul class="space-y-2">
                ${recommendations.diet.slice(0, 6).map(dietTip => `
                    <li class="flex items-start">
                        <svg class="w-4 h-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span class="text-sm text-gray-700">${dietTip}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        dietContainer.innerHTML = `<p class="text-sm text-gray-600">Maintain a balanced diet and stay hydrated.</p>`;
    }
    
    // Basic Medications
    const medicationsContainer = document.getElementById('medications-content');
    if (recommendations.medications.length > 0) {
        medicationsContainer.innerHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p class="text-xs text-yellow-800 font-medium">⚠️ Always consult a pharmacist or doctor before taking any medication</p>
            </div>
            <ul class="space-y-2">
                ${recommendations.medications.slice(0, 5).map(medication => `
                    <li class="flex items-start">
                        <svg class="w-4 h-4 text-indigo-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <span class="text-sm text-gray-700">${medication}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        medicationsContainer.innerHTML = `<p class="text-sm text-gray-600">No specific medications recommended. Consult a healthcare provider for proper treatment.</p>`;
    }
    
    // Professional Care
    const professionalContainer = document.getElementById('professional-content');
    if (recommendations.doctorRequired) {
        const urgencyText = recommendations.urgency === 'high' ? 'within 24 hours' : 
                          recommendations.urgency === 'medium' ? 'within 2-3 days' : 
                          'at your earliest convenience';
        
        professionalContainer.innerHTML = `
            <div class="space-y-3">
                <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p class="text-sm text-red-800 font-medium">Medical consultation recommended ${urgencyText}</p>
                </div>
                <div>
                    <h5 class="font-medium text-gray-800 mb-2">When to see a doctor:</h5>
                    <ul class="space-y-1 text-sm text-gray-700">
                        <li>• Symptoms persist or worsen</li>
                        <li>• You develop new concerning symptoms</li>
                        <li>• You have underlying health conditions</li>
                        <li>• You're taking other medications</li>
                    </ul>
                </div>
                <div>
                    <h5 class="font-medium text-gray-800 mb-2">What to discuss:</h5>
                    <ul class="space-y-1 text-sm text-gray-700">
                        <li>• Complete symptom history</li>
                        <li>• Current medications and allergies</li>
                        <li>• Family medical history</li>
                        <li>• Lifestyle factors affecting health</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        professionalContainer.innerHTML = `
            <div class="text-gray-600">
                <p class="text-sm mb-2">Your symptoms may be manageable with home care, but consider seeing a doctor if:</p>
                <ul class="space-y-1 text-sm">
                    <li>• Symptoms worsen or persist beyond expected timeframe</li>
                    <li>• You develop new or concerning symptoms</li>
                    <li>• You have questions about treatment options</li>
                    <li>• You want professional confirmation of your condition</li>
                </ul>
            </div>
        `;
    }
}

function updateActionButtons(results) {
    const consultBtn = document.getElementById('consult-doctor-btn');
    const medicinesBtn = document.getElementById('buy-medicines-btn');
    
    if (results.recommendations.doctorRequired || results.overallSeverity === 'high') {
        consultBtn.classList.remove('hidden');
    } else {
        consultBtn.classList.add('hidden');
    }
    
    if (results.recommendations.medications.length > 0) {
        medicinesBtn.classList.remove('hidden');
    } else {
        medicinesBtn.classList.add('hidden');
    }
}

function saveAssessment() {
    if (!analysisResults) {
        alert('No assessment to save. Please complete the symptom analysis first.');
        return;
    }
    
    try {
        const assessmentData = {
            timestamp: new Date().toISOString(),
            patientInfo: {
                age: analysisResults.formData.age,
                gender: analysisResults.formData.gender,
                weight: analysisResults.formData.weight,
                height: analysisResults.formData.height
            },
            symptoms: {
                primary: analysisResults.formData.primarySymptoms,
                additional: analysisResults.formData.additionalSymptoms,
                duration: analysisResults.formData.duration,
                severity: analysisResults.formData.severity,
                description: analysisResults.formData.description
            },
            analysis: {
                overallSeverity: analysisResults.overallSeverity,
                possibleConditions: analysisResults.possibleConditions.slice(0, 3), // Save top 3
                recommendations: analysisResults.recommendations
            },
            mode: analysisResults.formData.mode
        };
        
        // Save to session storage (in a real app, this would be saved to a database)
        let savedAssessments = JSON.parse(sessionStorage.getItem('symptomAssessments') || '[]');
        savedAssessments.unshift(assessmentData); // Add to beginning
        
        // Keep only the last 10 assessments
        if (savedAssessments.length > 10) {
            savedAssessments = savedAssessments.slice(0, 10);
        }
        
        sessionStorage.setItem('symptomAssessments', JSON.stringify(savedAssessments));
        
        // Show success message
        const button = document.getElementById('save-assessment');
        const originalText = button.innerHTML;
        
        button.innerHTML = `
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Assessment Saved!
        `;
        button.classList.remove('bg-gradient-to-r', 'from-green-600', 'to-green-700');
        button.classList.add('bg-green-800');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-700');
            button.classList.remove('bg-green-800');
        }, 2000);
        
    } catch (error) {
        console.error('Error saving assessment:', error);
        alert('Error saving assessment. Please try again.');
    }
}

// Utility function to get symptom name by ID
function getSymptomName(symptomId) {
    const symptom = primarySymptoms.concat(additionalSymptoms).find(s => s.id === symptomId);
    return symptom ? symptom.name : symptomId;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Symptom Checker initialized');
});