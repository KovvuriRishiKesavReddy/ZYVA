// Blood Analysis JavaScript with Toggle System
document.addEventListener('DOMContentLoaded', function() {
    console.log('Blood Analysis page loaded');
    
    // Initialize form handling
    initializeForm();
    
    // Add input validation
    addInputValidation();
    
    // Initialize toggle mode with existing HTML buttons
    initializeToggleMode();
});

// Reference ranges for all parameters
const REFERENCE_RANGES = {
    // Basic Essential Parameters
    hemoglobin: {
        male: { min: 13.8, max: 17.2, unit: 'g/dL' },
        female: { min: 12.1, max: 15.1, unit: 'g/dL' }
    },
    bloodSugar: {
        all: { min: 70, max: 100, unit: 'mg/dL', fasting: true }
    },
    totalCholesterol: {
        all: { min: 0, max: 200, unit: 'mg/dL', optimal: 200 }
    },
    bloodPressureSystolic: {
        all: { min: 90, max: 120, unit: 'mmHg' }
    },
    bloodPressureDiastolic: {
        all: { min: 60, max: 80, unit: 'mmHg' }
    },
    
    // Comprehensive Parameters
    rbc: {
        male: { min: 4.7, max: 6.1, unit: 'million/μL' },
        female: { min: 4.2, max: 5.4, unit: 'million/μL' }
    },
    wbc: {
        all: { min: 4.0, max: 11.0, unit: 'thousand/μL' }
    },
    platelets: {
        all: { min: 150, max: 450, unit: 'thousand/μL' }
    },
    hematocrit: {
        male: { min: 41, max: 50, unit: '%' },
        female: { min: 36, max: 46, unit: '%' }
    },
    ldl: {
        all: { min: 0, max: 100, unit: 'mg/dL', optimal: 100 }
    },
    hdl: {
        male: { min: 40, max: 999, unit: 'mg/dL' },
        female: { min: 50, max: 999, unit: 'mg/dL' }
    },
    triglycerides: {
        all: { min: 0, max: 150, unit: 'mg/dL', optimal: 150 }
    },
    alt: {
        all: { min: 7, max: 56, unit: 'U/L' }
    },
    ast: {
        all: { min: 10, max: 40, unit: 'U/L' }
    },
    bilirubin: {
        all: { min: 0.3, max: 1.2, unit: 'mg/dL' }
    },
    creatinine: {
        male: { min: 0.7, max: 1.3, unit: 'mg/dL' },
        female: { min: 0.6, max: 1.1, unit: 'mg/dL' }
    },
    bun: {
        all: { min: 6, max: 24, unit: 'mg/dL' }
    },
    uricAcid: {
        male: { min: 3.4, max: 7.0, unit: 'mg/dL' },
        female: { min: 2.4, max: 6.0, unit: 'mg/dL' }
    },
    vitaminD: {
        all: { min: 30, max: 100, unit: 'ng/mL' }
    },
    vitaminB12: {
        all: { min: 200, max: 900, unit: 'pg/mL' }
    },
    iron: {
        all: { min: 60, max: 170, unit: 'μg/dL' }
    }
};

// Basic parameters that most people have access to
const BASIC_PARAMETERS = [
    'hemoglobin', 'bloodSugar', 'totalCholesterol', 
    'bloodPressureSystolic', 'bloodPressureDiastolic'
];

// Comprehensive parameters for detailed analysis
const COMPREHENSIVE_PARAMETERS = [
    'hemoglobin', 'rbc', 'wbc', 'platelets', 'hematocrit',
    'totalCholesterol', 'ldl', 'hdl', 'triglycerides',
    'alt', 'ast', 'bilirubin', 'creatinine', 'bun', 'uricAcid',
    'vitaminD', 'vitaminB12', 'iron', 'bloodSugar'
];

// Current analysis mode
let currentMode = 'basic';

// Initialize toggle mode functionality using existing HTML buttons
function initializeToggleMode() {
    const basicBtn = document.getElementById('basic-mode-btn');
    const comprehensiveBtn = document.getElementById('comprehensive-mode-btn');
    
    if (basicBtn && comprehensiveBtn) {
        // Add event listeners to existing buttons
        basicBtn.addEventListener('click', () => switchMode('basic'));
        comprehensiveBtn.addEventListener('click', () => switchMode('comprehensive'));
        
        // Initialize with basic mode
        switchMode('basic');
    } else {
        console.error('Toggle buttons not found');
    }
}

