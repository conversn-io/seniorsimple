import React, { useState } from 'react';

const LifeInsuranceCalculator: React.FC = () => {
  // State management for interactive elements
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: inputValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-background">
      
<div classname="min-h-screen py-8">
<div classname="max-w-4xl mx-auto px-4">
<!-- Header -->
<div classname="text-center mb-8">
<h1 classname="text-4xl font-bold text-foreground mb-4">
<i classname="fas fa-shield-alt text-primary mr-3"></i>
                    Life Insurance Needs Calculator
                </h1>
<p classname="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Calculate the right amount of life insurance coverage to protect your family's financial future
                </p>
</div>
<!-- Progress Bar -->
<div classname="mb-8">
<div classname="flex justify-between items-center mb-2">
<span classname="text-sm font-medium text-gray-700">Progress</span>
<span classname="text-sm font-medium text-gray-700" id="progressText">Step 1 of 4</span>
</div>
<div classname="w-full bg-gray-200 rounded-full h-2">
<div classname="bg-primary h-2 rounded-full transition-all duration-300" id="progressBar" style="width: 25%"></div>
</div>
</div>
<!-- Calculator Form -->
<div classname="bg-card rounded-xl shadow-lg p-8 mb-8">
<!-- Step 1: Personal Information -->
<div classname="calculator-step" id="step1">
<h2 classname="text-2xl font-semibold text-foreground mb-6">
<i classname="fas fa-user text-primary mr-2"></i>
                        Personal Information
                    </h2>
<div classname="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Your Age</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="age" max="100" min="18" placeholder="45" type="number"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="income" min="0" placeholder="75000" type="number"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
<select classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="maritalStatus">
<option value="">Select status</option>
<option value="single">Single</option>
<option value="married">Married</option>
<option value="divorced">Divorced</option>
<option value="widowed">Widowed</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Number of Dependents</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="dependents" max="10" min="0" placeholder="2" type="number"/>
</div>
</div>
</div>
<!-- Step 2: Financial Obligations -->
<div classname="calculator-step hidden" id="step2">
<h2 classname="text-2xl font-semibold text-foreground mb-6">
<i classname="fas fa-dollar-sign text-primary mr-2"></i>
                        Financial Obligations
                    </h2>
<div classname="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Outstanding Mortgage Balance</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="mortgage" min="0" placeholder="250000" type="number"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Other Debts (credit cards, loans, etc.)</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="otherDebts" min="0" placeholder="25000" type="number"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Estimated Final Expenses</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="finalExpenses" min="0" placeholder="15000" type="number"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Education Fund Needed</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="educationFund" min="0" placeholder="100000" type="number"/>
</div>
</div>
</div>
<!-- Step 3: Assets and Existing Coverage -->
<div classname="calculator-step hidden" id="step3">
<h2 classname="text-2xl font-semibold text-foreground mb-6">
<i classname="fas fa-piggy-bank text-primary mr-2"></i>
                        Assets &amp; Existing Coverage
                    </h2>
<div classname="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Savings &amp; Investments</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="savings" min="0" placeholder="50000" type="number"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Retirement Accounts (401k, IRA, etc.)</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="retirement" min="0" placeholder="150000" type="number"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Existing Life Insurance</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="existingInsurance" min="0" placeholder="100000" type="number"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Expected Social Security Benefits (Annual)</label>
<input classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="socialSecurity" min="0" placeholder="24000" type="number"/>
</div>
</div>
</div>
<!-- Step 4: Preferences -->
<div classname="calculator-step hidden" id="step4">
<h2 classname="text-2xl font-semibold text-foreground mb-6">
<i classname="fas fa-cog text-primary mr-2"></i>
                        Coverage Preferences
                    </h2>
<div classname="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Years of Income Replacement</label>
<select classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="incomeYears">
<option value="5">5 years</option>
<option selected="" value="10">10 years</option>
<option value="15">15 years</option>
<option value="20">20 years</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Income Replacement Percentage</label>
<select classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="incomePercentage">
<option value="0.6">60%</option>
<option selected="" value="0.7">70%</option>
<option value="0.8">80%</option>
<option value="1.0">100%</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Preferred Coverage Type</label>
<select classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="coverageType">
<option value="term">Term Life Insurance</option>
<option value="whole">Whole Life Insurance</option>
<option value="universal">Universal Life Insurance</option>
<option value="variable">Variable Life Insurance</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Budget Range (Monthly Premium)</label>
<select classname="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" id="budget">
<option value="50">Under $50</option>
<option value="100">$50 - $100</option>
<option value="200">$100 - $200</option>
<option value="500">$200 - $500</option>
<option value="1000">$500+</option>
</select>
</div>
</div>
</div>
<!-- Navigation Buttons -->
<div classname="flex justify-between mt-8">
<button classname="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors hidden" id="prevBtn">
<i classname="fas fa-arrow-left mr-2"></i>Previous
                    </button>
<button classname="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ml-auto" id="nextBtn">
                        Next<i classname="fas fa-arrow-right ml-2"></i>
</button>
<button classname="px-6 py-2 bg-trust-green text-primary-foreground rounded-md hover:bg-green-700 transition-colors ml-auto hidden" id="calculateBtn">
<i classname="fas fa-calculator mr-2"></i>Calculate Coverage
                    </button>
</div>
</div>
<!-- Results Section -->
<div classname="hidden" id="results">
<!-- Coverage Recommendation -->
<div classname="bg-card rounded-xl shadow-lg p-8 mb-8">
<h2 classname="text-2xl font-semibold text-foreground mb-6">
<i classname="fas fa-chart-line text-trust-green mr-2"></i>
                        Your Coverage Recommendation
                    </h2>
<div classname="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
<div classname="bg-trust-green/5 rounded-lg p-6 text-center">
<div classname="text-3xl font-bold text-trust-green mb-2" id="recommendedCoverage">$0</div>
<div classname="text-sm text-muted-foreground">Recommended Coverage</div>
</div>
<div classname="bg-primary/5 rounded-lg p-6 text-center">
<div classname="text-3xl font-bold text-primary mb-2" id="currentGap">$0</div>
<div classname="text-sm text-muted-foreground">Coverage Gap</div>
</div>
<div classname="bg-purple-50 rounded-lg p-6 text-center">
<div classname="text-3xl font-bold text-purple-600 mb-2" id="estimatedPremium">$0</div>
<div classname="text-sm text-muted-foreground">Est. Monthly Premium</div>
</div>
</div>
<!-- Chart Container -->
<div classname="mb-8">
<h3 classname="text-lg font-semibold text-foreground mb-4">Coverage Breakdown</h3>
<div style="height: 400px;">
<canvas id="coverageChart"></canvas>
</div>
</div>
</div>
<!-- Detailed Analysis -->
<div classname="bg-card rounded-xl shadow-lg p-8 mb-8">
<h2 classname="text-2xl font-semibold text-foreground mb-6">
<i classname="fas fa-list-alt text-primary mr-2"></i>
                        Detailed Analysis
                    </h2>
<div classname="overflow-x-auto">
<table classname="w-full table-auto">
<thead>
<tr classname="bg-background">
<th classname="px-4 py-3 text-left text-sm font-medium text-gray-700">Need Category</th>
<th classname="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
<th classname="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
</tr>
</thead>
<tbody id="analysisTable">
<!-- Populated by JavaScript -->
</tbody>
</table>
</div>
</div>
<!-- Insurance Type Comparison -->
<div classname="bg-card rounded-xl shadow-lg p-8 mb-8">
<h2 classname="text-2xl font-semibold text-foreground mb-6">
<i classname="fas fa-balance-scale text-primary mr-2"></i>
                        Insurance Type Comparison
                    </h2>
<div classname="overflow-x-auto">
<table classname="w-full table-auto">
<thead>
<tr classname="bg-background">
<th classname="px-4 py-3 text-left text-sm font-medium text-gray-700">Insurance Type</th>
<th classname="px-4 py-3 text-center text-sm font-medium text-gray-700">Term Length</th>
<th classname="px-4 py-3 text-center text-sm font-medium text-gray-700">Cash Value</th>
<th classname="px-4 py-3 text-right text-sm font-medium text-gray-700">Est. Premium</th>
<th classname="px-4 py-3 text-center text-sm font-medium text-gray-700">Best For</th>
</tr>
</thead>
<tbody id="comparisonTable">
<!-- Populated by JavaScript -->
</tbody>
</table>
</div>
</div>
<!-- Action Items -->
<div classname="bg-card rounded-xl shadow-lg p-8">
<h2 classname="text-2xl font-semibold text-foreground mb-6">
<i classname="fas fa-tasks text-primary mr-2"></i>
                        Next Steps
                    </h2>
<div classname="grid grid-cols-1 md:grid-cols-2 gap-6">
<div classname="bg-primary/5 rounded-lg p-6">
<h3 classname="text-lg font-semibold text-blue-900 mb-3">
<i classname="fas fa-phone text-primary mr-2"></i>
                                Speak with an Expert
                            </h3>
<p classname="text-gray-700 mb-4">Get personalized advice from our licensed insurance professionals.</p>
<button classname="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                                Schedule Consultation
                            </button>
</div>
<div classname="bg-trust-green/5 rounded-lg p-6">
<h3 classname="text-lg font-semibold text-green-900 mb-3">
<i classname="fas fa-search text-trust-green mr-2"></i>
                                Compare Quotes
                            </h3>
<p classname="text-gray-700 mb-4">Get quotes from multiple insurance providers to find the best rates.</p>
<button classname="w-full bg-trust-green text-primary-foreground py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                                Get Quotes
                            </button>
</div>
</div>
<div classname="mt-6 p-4 bg-yellow-50 rounded-lg">
<h4 classname="font-semibold text-yellow-900 mb-2">
<i classname="fas fa-lightbulb text-yellow-600 mr-2"></i>
                            Important Reminders
                        </h4>
<ul classname="text-sm text-yellow-800 space-y-1">
<li>â¢ Review your life insurance needs annually or after major life changes</li>
<li>â¢ Consider term life insurance for temporary needs and whole life for permanent coverage</li>
<li>â¢ Factor in inflation when calculating long-term income replacement needs</li>
<li>â¢ Don't forget to name beneficiaries and keep them updated</li>
</ul>
</div>
</div>
</div>
</div>
</div>
<script>
        // Step navigation
        let currentStep = 1;
        const totalSteps = 4;

        function showStep(step) {
            // Hide all steps
            document.querySelectorAll('.calculator-step').forEach(el => el.classList.add('hidden'));
            
            // Show current step
            document.getElementById(`step${step}`).classList.remove('hidden');
            
            // Update progress bar
            const progress = (step / totalSteps) * 100;
            document.getElementById('progressBar').style.width = `${progress}%`;
            document.getElementById('progressText').textContent = `Step ${step} of ${totalSteps}`;
            
            // Update buttons
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const calculateBtn = document.getElementById('calculateBtn');
            
            if (step === 1) {
                prevBtn.classList.add('hidden');
            } else {
                prevBtn.classList.remove('hidden');
            }
            
            if (step === totalSteps) {
                nextBtn.classList.add('hidden');
                calculateBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.remove('hidden');
                calculateBtn.classList.add('hidden');
            }
        }

        // Navigation event listeners
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            }
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });

        // Calculate coverage
        document.getElementById('calculateBtn').addEventListener('click', calculateCoverage);

        function calculateCoverage() {
            // Get input values
            const age = parseInt(document.getElementById('age').value) || 0;
            const income = parseInt(document.getElementById('income').value) || 0;
            const dependents = parseInt(document.getElementById('dependents').value) || 0;
            const mortgage = parseInt(document.getElementById('mortgage').value) || 0;
            const otherDebts = parseInt(document.getElementById('otherDebts').value) || 0;
            const finalExpenses = parseInt(document.getElementById('finalExpenses').value) || 0;
            const educationFund = parseInt(document.getElementById('educationFund').value) || 0;
            const savings = parseInt(document.getElementById('savings').value) || 0;
            const retirement = parseInt(document.getElementById('retirement').value) || 0;
            const existingInsurance = parseInt(document.getElementById('existingInsurance').value) || 0;
            const socialSecurity = parseInt(document.getElementById('socialSecurity').value) || 0;
            const incomeYears = parseInt(document.getElementById('incomeYears').value) || 10;
            const incomePercentage = parseFloat(document.getElementById('incomePercentage').value) || 0.7;
            const coverageType = document.getElementById('coverageType').value;

            // Calculate needs
            const incomeReplacement = income * incomePercentage * incomeYears;
            const debtPayoff = mortgage + otherDebts;
            const totalNeeds = incomeReplacement + debtPayoff + finalExpenses + educationFund;
            
            // Calculate available resources
            const availableResources = savings + (retirement * 0.5) + (socialSecurity * 10); // Conservative retirement access
            
            // Calculate recommended coverage
            const recommendedCoverage = Math.max(0, totalNeeds - availableResources);
            const coverageGap = Math.max(0, recommendedCoverage - existingInsurance);
            
            // Estimate premium (simplified calculation)
            const basePremium = recommendedCoverage * 0.0012; // Base rate per $1000
            const ageFactor = Math.max(1, (age - 25) / 25); // Age adjustment
            const typeFactor = coverageType === 'term' ? 1 : coverageType === 'whole' ? 3 : 2;
            const estimatedPremium = basePremium * ageFactor * typeFactor / 12;

            // Display results
            document.getElementById('recommendedCoverage').textContent = `$${recommendedCoverage.toLocaleString()}`;
            document.getElementById('currentGap').textContent = `$${coverageGap.toLocaleString()}`;
            document.getElementById('estimatedPremium').textContent = `$${Math.round(estimatedPremium)}`;

            // Show results section
            document.getElementById('results').classList.remove('hidden');
            
            // Populate analysis table
            populateAnalysisTable(incomeReplacement, debtPayoff, finalExpenses, educationFund, savings, retirement, existingInsurance);
            
            // Populate comparison table
            populateComparisonTable(recommendedCoverage, age);
            
            // Create coverage chart
            createCoverageChart(incomeReplacement, debtPayoff, finalExpenses, educationFund);
            
            // Scroll to results
            document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
        }

        function populateAnalysisTable(incomeReplacement, debtPayoff, finalExpenses, educationFund, savings, retirement, existingInsurance) {
            const tableBody = document.getElementById('analysisTable');
            const rows = [
                ['Income Replacement', `$${incomeReplacement.toLocaleString()}`, 'Years of income for family support'],
                ['Debt Payoff', `$${debtPayoff.toLocaleString()}`, 'Mortgage and other outstanding debts'],
                ['Final Expenses', `$${finalExpenses.toLocaleString()}`, 'Funeral, legal, and administrative costs'],
                ['Education Fund', `$${educationFund.toLocaleString()}`, 'Children\'s education expenses'],
                ['Available Savings', `($${savings.toLocaleString()})`, 'Current savings and investments'],
                ['Retirement Assets', `($${(retirement * 0.5).toLocaleString()})`, 'Accessible retirement funds'],
                ['Existing Coverage', `($${existingInsurance.toLocaleString()})`, 'Current life insurance policies']
            ];

            tableBody.innerHTML = rows.map(row => `
                <tr className="border-b">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">${row[0]}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-right">${row[1]}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">${row[2]}</td>
                </tr>
            `).join('');
        }

        function populateComparisonTable(coverage, age) {
            const tableBody = document.getElementById('comparisonTable');
            const basePremium = coverage * 0.0012 / 12;
            const ageFactor = Math.max(1, (age - 25) / 25);

            const types = [
                ['Term Life (20-year)', '20 years', 'No', `$${Math.round(basePremium * ageFactor)}`, 'Temporary needs, budget-conscious'],
                ['Whole Life', 'Lifetime', 'Yes', `$${Math.round(basePremium * ageFactor * 3)}`, 'Permanent coverage, estate planning'],
                ['Universal Life', 'Lifetime', 'Yes', `$${Math.round(basePremium * ageFactor * 2)}`, 'Flexible premiums, investment growth'],
                ['Variable Life', 'Lifetime', 'Yes', `$${Math.round(basePremium * ageFactor * 2.5)}`, 'Investment control, higher risk/reward']
            ];

            tableBody.innerHTML = types.map(type => `
                <tr className="border-b">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">${type[0]}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-center">${type[1]}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-center">${type[2]}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-right">${type[3]}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-center">${type[4]}</td>
                </tr>
            `).join('');
        }

        function createCoverageChart(incomeReplacement, debtPayoff, finalExpenses, educationFund) {
            const ctx = document.getElementById('coverageChart').getContext('2d');
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Income Replacement', 'Debt Payoff', 'Final Expenses', 'Education Fund'],
                    datasets: [{
                        data: [incomeReplacement, debtPayoff, finalExpenses, educationFund],
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': $' + context.parsed.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize
        showStep(1);
    </script>

    </div>
  );
};

export default LifeInsuranceCalculator;