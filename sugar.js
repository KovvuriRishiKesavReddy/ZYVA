// Blood Sugar Analysis JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('sugar-form');
    const testTypeSelect = document.getElementById('test-type');
    const glucoseLabel = document.getElementById('glucose-label');
    const glucoseUnit = document.getElementById('glucose-unit');
    const resultsSection = document.getElementById('results-section');

    // Update glucose label and unit based on test type
    testTypeSelect.addEventListener('change', function() {
        const testType = this.value;
        
        switch(testType) {
            case 'fasting':
                glucoseLabel.textContent = 'Fasting Glucose Level';
                glucoseUnit.textContent = 'mg/dL';
                break;
            case 'random':
                glucoseLabel.textContent = 'Random Glucose Level';
                glucoseUnit.textContent = 'mg/dL';
                break;
            case 'hba1c':
                glucoseLabel.textContent = 'HbA1c Level';
                glucoseUnit.textContent = '%';
                break;
            case 'ogtt':
                glucoseLabel.textContent = '2-Hour OGTT Level';
                glucoseUnit.textContent = 'mg/dL';
                break;
            default:
                glucoseLabel.textContent = 'Glucose Level';
                glucoseUnit.textContent = 'mg/dL';
        }
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            weight: parseFloat(document.getElementById('weight').value),
            height: parseInt(document.getElementById('height').value),
            testType: document.getElementById('test-type').value,
            glucoseLevel: parseFloat(document.getElementById('glucose-level').value),
            familyHistory: document.getElementById('family-history').checked,
            highBP: document.getElementById('high-bp').checked,
            sedentary: document.getElementById('sedentary').checked
        };

        // Validate form data
        if (!validateFormData(formData)) {
            return;
        }

        // Perform analysis
        const analysis = analyzeBloodSugar(formData);
        
        // Display results
        displayResults(analysis, formData);
        
        // Show results section
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Save results functionality
    document.getElementById('save-results').addEventListener('click', function() {
        // In a real application, this would save to a database
        alert('Results saved to your health profile!');
    });
});

// Function to prefill user data
function prefillUserData() {
    try {
        // Get user data from localStorage or sessionStorage
        const userDataString = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        
        if (!userDataString) {
            console.log('No user data found for prefilling');
            return;
        }
        
        const userData = JSON.parse(userDataString);
        console.log('Prefilling form with user data:', userData);
        
        // Prefill age
        if (userData.dateOfBirth) {
            const age = calculateAgeFromDOB(userData.dateOfBirth);
            if (age && age > 0 && age < 150) {
                document.getElementById('age').value = age;
                console.log('Prefilled age:', age);
            }
        }
        
        // Prefill gender
        if (userData.gender) {
            const genderSelect = document.getElementById('gender');
            const genderValue = userData.gender.toLowerCase();
            
            // Check if the gender value matches our select options
            if (genderValue === 'male' || genderValue === 'female') {
                genderSelect.value = genderValue;
                console.log('Prefilled gender:', genderValue);
            } else if (genderValue === 'm') {
                genderSelect.value = 'male';
                console.log('Prefilled gender: male (from M)');
            } else if (genderValue === 'f') {
                genderSelect.value = 'female';
                console.log('Prefilled gender: female (from F)');
            }
        }
        
        // Optionally prefill weight and height if available
        if (userData.weight && userData.weight > 0) {
            document.getElementById('weight').value = userData.weight;
            console.log('Prefilled weight:', userData.weight);
        }
        
        if (userData.height && userData.height > 0) {
            document.getElementById('height').value = userData.height;
            console.log('Prefilled height:', userData.height);
        }
        
    } catch (error) {
        console.error('Error prefilling user data:', error);
    }
}

// Function to calculate age from date of birth
function calculateAgeFromDOB(dateOfBirth) {
    try {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        
        // Check if the date is valid
        if (isNaN(birthDate.getTime())) {
            console.warn('Invalid date of birth:', dateOfBirth);
            return null;
        }
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Adjust if birthday hasn't occurred this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    } catch (error) {
        console.error('Error calculating age:', error);
        return null;
    }
}