// Switch between modes
function switchMode(mode) {
    console.log('Switching to mode:', mode);
    currentMode = mode;
    
    // Update button styles
    const basicBtn = document.getElementById('basic-mode-btn');
    const comprehensiveBtn = document.getElementById('comprehensive-mode-btn');
    const basicNotification = document.getElementById('basic-notification');
    const comprehensiveNotification = document.getElementById('comprehensive-notification');
    
    if (mode === 'basic') {
        if (basicBtn) {
            basicBtn.className = 'px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md transform scale-105';
        }
        if (comprehensiveBtn) {
            comprehensiveBtn.className = 'px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-white/50';
        }
        // Show basic notification, hide comprehensive
        if (basicNotification) basicNotification.classList.remove('hidden');
        if (comprehensiveNotification) comprehensiveNotification.classList.add('hidden');
    } else {
        if (basicBtn) {
            basicBtn.className = 'px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-white/50';
        }
        if (comprehensiveBtn) {
            comprehensiveBtn.className = 'px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md transform scale-105';
        }
        // Show comprehensive notification, hide basic
        if (basicNotification) basicNotification.classList.add('hidden');
        if (comprehensiveNotification) comprehensiveNotification.classList.remove('hidden');
    }
    
    // Update form display
    updateFormDisplay();
    
    console.log('Mode switched to:', currentMode);
}

// Update form display based on current mode
function updateFormDisplay() {
    // Get all cards by their actual IDs and classes
    const allCards = document.querySelectorAll('.parameter-card');
    const bloodPressureCard = document.getElementById('blood-pressure-card');
    
    if (currentMode === 'basic') {
        // In basic mode: show personal info, CBC (for hemoglobin & blood sugar), lipid (for cholesterol), and blood pressure
        allCards.forEach(card => {
            const title = card.querySelector('h3');
            if (title) {
                const titleText = title.textContent;
                if (titleText.includes('Personal Information') || 
                    titleText.includes('Complete Blood Count') || 
                    titleText.includes('Lipid Profile')) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
        
        // Show blood pressure card for basic mode
        if (bloodPressureCard) {
            bloodPressureCard.style.display = 'block';
        }
    } else {
        // In comprehensive mode: show all cards except separate blood pressure
        allCards.forEach(card => {
            card.style.display = 'block';
        });
        
        // Hide separate blood pressure card (values are in other sections)
        if (bloodPressureCard) {
            bloodPressureCard.style.display = 'none';
        }
    }
}

// Initialize form handling
function initializeForm() {
    const form = document.getElementById('blood-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        analyzeBloodResults();
    });
}

// Add input validation
function addInputValidation() {
    document.addEventListener('input', function(e) {
        if (e.target.type === 'number') {
            validateInput(e.target);
        }
    });
}

// Validate individual input
function validateInput(input) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 0) {
        input.style.borderColor = '#EF4444';
        return false;
    }
    
    // Check for extremely high values that might be typos
    const maxValues = {
        hemoglobin: 25,
        bloodSugar: 500,
        totalCholesterol: 500,
        bloodPressureSystolic: 300,
        bloodPressureDiastolic: 200,
        rbc: 10,
        wbc: 50,
        platelets: 1000
    };
    
    const max = maxValues[input.id] || 1000;
    if (value > max) {
        input.style.borderColor = '#F59E0B';
        return false;
    }
    
    input.style.borderColor = '#10B981';
    return true;
}

