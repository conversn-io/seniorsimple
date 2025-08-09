import React, { useState } from 'react';

const DisabilityInsuranceCalculator: React.FC = () => {
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
      
 Header 
<header classname="bg-card shadow-sm border-b">
<div classname="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div classname="flex justify-between items-center h-16">
<div classname="flex items-center">
<i classname="fas fa-shield-alt text-primary text-2xl mr-3"></i>
        <h1 classname="text-xl font-bold text-foreground">SeniorSimple</h1>
</div>
<nav classname="flex space-x-8">
<a classname="text-muted-foreground hover:text-primary" href="#">Tools</a>
<a classname="text-muted-foreground hover:text-primary" href="#">Guides</a>
<a classname="text-muted-foreground hover:text-primary" href="#">Contact</a>
</nav>
</div>
</div>
</header>
 Main Content 
<main classname="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<!-- Page Header -->
<div classname="text-center mb-12">
<h1 classname="text-4xl font-bold text-foreground mb-4">
<i classname="fas fa-calculator text-primary mr-3"></i>
                Disability Insurance Calculator
            </h1>
<p classname="text-xl text-muted-foreground max-w-3xl mx-auto">
                Determine how much disability insurance coverage you need to protect your income and maintain your financial security.
            </p>
</div>
<!-- Calculator Section -->
<div classname="grid lg:grid-cols-3 gap-8 mb-12">
<!-- Input Form -->
<div classname="lg:col-span-1">
<div classname="calculator-card rounded-lg p-6 shadow-lg">
<h2 classname="text-2xl font-bold mb-6">
<i classname="fas fa-edit mr-2"></i>
                        Your Information
                    </h2>
<div classname="space-y-4">
<div>
<label classname="block text-sm font-medium mb-2">Annual Income</label>
<input classname="w-full px-3 py-2 border border-input rounded-md text-foreground" id="annualIncome" placeholder="85000" type="number" value="85000"/>
</div>
<div>
<label classname="block text-sm font-medium mb-2">Current Age</label>
<input classname="w-full px-3 py-2 border border-input rounded-md text-foreground" id="currentAge" placeholder="45" type="number" value="45"/>
</div>
<div>
<label classname="block text-sm font-medium mb-2">Monthly Expenses</label>
<input classname="w-full px-3 py-2 border border-input rounded-md text-foreground" id="monthlyExpenses" placeholder="4500" type="number" value="4500"/>
</div>
<div>
<label classname="block text-sm font-medium mb-2">Coverage Percentage</label>
<select classname="w-full px-3 py-2 border border-input rounded-md text-foreground" id="coveragePercent">
<option value="60">60% of Income</option>
<option selected="" value="70">70% of Income</option>
<option value="80">80% of Income</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium mb-2">Elimination Period</label>
<select classname="w-full px-3 py-2 border border-input rounded-md text-foreground" id="eliminationPeriod">
<option value="30">30 Days</option>
<option value="60">60 Days</option>
<option selected="" value="90">90 Days</option>
<option value="180">180 Days</option>
<option value="365">365 Days</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium mb-2">Benefit Period</label>
<select classname="w-full px-3 py-2 border border-input rounded-md text-foreground" id="benefitPeriod">
<option value="2">2 Years</option>
<option selected="" value="5">5 Years</option>
<option value="10">10 Years</option>
<option value="65">To Age 65</option>
</select>
</div>
<button classname="w-full bg-card text-primary py-3 px-6 rounded-md font-semibold hover:bg-muted transition duration-200" onclick="calculateDisability()">
                            Calculate Coverage Needs
                        </button>
</div>
</div>
</div>
<!-- Results -->
<div classname="lg:col-span-2">
<div classname="result-card rounded-lg p-6 shadow-lg mb-6">
<h2 classname="text-2xl font-bold mb-6">
<i classname="fas fa-chart-line mr-2"></i>
                        Your Coverage Recommendation
                    </h2>
<div classname="grid md:grid-cols-2 gap-6">
<div classname="bg-card bg-opacity-20 rounded-lg p-4">
<h3 classname="text-lg font-semibold mb-2">Monthly Benefit Amount</h3>
<p classname="text-3xl font-bold" id="monthlyBenefit">$4,958</p>
<p classname="text-sm opacity-80">70% of monthly income</p>
</div>
<div classname="bg-card bg-opacity-20 rounded-lg p-4">
<h3 classname="text-lg font-semibold mb-2">Estimated Monthly Premium</h3>
<p classname="text-3xl font-bold" id="estimatedPremium">$148</p>
<p classname="text-sm opacity-80">Based on your age and coverage</p>
</div>
<div classname="bg-card bg-opacity-20 rounded-lg p-4">
<h3 classname="text-lg font-semibold mb-2">Total Annual Premium</h3>
<p classname="text-3xl font-bold" id="annualPremium">$1,776</p>
<p classname="text-sm opacity-80">2.1% of annual income</p>
</div>
<div classname="bg-card bg-opacity-20 rounded-lg p-4">
<h3 classname="text-lg font-semibold mb-2">Coverage Gap</h3>
<p classname="text-3xl font-bold" id="coverageGap">$458</p>
<p classname="text-sm opacity-80">Monthly expenses not covered</p>
</div>
</div>
</div>
<!-- Chart -->
<div classname="bg-card rounded-lg p-6 shadow-lg">
<h3 classname="text-xl font-bold mb-4">Coverage vs. Expenses Breakdown</h3>
<div classname="chart-container">
<canvas id="coverageChart"></canvas>
</div>
</div>
</div>
</div>
<!-- Benefit Analysis Table -->
<div classname="bg-card rounded-lg shadow-lg p-6 mb-12 benefit-table">
<h2 classname="text-2xl font-bold mb-6">
<i classname="fas fa-table mr-2"></i>
                Benefit Analysis Comparison
            </h2>
<div classname="overflow-x-auto">
<table classname="w-full border-collapse border border-border">
<thead>
<tr classname="bg-background">
<th classname="border border-border px-4 py-3 text-left font-semibold">Coverage Option</th>
<th classname="border border-border px-4 py-3 text-left font-semibold">Monthly Benefit</th>
<th classname="border border-border px-4 py-3 text-left font-semibold">Annual Premium</th>
<th classname="border border-border px-4 py-3 text-left font-semibold">Premium % of Income</th>
<th classname="border border-border px-4 py-3 text-left font-semibold">Coverage Gap</th>
</tr>
</thead>
<tbody id="benefitTable">
<tr>
<td classname="border border-border px-4 py-3 font-medium">60% Coverage</td>
<td classname="border border-border px-4 py-3">$4,250</td>
<td classname="border border-border px-4 py-3">$1,530</td>
<td classname="border border-border px-4 py-3">1.8%</td>
<td classname="border border-border px-4 py-3 text-red-600">$250</td>
</tr>
<tr classname="bg-primary/5">
<td classname="border border-border px-4 py-3 font-medium">70% Coverage (Recommended)</td>
<td classname="border border-border px-4 py-3 font-bold">$4,958</td>
<td classname="border border-border px-4 py-3 font-bold">$1,776</td>
<td classname="border border-border px-4 py-3 font-bold">2.1%</td>
<td classname="border border-border px-4 py-3 text-trust-green font-bold">Minimal</td>
</tr>
<tr>
<td classname="border border-border px-4 py-3 font-medium">80% Coverage</td>
<td classname="border border-border px-4 py-3">$5,667</td>
<td classname="border border-border px-4 py-3">$2,040</td>
<td classname="border border-border px-4 py-3">2.4%</td>
<td classname="border border-border px-4 py-3 text-trust-green">Surplus</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Elimination Period Impact -->
<div classname="bg-card rounded-lg shadow-lg p-6 mb-12">
<h2 classname="text-2xl font-bold mb-6">
<i classname="fas fa-clock mr-2"></i>
                Elimination Period Impact
            </h2>
<div classname="grid md:grid-cols-2 gap-6">
<div>
<h3 classname="text-lg font-semibold mb-4">Premium Savings by Elimination Period</h3>
<div classname="space-y-3">
<div classname="flex justify-between items-center p-3 bg-background rounded">
<span>30 Days</span>
<span classname="font-bold text-red-600">$220/month</span>
</div>
<div classname="flex justify-between items-center p-3 bg-background rounded">
<span>60 Days</span>
<span classname="font-bold text-orange-600">$185/month</span>
</div>
<div classname="flex justify-between items-center p-3 bg-primary/5 rounded border-2 border-primary/20">
<span>90 Days (Selected)</span>
<span classname="font-bold text-primary">$148/month</span>
</div>
<div classname="flex justify-between items-center p-3 bg-background rounded">
<span>180 Days</span>
<span classname="font-bold text-trust-green">$98/month</span>
</div>
<div classname="flex justify-between items-center p-3 bg-background rounded">
<span>365 Days</span>
<span classname="font-bold text-green-700">$65/month</span>
</div>
</div>
</div>
<div>
<h3 classname="text-lg font-semibold mb-4">Key Considerations</h3>
<div classname="space-y-4">
<div classname="flex items-start space-x-3">
<i classname="fas fa-check-circle text-trust-green mt-1"></i>
<div>
<h4 classname="font-semibold">Emergency Fund Coverage</h4>
<p classname="text-sm text-muted-foreground">Ensure you have savings to cover expenses during elimination period</p>
</div>
</div>
<div classname="flex items-start space-x-3">
<i classname="fas fa-check-circle text-trust-green mt-1"></i>
<div>
<h4 classname="font-semibold">Employer Benefits</h4>
<p classname="text-sm text-muted-foreground">Check if your employer provides short-term disability coverage</p>
</div>
</div>
<div classname="flex items-start space-x-3">
<i classname="fas fa-check-circle text-trust-green mt-1"></i>
<div>
<h4 classname="font-semibold">Premium Savings</h4>
<p classname="text-sm text-muted-foreground">Longer elimination periods significantly reduce premium costs</p>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Features Comparison -->
<div classname="bg-card rounded-lg shadow-lg p-6 mb-12">
<h2 classname="text-2xl font-bold mb-6">
<i classname="fas fa-list-check mr-2"></i>
                Policy Features Comparison
            </h2>
<div classname="overflow-x-auto">
<table classname="w-full border-collapse border border-border">
<thead>
<tr classname="bg-background">
<th classname="border border-border px-4 py-3 text-left font-semibold">Feature</th>
<th classname="border border-border px-4 py-3 text-center font-semibold">Basic</th>
<th classname="border border-border px-4 py-3 text-center font-semibold">Standard</th>
<th classname="border border-border px-4 py-3 text-center font-semibold">Premium</th>
</tr>
</thead>
<tbody>
<tr>
<td classname="border border-border px-4 py-3 font-medium">Own Occupation Coverage</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-times text-red-600"></i>
</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-check text-trust-green"></i>
</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-check text-trust-green"></i>
</td>
</tr>
<tr classname="bg-background">
<td classname="border border-border px-4 py-3 font-medium">Partial Disability Benefits</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-times text-red-600"></i>
</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-check text-trust-green"></i>
</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-check text-trust-green"></i>
</td>
</tr>
<tr>
<td classname="border border-border px-4 py-3 font-medium">Cost of Living Adjustment</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-times text-red-600"></i>
</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-times text-red-600"></i>
</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-check text-trust-green"></i>
</td>
</tr>
<tr classname="bg-background">
<td classname="border border-border px-4 py-3 font-medium">Future Increase Option</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-times text-red-600"></i>
</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-check text-trust-green"></i>
</td>
<td classname="border border-border px-4 py-3 text-center">
<i classname="fas fa-check text-trust-green"></i>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Action Steps -->
<div classname="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-primary-foreground">
<h2 classname="text-2xl font-bold mb-6">
<i classname="fas fa-route mr-2"></i>
                Next Steps
            </h2>
<div classname="grid md:grid-cols-3 gap-6">
<div classname="text-center">
<i classname="fas fa-search text-4xl mb-4 opacity-80"></i>
<h3 classname="text-lg font-semibold mb-2">Research Carriers</h3>
<p classname="text-sm opacity-90">Compare quotes from multiple insurance companies</p>
</div>
<div classname="text-center">
<i classname="fas fa-user-tie text-4xl mb-4 opacity-80"></i>
<h3 classname="text-lg font-semibold mb-2">Consult an Agent</h3>
<p classname="text-sm opacity-90">Work with a licensed insurance professional</p>
</div>
<div classname="text-center">
<i classname="fas fa-file-contract text-4xl mb-4 opacity-80"></i>
<h3 classname="text-lg font-semibold mb-2">Apply for Coverage</h3>
<p classname="text-sm opacity-90">Complete the application and medical underwriting</p>
</div>
</div>
<div classname="mt-8 text-center">
<button classname="bg-card text-primary px-8 py-3 rounded-lg font-semibold hover:bg-muted transition duration-200">
                    Get Free Quote
                </button>
</div>
</div>
</main>
 Footer 
<footer classname="bg-gray-800 text-primary-foreground py-12 mt-16">
<div classname="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div classname="grid md:grid-cols-4 gap-8">
<div>
        <h3 classname="text-lg font-semibold mb-4">SeniorSimple</h3>
<p classname="text-gray-400">Your trusted partner for retirement planning and financial security.</p>
</div>
<div>
<h4 classname="font-semibold mb-4">Tools</h4>
<ul classname="space-y-2 text-gray-400">
<li><a classname="hover:text-primary-foreground" href="#">Retirement Calculator</a></li>
<li><a classname="hover:text-primary-foreground" href="#">Social Security Optimizer</a></li>
<li><a classname="hover:text-primary-foreground" href="#">Medicare Planner</a></li>
</ul>
</div>
<div>
<h4 classname="font-semibold mb-4">Resources</h4>
<ul classname="space-y-2 text-gray-400">
<li><a classname="hover:text-primary-foreground" href="#">Planning Guides</a></li>
<li><a classname="hover:text-primary-foreground" href="#">Educational Articles</a></li>
<li><a classname="hover:text-primary-foreground" href="#">Webinars</a></li>
</ul>
</div>
<div>
<h4 classname="font-semibold mb-4">Contact</h4>
<ul classname="space-y-2 text-gray-400">
<li>1-800-RETIRE-1</li>
            <li>info@seniorsimple.com</li>
<li>Mon-Fri 9AM-6PM EST</li>
</ul>
</div>
</div>
<div classname="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
        <p>© 2024 SeniorSimple. All rights reserved.</p>
</div>
</div>
</footer>
<script>
        let coverageChart;

        function calculateDisability() {
            const income = parseFloat(document.getElementById('annualIncome').value) || 85000;
            const age = parseInt(document.getElementById('currentAge').value) || 45;
            const expenses = parseFloat(document.getElementById('monthlyExpenses').value) || 4500;
            const coveragePercent = parseFloat(document.getElementById('coveragePercent').value) || 70;
            const eliminationPeriod = parseInt(document.getElementById('eliminationPeriod').value) || 90;
            
            const monthlyIncome = income / 12;
            const monthlyBenefit = monthlyIncome * (coveragePercent / 100);
            const coverageGap = Math.max(0, expenses - monthlyBenefit);
            
            // Premium calculation (simplified)
            let basePremium = monthlyBenefit * 0.03; // 3% of monthly benefit
            
            // Age factor
            if (age >= 50) basePremium *= 1.3;
            else if (age >= 40) basePremium *= 1.1;
            
            // Elimination period factor
            if (eliminationPeriod <= 30) basePremium *= 1.5;
            else if (eliminationPeriod <= 60) basePremium *= 1.25;
            else if (eliminationPeriod <= 90) basePremium *= 1.0;
            else if (eliminationPeriod <= 180) basePremium *= 0.75;
            else basePremium *= 0.5;
            
            const annualPremium = basePremium * 12;
            const premiumPercent = (annualPremium / income * 100).toFixed(1);
            
            // Update results
            document.getElementById('monthlyBenefit').textContent = `$${monthlyBenefit.toLocaleString()}`;
            document.getElementById('estimatedPremium').textContent = `$${Math.round(basePremium).toLocaleString()}`;
            document.getElementById('annualPremium').textContent = `$${Math.round(annualPremium).toLocaleString()}`;
            document.getElementById('coverageGap').textContent = coverageGap > 0 ? `$${Math.round(coverageGap).toLocaleString()}` : 'Covered';
            
            // Update chart
            updateChart(monthlyBenefit, expenses, coverageGap);
            
            // Update benefit table
            updateBenefitTable(income, expenses, age, eliminationPeriod);
        }

        function updateChart(monthlyBenefit, expenses, gap) {
            const ctx = document.getElementById('coverageChart').getContext('2d');
            
            if (coverageChart) {
                coverageChart.destroy();
            }
            
            coverageChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Covered by Insurance', 'Coverage Gap', 'Surplus'],
                    datasets: [{
                        data: [
                            monthlyBenefit,
                            gap,
                            Math.max(0, monthlyBenefit - expenses)
                        ],
                        backgroundColor: [
                            '#10B981',
                            '#EF4444',
                            '#3B82F6'
                        ],
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
                        }
                    }
                }
            });
        }

        function updateBenefitTable(income, expenses, age, eliminationPeriod) {
            const monthlyIncome = income / 12;
            const tbody = document.getElementById('benefitTable');
            
            const coverageOptions = [
                { percent: 60, label: '60% Coverage' },
                { percent: 70, label: '70% Coverage (Recommended)' },
                { percent: 80, label: '80% Coverage' }
            ];
            
            tbody.innerHTML = '';
            
            coverageOptions.forEach((option, index) => {
                const monthlyBenefit = monthlyIncome * (option.percent / 100);
                const gap = Math.max(0, expenses - monthlyBenefit);
                
                // Premium calculation
                let basePremium = monthlyBenefit * 0.03;
                if (age >= 50) basePremium *= 1.3;
                else if (age >= 40) basePremium *= 1.1;
                
                if (eliminationPeriod <= 30) basePremium *= 1.5;
                else if (eliminationPeriod <= 60) basePremium *= 1.25;
                else if (eliminationPeriod <= 90) basePremium *= 1.0;
                else if (eliminationPeriod <= 180) basePremium *= 0.75;
                else basePremium *= 0.5;
                
                const annualPremium = basePremium * 12;
                const premiumPercent = (annualPremium / income * 100).toFixed(1);
                
                const row = document.createElement('tr');
                if (index === 1) row.classList.add('bg-primary/5');
                
                row.innerHTML = `
                    <td className="border border-border px-4 py-3 font-medium">${option.label}</td>
                    <td className="border border-border px-4 py-3 ${index === 1 ? 'font-bold' : ''}">$${Math.round(monthlyBenefit).toLocaleString()}</td>
                    <td className="border border-border px-4 py-3 ${index === 1 ? 'font-bold' : ''}">$${Math.round(annualPremium).toLocaleString()}</td>
                    <td className="border border-border px-4 py-3 ${index === 1 ? 'font-bold' : ''}">${premiumPercent}%</td>
                    <td className="border border-border px-4 py-3 ${gap > 0 ? 'text-red-600' : 'text-trust-green'} ${index === 1 ? 'font-bold' : ''}">
                        ${gap > 0 ? `$${Math.round(gap).toLocaleString()}` : (monthlyBenefit > expenses ? 'Surplus' : 'Minimal')}
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        }

        // Initialize calculator on page load
        document.addEventListener('DOMContentLoaded', function() {
            calculateDisability();
            
            // Add event listeners to inputs
            ['annualIncome', 'currentAge', 'monthlyExpenses', 'coveragePercent', 'eliminationPeriod', 'benefitPeriod'].forEach(id => {
                document.getElementById(id).addEventListener('input', calculateDisability);
            });
        });
    </script>

    </div>
  );
};

export default DisabilityInsuranceCalculator;