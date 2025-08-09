import React, { useState } from 'react';

const LtcInsuranceCalculator: React.FC = () => {
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
      
 Header Section 
<header classname="bg-blue-900 text-primary-foreground py-6">
<div classname="container mx-auto px-4">
<div classname="flex items-center justify-between">
<div>
<h1 classname="text-3xl font-bold">Long-Term Care Insurance Calculator</h1>
<p classname="text-blue-200 mt-2">Plan for your future care needs with confidence</p>
</div>
<div classname="hidden md:block">
<div classname="bg-blue-800 rounded-lg p-4 text-center">
<i classname="fas fa-shield-alt text-2xl mb-2"></i>
<p classname="text-sm">Secure Your Future</p>
</div>
</div>
</div>
</div>
</header>
 Main Content 
<main classname="container mx-auto px-4 py-8">
<!-- Calculator Section -->
<div classname="bg-card rounded-lg shadow-lg p-6 mb-8">
<h2 classname="text-2xl font-bold text-gray-800 mb-6 flex items-center">
<i classname="fas fa-calculator text-primary mr-3"></i>
                LTC Insurance Cost Calculator
            </h2>
<div classname="grid md:grid-cols-2 gap-8">
<!-- Input Form -->
<div classname="space-y-6">
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Your Age</label>
<input classname="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" id="age" max="85" min="50" type="number" value="65"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Health Status</label>
<select classname="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary" id="health">
<option value="excellent">Excellent</option>
<option value="good">Good</option>
<option value="fair">Fair</option>
<option value="poor">Poor</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Daily Benefit Amount</label>
<select classname="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary" id="dailyBenefit">
<option value="100">$100/day</option>
<option value="150">$150/day</option>
<option value="200">$200/day</option>
<option value="250">$250/day</option>
<option value="300">$300/day</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Benefit Period</label>
<select classname="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary" id="benefitPeriod">
<option value="2">2 Years</option>
<option value="3">3 Years</option>
<option value="4">4 Years</option>
<option value="5">5 Years</option>
<option value="unlimited">Unlimited</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Elimination Period</label>
<select classname="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary" id="eliminationPeriod">
<option value="30">30 Days</option>
<option value="60">60 Days</option>
<option value="90">90 Days</option>
<option value="180">180 Days</option>
</select>
</div>
<button classname="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition duration-200" onclick="calculatePremium()">
                        Calculate Premium
                    </button>
</div>
<!-- Results -->
<div classname="bg-background rounded-lg p-6">
<h3 classname="text-lg font-semibold text-gray-800 mb-4">Premium Estimates</h3>
<div classname="space-y-4">
<div classname="bg-card p-4 rounded-lg border">
<div classname="flex justify-between items-center">
<span classname="text-muted-foreground">Monthly Premium</span>
<span classname="text-2xl font-bold text-primary" id="monthlyPremium">$0</span>
</div>
</div>
<div classname="bg-card p-4 rounded-lg border">
<div classname="flex justify-between items-center">
<span classname="text-muted-foreground">Annual Premium</span>
<span classname="text-xl font-semibold text-gray-800" id="annualPremium">$0</span>
</div>
</div>
<div classname="bg-card p-4 rounded-lg border">
<div classname="flex justify-between items-center">
<span classname="text-muted-foreground">Total Coverage</span>
<span classname="text-lg font-medium text-trust-green" id="totalCoverage">$0</span>
</div>
</div>
</div>
<div classname="mt-6 p-4 bg-primary/5 rounded-lg">
<h4 classname="font-semibold text-blue-800 mb-2">Premium Factors</h4>
<ul classname="text-sm text-blue-700 space-y-1">
<li>â¢ Age at application</li>
<li>â¢ Health status</li>
<li>â¢ Coverage amount</li>
<li>â¢ Benefit period</li>
<li>â¢ Elimination period</li>
</ul>
</div>
</div>
</div>
</div>
<!-- Cost Comparison Chart -->
<div classname="bg-card rounded-lg shadow-lg p-6 mb-8">
<h2 classname="text-2xl font-bold text-gray-800 mb-6 flex items-center">
<i classname="fas fa-chart-bar text-primary mr-3"></i>
                Premium Comparison by Age
            </h2>
<div classname="h-96">
<canvas id="costChart"></canvas>
</div>
</div>
<!-- Coverage Comparison Table -->
<div classname="bg-card rounded-lg shadow-lg p-6 mb-8">
<h2 classname="text-2xl font-bold text-gray-800 mb-6 flex items-center">
<i classname="fas fa-table text-primary mr-3"></i>
                Coverage Options Comparison
            </h2>
<div classname="overflow-x-auto">
<table classname="w-full border-collapse">
<thead>
<tr classname="bg-primary/5">
<th classname="border border-input px-4 py-3 text-left font-semibold text-gray-700">Plan Type</th>
<th classname="border border-input px-4 py-3 text-center font-semibold text-gray-700">Daily Benefit</th>
<th classname="border border-input px-4 py-3 text-center font-semibold text-gray-700">Benefit Period</th>
<th classname="border border-input px-4 py-3 text-center font-semibold text-gray-700">Elimination Period</th>
<th classname="border border-input px-4 py-3 text-center font-semibold text-gray-700">Est. Monthly Premium</th>
<th classname="border border-input px-4 py-3 text-center font-semibold text-gray-700">Total Coverage</th>
</tr>
</thead>
<tbody>
<tr classname="hover:bg-background">
<td classname="border border-input px-4 py-3 font-medium">Basic Plan</td>
<td classname="border border-input px-4 py-3 text-center">$150</td>
<td classname="border border-input px-4 py-3 text-center">3 Years</td>
<td classname="border border-input px-4 py-3 text-center">90 Days</td>
<td classname="border border-input px-4 py-3 text-center font-semibold text-primary">$185</td>
<td classname="border border-input px-4 py-3 text-center">$164,250</td>
</tr>
<tr classname="hover:bg-background bg-yellow-50">
<td classname="border border-input px-4 py-3 font-medium">Standard Plan</td>
<td classname="border border-input px-4 py-3 text-center">$200</td>
<td classname="border border-input px-4 py-3 text-center">4 Years</td>
<td classname="border border-input px-4 py-3 text-center">90 Days</td>
<td classname="border border-input px-4 py-3 text-center font-semibold text-primary">$265</td>
<td classname="border border-input px-4 py-3 text-center">$292,000</td>
</tr>
<tr classname="hover:bg-background">
<td classname="border border-input px-4 py-3 font-medium">Premium Plan</td>
<td classname="border border-input px-4 py-3 text-center">$250</td>
<td classname="border border-input px-4 py-3 text-center">5 Years</td>
<td classname="border border-input px-4 py-3 text-center">60 Days</td>
<td classname="border border-input px-4 py-3 text-center font-semibold text-primary">$385</td>
<td classname="border border-input px-4 py-3 text-center">$456,250</td>
</tr>
<tr classname="hover:bg-background">
<td classname="border border-input px-4 py-3 font-medium">Comprehensive Plan</td>
<td classname="border border-input px-4 py-3 text-center">$300</td>
<td classname="border border-input px-4 py-3 text-center">Unlimited</td>
<td classname="border border-input px-4 py-3 text-center">30 Days</td>
<td classname="border border-input px-4 py-3 text-center font-semibold text-primary">$520</td>
<td classname="border border-input px-4 py-3 text-center">Unlimited</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Care Cost Analysis -->
<div classname="bg-card rounded-lg shadow-lg p-6 mb-8">
<h2 classname="text-2xl font-bold text-gray-800 mb-6 flex items-center">
<i classname="fas fa-chart-pie text-primary mr-3"></i>
                Average Care Costs by Setting
            </h2>
<div classname="grid md:grid-cols-2 gap-8">
<div>
<h3 classname="text-lg font-semibold text-gray-700 mb-4">National Average Daily Costs</h3>
<div classname="space-y-3">
<div classname="flex justify-between items-center p-3 bg-background rounded-lg">
<span classname="text-muted-foreground">Home Health Aide</span>
<span classname="font-semibold text-trust-green">$61/day</span>
</div>
<div classname="flex justify-between items-center p-3 bg-background rounded-lg">
<span classname="text-muted-foreground">Adult Day Care</span>
<span classname="font-semibold text-primary">$78/day</span>
</div>
<div classname="flex justify-between items-center p-3 bg-background rounded-lg">
<span classname="text-muted-foreground">Assisted Living</span>
<span classname="font-semibold text-orange-600">$148/day</span>
</div>
<div classname="flex justify-between items-center p-3 bg-background rounded-lg">
<span classname="text-muted-foreground">Nursing Home (Private)</span>
<span classname="font-semibold text-red-600">$297/day</span>
</div>
</div>
</div>
<div>
<div classname="h-64">
<canvas id="costBreakdownChart"></canvas>
</div>
</div>
</div>
</div>
<!-- Key Considerations -->
<div classname="bg-card rounded-lg shadow-lg p-6">
<h2 classname="text-2xl font-bold text-gray-800 mb-6 flex items-center">
<i classname="fas fa-lightbulb text-primary mr-3"></i>
                Key Considerations
            </h2>
<div classname="grid md:grid-cols-2 gap-6">
<div>
<h3 classname="text-lg font-semibold text-gray-700 mb-3">When to Buy</h3>
<ul classname="space-y-2 text-muted-foreground">
<li classname="flex items-start">
<i classname="fas fa-check text-green-500 mt-1 mr-2"></i>
<span>Ages 50-65 for best rates</span>
</li>
<li classname="flex items-start">
<i classname="fas fa-check text-green-500 mt-1 mr-2"></i>
<span>While in good health</span>
</li>
<li classname="flex items-start">
<i classname="fas fa-check text-green-500 mt-1 mr-2"></i>
<span>Before retirement</span>
</li>
<li classname="flex items-start">
<i classname="fas fa-check text-green-500 mt-1 mr-2"></i>
<span>When you have stable income</span>
</li>
</ul>
</div>
<div>
<h3 classname="text-lg font-semibold text-gray-700 mb-3">Policy Features</h3>
<ul classname="space-y-2 text-muted-foreground">
<li classname="flex items-start">
<i classname="fas fa-star text-yellow-500 mt-1 mr-2"></i>
<span>Inflation protection</span>
</li>
<li classname="flex items-start">
<i classname="fas fa-star text-yellow-500 mt-1 mr-2"></i>
<span>Shared care benefits</span>
</li>
<li classname="flex items-start">
<i classname="fas fa-star text-yellow-500 mt-1 mr-2"></i>
<span>Return of premium</span>
</li>
<li classname="flex items-start">
<i classname="fas fa-star text-yellow-500 mt-1 mr-2"></i>
<span>Waiver of premium</span>
</li>
</ul>
</div>
</div>
</div>
</main>
 Footer 
<footer classname="bg-gray-800 text-primary-foreground py-8 mt-12">
<div classname="container mx-auto px-4 text-center">
<p classname="text-gray-400">This calculator provides estimates only. Actual premiums may vary based on individual circumstances and insurance company underwriting.</p>
</div>
</footer>
<script>
        // Premium calculation function
        function calculatePremium() {
            const age = parseInt(document.getElementById('age').value);
            const health = document.getElementById('health').value;
            const dailyBenefit = parseInt(document.getElementById('dailyBenefit').value);
            const benefitPeriod = document.getElementById('benefitPeriod').value;
            const eliminationPeriod = parseInt(document.getElementById('eliminationPeriod').value);
            
            // Base premium calculation
            let basePremium = 50;
            
            // Age factor
            if (age < 55) basePremium *= 0.8;
            else if (age < 60) basePremium *= 1.0;
            else if (age < 65) basePremium *= 1.3;
            else if (age < 70) basePremium *= 1.7;
            else basePremium *= 2.2;
            
            // Health factor
            const healthMultiplier = {
                excellent: 1.0,
                good: 1.1,
                fair: 1.3,
                poor: 1.6
            };
            basePremium *= healthMultiplier[health];
            
            // Daily benefit factor
            basePremium *= (dailyBenefit / 150);
            
            // Benefit period factor
            const benefitMultiplier = {
                '2': 0.8,
                '3': 1.0,
                '4': 1.2,
                '5': 1.4,
                'unlimited': 1.8
            };
            basePremium *= benefitMultiplier[benefitPeriod];
            
            // Elimination period factor
            if (eliminationPeriod === 30) basePremium *= 1.2;
            else if (eliminationPeriod === 60) basePremium *= 1.1;
            else if (eliminationPeriod === 90) basePremium *= 1.0;
            else basePremium *= 0.9;
            
            const monthlyPremium = Math.round(basePremium);
            const annualPremium = monthlyPremium * 12;
            
            // Calculate total coverage
            let totalCoverage;
            if (benefitPeriod === 'unlimited') {
                totalCoverage = 'Unlimited';
            } else {
                totalCoverage = dailyBenefit * 365 * parseInt(benefitPeriod);
            }
            
            // Update display
            document.getElementById('monthlyPremium').textContent = '$' + monthlyPremium.toLocaleString();
            document.getElementById('annualPremium').textContent = '$' + annualPremium.toLocaleString();
            document.getElementById('totalCoverage').textContent = totalCoverage === 'Unlimited' ? 'Unlimited' : '$' + totalCoverage.toLocaleString();
        }
        
        // Initialize charts
        function initCharts() {
            // Cost comparison chart
            const costCtx = document.getElementById('costChart').getContext('2d');
            new Chart(costCtx, {
                type: 'line',
                data: {
                    labels: ['Age 50', 'Age 55', 'Age 60', 'Age 65', 'Age 70', 'Age 75'],
                    datasets: [{
                        label: 'Monthly Premium',
                        data: [120, 150, 195, 255, 340, 450],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        }
                    }
                }
            });
            
            // Cost breakdown chart
            const breakdownCtx = document.getElementById('costBreakdownChart').getContext('2d');
            new Chart(breakdownCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Home Health Aide', 'Adult Day Care', 'Assisted Living', 'Nursing Home'],
                    datasets: [{
                        data: [61, 78, 148, 297],
                        backgroundColor: [
                            '#10B981',
                            '#3B82F6',
                            '#F59E0B',
                            '#EF4444'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            calculatePremium();
            initCharts();
        });
    </script>

    </div>
  );
};

export default LtcInsuranceCalculator;