// Main analysis function
function analyzeBloodResults() {
    console.log('Starting blood analysis in mode:', currentMode);
    
    // Collect form data
    const formData = collectFormData();
    console.log('Form data collected:', formData);
    
    if (!validateFormData(formData)) {
        showError('Please fill in the required fields (Age and Gender) and at least one health parameter.');
        return;
    }
    
    // Perform analysis
    const analysis = performAnalysis(formData);
    console.log('Analysis completed:', analysis);
    
    // Display results
    displayResults(analysis, formData);
    
    // Scroll to results
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Collect form data
function collectFormData() {
    const data = {};
    
    // Personal information
    data.age = parseInt(document.getElementById('age').value) || null;
    data.gender = document.getElementById('gender').value || null;
    data.weight = parseFloat(document.getElementById('weight').value) || null;
    data.height = parseFloat(document.getElementById('height').value) || null;
    
    // Get parameters based on current mode
    const parameters = currentMode === 'basic' ? BASIC_PARAMETERS : COMPREHENSIVE_PARAMETERS;
    console.log('Using parameters for', currentMode, 'mode:', parameters);
    
    parameters.forEach(param => {
        const element = document.getElementById(param);
        if (element && element.value) {
            data[param] = parseFloat(element.value);
            console.log('Found parameter:', param, '=', element.value);
        }
    });
    
    data.analysisMode = currentMode;
    
    return data;
}

// Validate form data
function validateFormData(data) {
    if (!data.age || !data.gender) {
        return false;
    }
    
    if (data.age < 1 || data.age > 120) {
        return false;
    }
    
    // Check if at least one health parameter is provided
    const parameters = currentMode === 'basic' ? BASIC_PARAMETERS : COMPREHENSIVE_PARAMETERS;
    const hasHealthData = parameters.some(param => data[param] !== undefined);
    
    return hasHealthData;
}

// Perform blood analysis
function performAnalysis(data) {
    const analysis = {
        mode: currentMode,
        parameters: [],
        overallStatus: 'normal',
        riskFactors: [],
        recommendations: [],
        summary: {
            normal: 0,
            abnormal: 0,
            critical: 0,
            total: 0
        }
    };
    
    // Get parameters to analyze based on mode
    const parametersToAnalyze = currentMode === 'basic' ? BASIC_PARAMETERS : COMPREHENSIVE_PARAMETERS;
    
    // Analyze each parameter
    parametersToAnalyze.forEach(param => {
        const value = data[param];
        if (value === undefined || value === null) return;
        
        const paramAnalysis = analyzeParameter(param, value, data.gender, data.age);
        if (paramAnalysis) {
            analysis.parameters.push(paramAnalysis);
            analysis.summary.total++;
            
            if (paramAnalysis.status === 'critical') {
                analysis.summary.critical++;
                analysis.overallStatus = 'critical';
            } else if (paramAnalysis.status === 'abnormal') {
                analysis.summary.abnormal++;
                if (analysis.overallStatus === 'normal') {
                    analysis.overallStatus = 'abnormal';
                }
            } else {
                analysis.summary.normal++;
            }
        }
    });
    
    // Generate risk factors and recommendations
    analysis.riskFactors = generateRiskFactors(analysis.parameters, data);
    analysis.recommendations = generateRecommendations(analysis.parameters, data);
    
    return analysis;
}

// Analyze individual parameter
function analyzeParameter(param, value, gender, age) {
    const ranges = REFERENCE_RANGES[param];
    if (!ranges) return null;
    
    let range;
    if (ranges[gender]) {
        range = ranges[gender];
    } else if (ranges.all) {
        range = ranges.all;
    } else {
        return null;
    }
    
    let status = 'normal';
    let interpretation = 'Within normal range';
    let severity = 1;
    
    // Special handling for blood pressure
    if (param === 'bloodPressureSystolic' || param === 'bloodPressureDiastolic') {
        return analyzeBloodPressure(param, value, range);
    }
    
    // Determine status
    if (value < range.min) {
        status = 'abnormal';
        interpretation = 'Below normal range';
        severity = Math.abs(value - range.min) / range.min;
        
        if (severity > 0.3) {
            status = 'critical';
            interpretation = 'Significantly below normal range';
        }
    } else if (value > range.max) {
        status = 'abnormal';
        interpretation = 'Above normal range';
        severity = (value - range.max) / range.max;
        
        if (severity > 0.3) {
            status = 'critical';
            interpretation = 'Significantly above normal range';
        }
    }
    
    return {
        name: param,
        displayName: getParameterDisplayName(param),
        value: value,
        unit: range.unit,
        referenceRange: `${range.min}-${range.max}`,
        status: status,
        interpretation: interpretation,
        severity: severity,
        category: getParameterCategory(param)
    };
}

// Analyze blood pressure specially
function analyzeBloodPressure(param, value, range) {
    let status = 'normal';
    let interpretation = 'Normal blood pressure';
    
    if (param === 'bloodPressureSystolic') {
        if (value >= 140) {
            status = 'critical';
            interpretation = 'High blood pressure (Stage 2)';
        } else if (value >= 130) {
            status = 'abnormal';
            interpretation = 'High blood pressure (Stage 1)';
        } else if (value >= 120) {
            status = 'abnormal';
            interpretation = 'Elevated blood pressure';
        } else if (value < 90) {
            status = 'abnormal';
            interpretation = 'Low blood pressure';
        }
    } else if (param === 'bloodPressureDiastolic') {
        if (value >= 90) {
            status = 'critical';
            interpretation = 'High blood pressure (Stage 2)';
        } else if (value >= 80) {
            status = 'abnormal';
            interpretation = 'High blood pressure (Stage 1)';
        } else if (value < 60) {
            status = 'abnormal';
            interpretation = 'Low blood pressure';
        }
    }
    
    return {
        name: param,
        displayName: getParameterDisplayName(param),
        value: value,
        unit: range.unit,
        referenceRange: param === 'bloodPressureSystolic' ? '90-120' : '60-80',
        status: status,
        interpretation: interpretation,
        severity: status === 'critical' ? 2 : status === 'abnormal' ? 1.5 : 1,
        category: 'Cardiovascular Health'
    };
}

// Get display name for parameter
function getParameterDisplayName(param) {
    const names = {
        hemoglobin: 'Hemoglobin',
        bloodSugar: 'Blood Sugar (Fasting)',
        totalCholesterol: 'Total Cholesterol',
        bloodPressureSystolic: 'Systolic Blood Pressure',
        bloodPressureDiastolic: 'Diastolic Blood Pressure',
        rbc: 'RBC Count',
        wbc: 'WBC Count',
        platelets: 'Platelet Count',
        hematocrit: 'Hematocrit',
        ldl: 'LDL Cholesterol',
        hdl: 'HDL Cholesterol',
        triglycerides: 'Triglycerides',
        alt: 'ALT/SGPT',
        ast: 'AST/SGOT',
        bilirubin: 'Total Bilirubin',
        creatinine: 'Creatinine',
        bun: 'Blood Urea Nitrogen',
        uricAcid: 'Uric Acid',
        vitaminD: 'Vitamin D',
        vitaminB12: 'Vitamin B12',
        iron: 'Iron'
    };
    return names[param] || param;
}

// Get parameter category
function getParameterCategory(param) {
    const categories = {
        hemoglobin: 'Blood Health',
        bloodSugar: 'Metabolic Health',
        totalCholesterol: 'Cardiovascular Health',
        bloodPressureSystolic: 'Cardiovascular Health',
        bloodPressureDiastolic: 'Cardiovascular Health',
        rbc: 'Complete Blood Count',
        wbc: 'Complete Blood Count',
        platelets: 'Complete Blood Count',
        hematocrit: 'Complete Blood Count',
        ldl: 'Lipid Profile',
        hdl: 'Lipid Profile',
        triglycerides: 'Lipid Profile',
        alt: 'Liver Function',
        ast: 'Liver Function',
        bilirubin: 'Liver Function',
        creatinine: 'Kidney Function',
        bun: 'Kidney Function',
        uricAcid: 'Kidney Function',
        vitaminD: 'Vitamins & Minerals',
        vitaminB12: 'Vitamins & Minerals',
        iron: 'Vitamins & Minerals'
    };
    return categories[param] || 'Other';
}

// Generate risk factors
function generateRiskFactors(parameters, data) {
    const riskFactors = [];
    
    parameters.forEach(param => {
        if (param.status === 'critical' || param.status === 'abnormal') {
            const risk = getParameterRisk(param.name, param.value, param.status, data);
            if (risk) {
                riskFactors.push(risk);
            }
        }
    });
    
    return riskFactors;
}

// Get risk factor for parameter
function getParameterRisk(param, value, status, data) {
    const risks = {
        hemoglobin: {
            low: 'Risk of anemia, fatigue, and weakness. May indicate iron deficiency.',
            high: 'Risk of blood clots and cardiovascular complications.'
        },
        bloodSugar: {
            high: 'Risk of diabetes and complications like heart disease, kidney damage.',
            low: 'Risk of hypoglycemia, dizziness, and energy crashes.'
        },
        totalCholesterol: {
            high: 'Increased risk of heart disease, stroke, and arterial blockages.'
        },
        bloodPressureSystolic: {
            high: 'High risk of heart attack, stroke, and kidney disease.',
            low: 'Risk of dizziness, fainting, and inadequate organ perfusion.'
        },
        bloodPressureDiastolic: {
            high: 'High risk of heart complications and stroke.',
            low: 'Risk of inadequate blood flow to organs.'
        }
    };
    
    const paramRisks = risks[param];
    if (!paramRisks) return null;
    
    const range = REFERENCE_RANGES[param];
    let riskType = 'high';
    
    if (range) {
        const refRange = data.gender && range[data.gender] ? range[data.gender] : range.all;
        if (refRange && value < refRange.min) {
            riskType = 'low';
        }
    }
    
    return {
        parameter: getParameterDisplayName(param),
        risk: paramRisks[riskType] || paramRisks.high || 'Abnormal values may indicate health issues',
        severity: status
    };
}

// Generate recommendations
function generateRecommendations(parameters, data) {
    const recommendations = [];
    const issues = {};
    
    // Categorize issues
    parameters.forEach(param => {
        if (param.status !== 'normal') {
            const category = param.category;
            if (!issues[category]) {
                issues[category] = [];
            }
            issues[category].push(param);
        }
    });
    
    // Generate recommendations based on issues
    Object.keys(issues).forEach(category => {
        const categoryRecs = getCategoryRecommendations(category, issues[category], data);
        recommendations.push(...categoryRecs);
    });
    
    // Add general recommendations
    if (data.analysisMode === 'basic') {
        recommendations.push({
            title: 'Regular Health Monitoring',
            description: 'Continue monitoring these basic parameters every 3-6 months for optimal health.',
            priority: 'medium'
        });
    }
    
    recommendations.push({
        title: 'Consult Healthcare Provider',
        description: 'Discuss these results with your doctor for personalized medical advice.',
        priority: 'high'
    });
    
    return recommendations;
}

// Get category-specific recommendations
function getCategoryRecommendations(category, parameters, data) {
    const recommendations = [];
    
    switch (category) {
        case 'Blood Health':
            recommendations.push({
                title: 'Iron-Rich Diet',
                description: 'Include iron-rich foods like spinach, red meat, lentils, and fortified cereals.',
                priority: 'high'
            });
            break;
            
        case 'Metabolic Health':
            recommendations.push({
                title: 'Blood Sugar Management',
                description: 'Follow a balanced diet, exercise regularly, and monitor carbohydrate intake.',
                priority: 'high'
            });
            break;
            
        case 'Cardiovascular Health':
            recommendations.push({
                title: 'Heart-Healthy Lifestyle',
                description: 'Reduce sodium intake, exercise regularly, manage stress, and avoid smoking.',
                priority: 'high'
            });
            break;
            
        case 'Liver Function':
            recommendations.push({
                title: 'Liver Health',
                description: 'Limit alcohol consumption, maintain healthy weight, and avoid excessive medications.',
                priority: 'high'
            });
            break;
            
        case 'Kidney Function':
            recommendations.push({
                title: 'Kidney Health',
                description: 'Stay well hydrated, monitor protein intake, and control blood pressure.',
                priority: 'high'
            });
            break;
    }
    
    return recommendations;
}

// Display results
function displayResults(analysis, formData) {
    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) return;
    
    resultsSection.classList.remove('hidden');
    
    // Display overall status
    displayOverallStatus(analysis);
    
    // Display parameter analysis
    displayParameterAnalysis(analysis.parameters);
    
    // Display recommendations
    displayRecommendations(analysis.recommendations);
    
    // Setup save functionality
    setupSaveResults(analysis, formData);
}