function validateFormData(data) {
    const errors = [];
    
    if (data.age < 1 || data.age > 120) {
        errors.push('Please enter a valid age between 1 and 120');
    }
    
    if (!data.gender) {
        errors.push('Please select your gender');
    }
    
    if (data.weight < 20 || data.weight > 300) {
        errors.push('Please enter a valid weight between 20 and 300 kg');
    }
    
    if (data.height < 100 || data.height > 250) {
        errors.push('Please enter a valid height between 100 and 250 cm');
    }
    
    if (!data.testType) {
        errors.push('Please select a test type');
    }
    
    if (data.glucoseLevel <= 0) {
        errors.push('Please enter a valid glucose level');
    }
    
    if (errors.length > 0) {
        alert('Please correct the following errors:\n\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

function analyzeBloodSugar(data) {
    const bmi = calculateBMI(data.weight, data.height);
    let diabetesStatus = '';
    let riskLevel = '';
    let statusColor = '';
    let recommendations = {};
    
    // Determine diabetes status based on test type and glucose level
    switch(data.testType) {
        case 'fasting':
            if (data.glucoseLevel < 100) {
                diabetesStatus = 'Normal';
                riskLevel = 'Low';
                statusColor = 'normal';
            } else if (data.glucoseLevel < 126) {
                diabetesStatus = 'Prediabetic';
                riskLevel = 'Moderate';
                statusColor = 'prediabetic';
            } else {
                diabetesStatus = 'Diabetic';
                riskLevel = 'High';
                statusColor = 'diabetic';
            }
            break;
            
        case 'random':
            if (data.glucoseLevel < 140) {
                diabetesStatus = 'Normal';
                riskLevel = 'Low';
                statusColor = 'normal';
            } else if (data.glucoseLevel < 200) {
                diabetesStatus = 'Prediabetic';
                riskLevel = 'Moderate';
                statusColor = 'prediabetic';
            } else {
                diabetesStatus = 'Diabetic';
                riskLevel = 'High';
                statusColor = 'diabetic';
            }
            break;
            
        case 'hba1c':
            if (data.glucoseLevel < 5.7) {
                diabetesStatus = 'Normal';
                riskLevel = 'Low';
                statusColor = 'normal';
            } else if (data.glucoseLevel < 6.5) {
                diabetesStatus = 'Prediabetic';
                riskLevel = 'Moderate';
                statusColor = 'prediabetic';
            } else {
                diabetesStatus = 'Diabetic';
                riskLevel = 'High';
                statusColor = 'diabetic';
            }
            break;
            
        case 'ogtt':
            if (data.glucoseLevel < 140) {
                diabetesStatus = 'Normal';
                riskLevel = 'Low';
                statusColor = 'normal';
            } else if (data.glucoseLevel < 200) {
                diabetesStatus = 'Prediabetic';
                riskLevel = 'Moderate';
                statusColor = 'prediabetic';
            } else {
                diabetesStatus = 'Diabetic';
                riskLevel = 'High';
                statusColor = 'diabetic';
            }
            break;
    }
    
    // Adjust risk level based on additional factors
    let riskFactors = 0;
    if (data.familyHistory) riskFactors++;
    if (data.highBP) riskFactors++;
    if (data.sedentary) riskFactors++;
    if (bmi >= 30) riskFactors++;
    if (data.age >= 45) riskFactors++;
    
    // Adjust risk level based on additional risk factors
    if (diabetesStatus === 'Normal' && riskFactors >= 3) {
        riskLevel = 'Moderate';
    } else if (diabetesStatus === 'Prediabetic' && riskFactors >= 2) {
        riskLevel = 'High';
    }
    
    return {
        diabetesStatus,
        riskLevel,
        statusColor,
        bmi: bmi.toFixed(1),
        riskFactors,
        glucoseLevel: data.glucoseLevel,
        testType: data.testType,
        recommendations: getRecommendations(diabetesStatus, bmi, data)
    };
}

function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
}

function getRecommendations(status, bmi, data) {
    const recommendations = {
        diet: [],
        exercise: [],
        additional: []
    };
    
    // Diet recommendations based on diabetes status
    switch(status) {
        case 'Normal':
            recommendations.diet = [
                'Maintain a balanced diet with plenty of vegetables and fruits',
                'Choose whole grains over refined carbohydrates',
                'Include lean proteins in your meals',
                'Limit processed foods and added sugars',
                'Stay hydrated with water as your primary beverage',
                'Practice portion control to maintain healthy weight'
            ];
            break;
            
        case 'Prediabetic':
            recommendations.diet = [
                'Follow a low-glycemic index diet',
                'Increase fiber intake with vegetables and whole grains',
                'Limit refined sugars and processed carbohydrates',
                'Include healthy fats like avocados, nuts, and olive oil',
                'Eat smaller, more frequent meals throughout the day',
                'Consider the plate method: 1/2 vegetables, 1/4 lean protein, 1/4 whole grains',
                'Limit fruit juices and opt for whole fruits instead',
                'Choose lean proteins like fish, chicken, legumes, and tofu'
            ];
            break;
            
        case 'Diabetic':
            recommendations.diet = [
                'Work with a registered dietitian for personalized meal planning',
                'Monitor carbohydrate intake and consider carb counting',
                'Focus on complex carbohydrates with high fiber content',
                'Include chromium and magnesium-rich foods',
                'Eat consistent meals at regular times',
                'Choose foods with low glycemic index',
                'Include cinnamon and other blood sugar-friendly spices',
                'Avoid sugary drinks, candy, and processed snacks',
                'Consider Mediterranean or DASH diet patterns',
                'Monitor blood sugar levels as recommended by your doctor'
            ];
            break;
    }
    
    // Exercise recommendations based on status and BMI
    const baseExercise = [
        'Aim for at least 150 minutes of moderate aerobic activity per week',
        'Include strength training exercises 2-3 times per week',
        'Start slowly and gradually increase intensity',
        'Monitor blood sugar before, during, and after exercise if diabetic'
    ];
    
    if (status === 'Normal') {
        recommendations.exercise = [
            ...baseExercise,
            'Try activities you enjoy: walking, swimming, dancing, cycling',
            'Include flexibility and balance exercises like yoga',
            'Take regular breaks from sitting throughout the day'
        ];
    } else if (status === 'Prediabetic') {
        recommendations.exercise = [
            ...baseExercise,
            'Focus on moderate-intensity activities like brisk walking',
            'Include high-intensity interval training (HIIT) 1-2 times per week',
            'Try resistance band exercises or bodyweight workouts',
            'Consider post-meal walks to help control blood sugar spikes',
            'Join group fitness classes for motivation and accountability'
        ];
    } else { // Diabetic
        recommendations.exercise = [
            ...baseExercise,
            'Consult with your healthcare provider before starting new exercises',
            'Check your feet daily and wear proper footwear',
            'Stay hydrated and carry glucose tablets if needed',
            'Consider supervised exercise programs designed for diabetics',
            'Include both aerobic and resistance training',
            'Monitor for signs of hypoglycemia during exercise'
        ];
    }
    
    // Additional recommendations
    recommendations.additional = [
        'Schedule regular check-ups with your healthcare provider',
        'Monitor your blood pressure regularly',
        'Get adequate sleep (7-9 hours per night)',
        'Manage stress through relaxation techniques or counseling',
        'Avoid smoking and limit alcohol consumption'
    ];
    
    if (status === 'Prediabetic' || status === 'Diabetic') {
        recommendations.additional.push(
            'Consider diabetes education classes',
            'Learn to recognize symptoms of high and low blood sugar',
            'Keep a food and blood sugar diary',
            'Stay up to date with vaccinations (flu, pneumonia)',
            'Have regular eye and foot examinations'
        );
    }
    
    if (bmi >= 25) {
        recommendations.additional.push('Focus on gradual, sustainable weight loss');
    }
    
    if (data.familyHistory) {
        recommendations.additional.push('Inform family members about their increased risk');
    }
    
    return recommendations;
}

function displayResults(analysis, formData) {
    // Update result card
    const resultCard = document.getElementById('result-card');
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultDescription = document.getElementById('result-description');
    const yourLevel = document.getElementById('your-level');
    const bmiValue = document.getElementById('bmi-value');
    const riskLevel = document.getElementById('risk-level');
    const detailedInfo = document.getElementById('detailed-info');
    
    // Set card style based on status
    resultCard.className = `result-card ${analysis.statusColor} rounded-xl shadow-xl p-8 mb-8`;
    
    // Set icon and colors based on status
    let iconHTML = '';
    let titleColor = '';
    let riskColor = '';
    
    switch(analysis.statusColor) {
        case 'normal':
            iconHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
            resultIcon.className = 'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-500';
            titleColor = 'text-green-600';
            riskColor = 'text-green-600';
            break;
        case 'prediabetic':
            iconHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
            resultIcon.className = 'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-yellow-500';
            titleColor = 'text-yellow-600';
            riskColor = 'text-yellow-600';
            break;
        case 'diabetic':
            iconHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
            resultIcon.className = 'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-500';
            titleColor = 'text-red-600';
            riskColor = 'text-red-600';
            break;
    }
    
    resultIcon.innerHTML = iconHTML;
    resultTitle.innerHTML = analysis.diabetesStatus;
    resultTitle.className = `text-3xl font-bold mb-2 ${titleColor}`;
    
    // Set description based on status
    const descriptions = {
        'Normal': 'Your blood sugar levels are within the normal range. Keep up the good work!',
        'Prediabetic': 'Your blood sugar levels indicate prediabetes. With lifestyle changes, you can prevent type 2 diabetes.',
        'Diabetic': 'Your blood sugar levels indicate diabetes. Please consult with a healthcare provider for proper management.'
    };
    
    resultDescription.textContent = descriptions[analysis.diabetesStatus];
    
    // Display values
    const unit = analysis.testType === 'hba1c' ? '%' : 'mg/dL';
    yourLevel.textContent = `${analysis.glucoseLevel} ${unit}`;
    bmiValue.textContent = analysis.bmi;
    riskLevel.textContent = analysis.riskLevel;
    riskLevel.className = `text-2xl font-bold ${riskColor}`;
    
    // Display detailed information
    const bmiCategory = getBMICategory(parseFloat(analysis.bmi));
    const testName = getTestName(analysis.testType);
    
    detailedInfo.innerHTML = `
        <h4 class="font-semibold text-gray-800 mb-3">Detailed Analysis</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Test Type:</strong> ${testName}</div>
            <div><strong>BMI Category:</strong> ${bmiCategory}</div>
            <div><strong>Age:</strong> ${formData.age} years</div>
            <div><strong>Additional Risk Factors:</strong> ${analysis.riskFactors}</div>
        </div>
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800">
                <strong>Reference Ranges for ${testName}:</strong><br>
                ${getReferenceRanges(analysis.testType)}
            </p>
        </div>
    `;
    
    // Display diet recommendations
    const dietContent = document.getElementById('diet-content');
    dietContent.innerHTML = `
        <ul class="space-y-2">
            ${analysis.recommendations.diet.map(item => `<li class="flex items-start space-x-2"><span class="text-green-500 mt-1">•</span><span class="text-sm text-gray-700">${item}</span></li>`).join('')}
        </ul>
    `;
    
    // Display exercise recommendations
    const exerciseContent = document.getElementById('exercise-content');
    exerciseContent.innerHTML = `
        <ul class="space-y-2">
            ${analysis.recommendations.exercise.map(item => `<li class="flex items-start space-x-2"><span class="text-blue-500 mt-1">•</span><span class="text-sm text-gray-700">${item}</span></li>`).join('')}
        </ul>
    `;
    
    // Display additional recommendations
    const additionalContent = document.getElementById('additional-content');
    additionalContent.innerHTML = analysis.recommendations.additional.map(item => `
        <div class="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
            <svg class="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm text-gray-700">${item}</span>
        </div>
    `).join('');
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function getTestName(testType) {
    const names = {
        'fasting': 'Fasting Blood Sugar (FBS)',
        'random': 'Random Blood Sugar (RBS)',
        'hba1c': 'Hemoglobin A1c (HbA1c)',
        'ogtt': 'Oral Glucose Tolerance Test (OGTT)'
    };
    return names[testType] || 'Blood Sugar Test';
}

function getReferenceRanges(testType) {
    const ranges = {
        'fasting': 'Normal: <100 mg/dL | Prediabetes: 100-125 mg/dL | Diabetes: ≥126 mg/dL',
        'random': 'Normal: <140 mg/dL | Prediabetes: 140-199 mg/dL | Diabetes: ≥200 mg/dL',
        'hba1c': 'Normal: <5.7% | Prediabetes: 5.7-6.4% | Diabetes: ≥6.5%',
        'ogtt': 'Normal: <140 mg/dL | Prediabetes: 140-199 mg/dL | Diabetes: ≥200 mg/dL'
    };
    return ranges[testType] || 'Consult your healthcare provider for reference ranges';
}