// Display overall status
function displayOverallStatus(analysis) {
    const statusIcon = document.getElementById('status-icon');
    const statusTitle = document.getElementById('status-title');
    const statusDescription = document.getElementById('status-description');
    const statusSummary = document.getElementById('status-summary');
    
    if (!statusIcon || !statusTitle || !statusDescription || !statusSummary) return;
    
    let icon, title, description, iconClass;
    
    switch (analysis.overallStatus) {
        case 'critical':
            icon = '⚠️';
            title = 'Immediate Attention Required';
            description = 'Several parameters are outside critical ranges. Please consult a healthcare provider immediately.';
            iconClass = 'bg-red-100 text-red-600';
            break;
        case 'abnormal':
            icon = '⚡';
            title = 'Some Concerns Detected';
            description = 'Some parameters are outside normal ranges. Consider consulting a healthcare provider.';
            iconClass = 'bg-yellow-100 text-yellow-600';
            break;
        default:
            icon = '✅';
            title = analysis.mode === 'basic' ? 'Good Basic Health Status' : 'Good Health Status';
            description = analysis.mode === 'basic' ? 
                'Your essential health parameters look good! Consider comprehensive analysis for detailed insights.' :
                'Most parameters are within normal ranges. Keep up the good work!';
            iconClass = 'bg-green-100 text-green-600';
    }
    
    statusIcon.innerHTML = `<span class="text-2xl">${icon}</span>`;
    statusIcon.className = `mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconClass}`;
    statusTitle.textContent = title;
    statusDescription.textContent = description;
    
    // Create summary cards with mode indicator
    const modeLabel = analysis.mode === 'basic' ? 'Basic Analysis' : 'Comprehensive Analysis';
    statusSummary.innerHTML = `
        <div class="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
            <div class="text-sm font-medium text-blue-800 mb-1">${modeLabel}</div>
            <div class="text-lg font-bold text-blue-600">${analysis.summary.total}</div>
            <div class="text-xs text-blue-700">Tests Analyzed</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-600">${analysis.summary.normal}</div>
            <div class="text-sm text-green-700">Normal</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-yellow-600">${analysis.summary.abnormal}</div>
            <div class="text-sm text-yellow-700">Abnormal</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-red-600">${analysis.summary.critical}</div>
            <div class="text-sm text-red-700">Critical</div>
        </div>
    `;
}

// Display parameter analysis
function displayParameterAnalysis(parameters) {
    const content = document.getElementById('parameter-content');
    if (!content) return;
    
    if (parameters.length === 0) {
        content.innerHTML = '<p class="text-gray-500">No parameters to analyze. Please enter at least one health parameter.</p>';
        return;
    }
    
    // Group by category
    const categories = {};
    parameters.forEach(param => {
        if (!categories[param.category]) {
            categories[param.category] = [];
        }
        categories[param.category].push(param);
    });
    
    let html = '';
    Object.keys(categories).forEach(category => {
        html += `
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span class="w-3 h-3 ${getCategoryColor(category)} rounded-full mr-2"></span>
                    ${category}
                </h4>
                <div class="space-y-3">
        `;
        
        categories[category].forEach(param => {
            const statusClass = param.status === 'critical' ? 'critical' : 
                              param.status === 'abnormal' ? 'abnormal' : 'normal';
            
            const statusIcon = param.status === 'critical' ? '🔴' : 
                              param.status === 'abnormal' ? '🟡' : '🟢';
            
            html += `
                <div class="parameter-item ${statusClass} p-4 bg-white rounded-lg border-l-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <span class="text-sm mr-2">${statusIcon}</span>
                                <div class="font-medium text-gray-800">${param.displayName}</div>
                            </div>
                            <div class="text-sm text-gray-600 mb-1">
                                <span class="font-semibold">Your Value:</span> ${param.value} ${param.unit}
                            </div>
                            <div class="text-sm text-gray-500">
                                <span class="font-semibold">Normal Range:</span> ${param.referenceRange} ${param.unit}
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-medium ${getStatusColor(param.status)} mb-1">
                                ${param.status.charAt(0).toUpperCase() + param.status.slice(1)}
                            </div>
                            <div class="text-xs text-gray-500">
                                ${param.interpretation}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div></div>';
    });
    
    content.innerHTML = html;
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        'Blood Health': 'bg-red-500',
        'Metabolic Health': 'bg-blue-500',
        'Cardiovascular Health': 'bg-purple-500',
        'Complete Blood Count': 'bg-red-500',
        'Lipid Profile': 'bg-yellow-500',
        'Liver Function': 'bg-green-500',
        'Kidney Function': 'bg-blue-500',
        'Vitamins & Minerals': 'bg-purple-500'
    };
    return colors[category] || 'bg-gray-500';
}

// Display recommendations
function displayRecommendations(recommendations) {
    const content = document.getElementById('recommendations-content');
    if (!content) return;
    
    if (recommendations.length === 0) {
        content.innerHTML = `
            <div class="text-center text-gray-500">
                <p class="mb-4">Great job! No specific recommendations at this time.</p>
                <p class="text-sm">Keep maintaining your healthy lifestyle and regular check-ups.</p>
            </div>
        `;
        return;
    }
    
    // Sort recommendations by priority
    const sortedRecommendations = recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    let html = '<div class="space-y-4">';
    sortedRecommendations.forEach((rec, index) => {
        const priorityClass = rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                             rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                             'border-green-200 bg-green-50';
        
        html += `
            <div class="p-4 rounded-lg border ${priorityClass}">
                <div class="flex items-start">
                    <div class="w-2 h-2 rounded-full ${rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} mr-3 mt-2"></div>
                    <div class="flex-1">
                        <h5 class="font-semibold text-gray-800 mb-2">${rec.title}</h5>
                        <p class="text-gray-600 text-sm leading-relaxed">${rec.description}</p>
                    </div>
                    <div class="ml-2">
                        <span class="text-xs px-2 py-1 rounded-full ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }">
                            ${rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    content.innerHTML = html;
}

// Get status color
function getStatusColor(status) {
    switch (status) {
        case 'critical': return 'text-red-600';
        case 'abnormal': return 'text-yellow-600';
        default: return 'text-green-600';
    }
}

// Setup save results functionality
function setupSaveResults(analysis, formData) {
    const saveButton = document.getElementById('save-results');
    if (!saveButton) return;
    
    saveButton.onclick = function() {
        saveAnalysisResults(analysis, formData);
    };
}

// Save analysis results
function saveAnalysisResults(analysis, formData) {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        const userId = currentUser.email || 'guest';
        
        const results = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            mode: analysis.mode,
            personalInfo: {
                age: formData.age,
                gender: formData.gender,
                weight: formData.weight,
                height: formData.height
            },
            analysis: analysis,
            rawData: formData
        };
        
        // Get existing results
        const existingResults = JSON.parse(localStorage.getItem(`blood_analysis_${userId}`) || '[]');
        
        // Add new results
        existingResults.unshift(results);
        
        // Keep only last 10 results
        if (existingResults.length > 10) {
            existingResults.splice(10);
        }
        
        // Save to localStorage
        localStorage.setItem(`blood_analysis_${userId}`, JSON.stringify(existingResults));
        
        // Show success feedback
        showSaveSuccess();
        
    } catch (error) {
        console.error('Error saving results:', error);
        showSaveError();
    }
}

// Show save success feedback
function showSaveSuccess() {
    const saveButton = document.getElementById('save-results');
    if (saveButton) {
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = `
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Saved Successfully!
        `;
        saveButton.className = saveButton.className.replace('from-green-600 to-green-700 hover:from-green-700 hover:to-green-800', 'from-green-500 to-green-600');
        
        setTimeout(() => {
            saveButton.innerHTML = originalText;
            saveButton.className = saveButton.className.replace('from-green-500 to-green-600', 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800');
        }, 2000);
    }
}

// Show save error feedback
function showSaveError() {
    const saveButton = document.getElementById('save-results');
    if (saveButton) {
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = `
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Save Failed
        `;
        saveButton.className = saveButton.className.replace('from-green-600 to-green-700 hover:from-green-700 hover:to-green-800', 'from-red-500 to-red-600');
        
        setTimeout(() => {
            saveButton.innerHTML = originalText;
            saveButton.className = saveButton.className.replace('from-red-500 to-red-600', 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800');
        }, 2000);
    }
}

// Show form validation error
function showError(message) {
    const form = document.getElementById('blood-form');
    const existingError = document.querySelector('.form-error-message');
    
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4';
    errorDiv.textContent = message;
    
    if (form) {
        form.insertBefore(errorDiv, form.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Export functionality
window.BloodAnalysis = {
    analyzeBloodResults,
    saveAnalysisResults,
    switchMode,
    REFERENCE_RANGES,
    BASIC_PARAMETERS,
    COMPREHENSIVE_PARAMETERS
};