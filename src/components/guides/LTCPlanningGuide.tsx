import React, { useState } from 'react';

const LtcPlanningGuide: React.FC = () => {
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
<header classname="bg-blue-900 text-primary-foreground py-12">
<div classname="container mx-auto px-4">
<div classname="max-w-4xl mx-auto text-center">
<h1 classname="text-4xl md:text-5xl font-bold mb-4">Long-Term Care Planning Guide</h1>
<p classname="text-xl text-blue-200 mb-6">Comprehensive strategies for planning and funding your future care needs</p>
<div classname="flex justify-center space-x-8 text-sm">
<div classname="flex items-center">
<i classname="fas fa-clock mr-2"></i>
<span>15 min read</span>
</div>
<div classname="flex items-center">
<i classname="fas fa-user-md mr-2"></i>
<span>Healthcare Planning</span>
</div>
<div classname="flex items-center">
<i classname="fas fa-chart-line mr-2"></i>
<span>Intermediate</span>
</div>
</div>
</div>
</div>
</header>
 Navigation Pills 
<nav classname="bg-card shadow-sm border-b sticky top-0 z-10">
<div classname="container mx-auto px-4">
<div classname="flex justify-center space-x-1 py-4">
<button classname="nav-pill active" data-section="overview">Overview</button>
<button classname="nav-pill" data-section="care-options">Care Options</button>
<button classname="nav-pill" data-section="funding">Funding Strategies</button>
<button classname="nav-pill" data-section="costs">Cost Analysis</button>
<button classname="nav-pill" data-section="planning">Action Plan</button>
</div>
</div>
</nav>
 Main Content 
<main classname="container mx-auto px-4 py-8">
<!-- Overview Section -->
<section classname="content-section" id="overview">
<div classname="max-w-4xl mx-auto">
<div classname="bg-card rounded-lg shadow-lg p-8 mb-8">
<h2 classname="text-3xl font-bold mb-6 text-blue-900">Why Long-Term Care Planning Matters</h2>
<div classname="grid md:grid-cols-2 gap-8">
<div>
<h3 classname="text-xl font-semibold mb-4 text-gray-800">The Reality of Care Needs</h3>
<ul classname="space-y-3 text-gray-700">
<li classname="flex items-start">
<i classname="fas fa-check text-green-500 mr-3 mt-1"></i>
<span>70% of people over 65 will need some form of long-term care</span>
</li>
<li classname="flex items-start">
<i classname="fas fa-check text-green-500 mr-3 mt-1"></i>
<span>Average care duration is 3 years</span>
</li>
<li classname="flex items-start">
<i classname="fas fa-check text-green-500 mr-3 mt-1"></i>
<span>Medicare covers very limited long-term care</span>
</li>
<li classname="flex items-start">
<i classname="fas fa-check text-green-500 mr-3 mt-1"></i>
<span>Costs can quickly deplete retirement savings</span>
</li>
</ul>
</div>
<div classname="bg-primary/5 p-6 rounded-lg">
<h3 classname="text-xl font-semibold mb-4 text-blue-900">Key Statistics</h3>
<div classname="space-y-4">
<div classname="flex justify-between items-center">
<span classname="text-gray-700">Home Care (per hour)</span>
<span classname="font-semibold text-blue-900">$25-35</span>
</div>
<div classname="flex justify-between items-center">
<span classname="text-gray-700">Assisted Living (monthly)</span>
<span classname="font-semibold text-blue-900">$4,500</span>
</div>
<div classname="flex justify-between items-center">
<span classname="text-gray-700">Nursing Home (monthly)</span>
<span classname="font-semibold text-blue-900">$8,500</span>
</div>
<div classname="flex justify-between items-center">
<span classname="text-gray-700">Memory Care (monthly)</span>
<span classname="font-semibold text-blue-900">$6,000</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Care Options Section -->
<section classname="content-section hidden" id="care-options">
<div classname="max-w-6xl mx-auto">
<h2 classname="text-3xl font-bold mb-8 text-blue-900 text-center">Long-Term Care Options</h2>
<!-- Care Options Comparison Table -->
<div classname="bg-card rounded-lg shadow-lg overflow-hidden mb-8">
<div classname="overflow-x-auto">
<table classname="w-full">
<thead classname="bg-blue-900 text-primary-foreground">
<tr>
<th classname="px-6 py-4 text-left">Care Type</th>
<th classname="px-6 py-4 text-left">Setting</th>
<th classname="px-6 py-4 text-left">Services Included</th>
<th classname="px-6 py-4 text-left">Average Cost</th>
<th classname="px-6 py-4 text-left">Best For</th>
</tr>
</thead>
<tbody classname="divide-y divide-gray-200">
<tr classname="hover:bg-background">
<td classname="px-6 py-4 font-semibold text-blue-900">Home Care</td>
<td classname="px-6 py-4 text-gray-700">Your Home</td>
<td classname="px-6 py-4 text-gray-700">
<ul classname="text-sm space-y-1">
<li>â¢ Personal care assistance</li>
<li>â¢ Meal preparation</li>
<li>â¢ Light housekeeping</li>
<li>â¢ Companionship</li>
</ul>
</td>
<td classname="px-6 py-4 text-gray-700">$25-35/hour</td>
<td classname="px-6 py-4 text-gray-700">Those who want to stay home with minimal care needs</td>
</tr>
<tr classname="hover:bg-background">
<td classname="px-6 py-4 font-semibold text-blue-900">Adult Day Care</td>
<td classname="px-6 py-4 text-gray-700">Day Center</td>
<td classname="px-6 py-4 text-gray-700">
<ul classname="text-sm space-y-1">
<li>â¢ Supervised activities</li>
<li>â¢ Meals and snacks</li>
<li>â¢ Health monitoring</li>
<li>â¢ Social interaction</li>
</ul>
</td>
<td classname="px-6 py-4 text-gray-700">$70-100/day</td>
<td classname="px-6 py-4 text-gray-700">Those needing daytime supervision while caregiver works</td>
</tr>
<tr classname="hover:bg-background">
<td classname="px-6 py-4 font-semibold text-blue-900">Assisted Living</td>
<td classname="px-6 py-4 text-gray-700">Residential Facility</td>
<td classname="px-6 py-4 text-gray-700">
<ul classname="text-sm space-y-1">
<li>â¢ 24/7 staff availability</li>
<li>â¢ Meals and housekeeping</li>
<li>â¢ Medication management</li>
<li>â¢ Social activities</li>
</ul>
</td>
<td classname="px-6 py-4 text-gray-700">$4,500/month</td>
<td classname="px-6 py-4 text-gray-700">Those needing daily assistance but not medical care</td>
</tr>
<tr classname="hover:bg-background">
<td classname="px-6 py-4 font-semibold text-blue-900">Memory Care</td>
<td classname="px-6 py-4 text-gray-700">Specialized Unit</td>
<td classname="px-6 py-4 text-gray-700">
<ul classname="text-sm space-y-1">
<li>â¢ Secure environment</li>
<li>â¢ Specialized staff training</li>
<li>â¢ Cognitive activities</li>
<li>â¢ Behavior management</li>
</ul>
</td>
<td classname="px-6 py-4 text-gray-700">$6,000/month</td>
<td classname="px-6 py-4 text-gray-700">Those with dementia or Alzheimer's disease</td>
</tr>
<tr classname="hover:bg-background">
<td classname="px-6 py-4 font-semibold text-blue-900">Nursing Home</td>
<td classname="px-6 py-4 text-gray-700">Skilled Nursing Facility</td>
<td classname="px-6 py-4 text-gray-700">
<ul classname="text-sm space-y-1">
<li>â¢ 24/7 skilled nursing</li>
<li>â¢ Medical care</li>
<li>â¢ Rehabilitation services</li>
<li>â¢ All personal care</li>
</ul>
</td>
<td classname="px-6 py-4 text-gray-700">$8,500/month</td>
<td classname="px-6 py-4 text-gray-700">Those requiring skilled medical care and supervision</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Care Level Assessment -->
<div classname="bg-card rounded-lg shadow-lg p-8">
<h3 classname="text-2xl font-bold mb-6 text-blue-900">Assess Your Care Needs</h3>
<div classname="grid md:grid-cols-3 gap-6">
<div classname="bg-trust-green/5 p-6 rounded-lg">
<div classname="flex items-center mb-4">
<i classname="fas fa-home text-trust-green text-2xl mr-3"></i>
<h4 classname="font-semibold text-green-900">Minimal Care</h4>
</div>
<ul classname="text-sm text-green-800 space-y-2">
<li>â¢ Independent with daily activities</li>
<li>â¢ Occasional help with chores</li>
<li>â¢ Transportation assistance</li>
<li>â¢ Social interaction needs</li>
</ul>
<div classname="mt-4 text-sm font-semibold text-green-900">Best Options: Home Care, Adult Day Care</div>
</div>
<div classname="bg-yellow-50 p-6 rounded-lg">
<div classname="flex items-center mb-4">
<i classname="fas fa-user-friends text-yellow-600 text-2xl mr-3"></i>
<h4 classname="font-semibold text-yellow-900">Moderate Care</h4>
</div>
<ul classname="text-sm text-yellow-800 space-y-2">
<li>â¢ Help with bathing, dressing</li>
<li>â¢ Medication reminders</li>
<li>â¢ Meal preparation assistance</li>
<li>â¢ Safety supervision</li>
</ul>
<div classname="mt-4 text-sm font-semibold text-yellow-900">Best Options: Assisted Living, Enhanced Home Care</div>
</div>
<div classname="bg-red-50 p-6 rounded-lg">
<div classname="flex items-center mb-4">
<i classname="fas fa-hospital text-red-600 text-2xl mr-3"></i>
<h4 classname="font-semibold text-red-900">Intensive Care</h4>
</div>
<ul classname="text-sm text-red-800 space-y-2">
<li>â¢ Medical supervision needed</li>
<li>â¢ Cognitive impairment</li>
<li>â¢ Mobility limitations</li>
<li>â¢ Complex health conditions</li>
</ul>
<div classname="mt-4 text-sm font-semibold text-red-900">Best Options: Nursing Home, Memory Care</div>
</div>
</div>
</div>
</div>
</section>
<!-- Funding Strategies Section -->
<section classname="content-section hidden" id="funding">
<div classname="max-w-6xl mx-auto">
<h2 classname="text-3xl font-bold mb-8 text-blue-900 text-center">Funding Your Long-Term Care</h2>
<!-- Funding Options Grid -->
<div classname="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
<div classname="bg-card rounded-lg shadow-lg p-6">
<div classname="flex items-center mb-4">
<i classname="fas fa-shield-alt text-primary text-2xl mr-3"></i>
<h3 classname="text-xl font-semibold text-blue-900">Long-Term Care Insurance</h3>
</div>
<div classname="space-y-3">
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Covers most care types</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Inflation protection available</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Premiums can increase</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>May not cover all expenses</span>
</div>
</div>
<div classname="mt-4 p-3 bg-primary/5 rounded">
<div classname="text-sm font-semibold text-blue-900">Best For:</div>
<div classname="text-sm text-blue-800">Those in good health, ages 50-65</div>
</div>
</div>
<div classname="bg-card rounded-lg shadow-lg p-6">
<div classname="flex items-center mb-4">
<i classname="fas fa-university text-trust-green text-2xl mr-3"></i>
<h3 classname="text-xl font-semibold text-green-900">Medicaid</h3>
</div>
<div classname="space-y-3">
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Covers nursing home care</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Some home care coverage</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Strict income/asset limits</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Limited facility choices</span>
</div>
</div>
<div classname="mt-4 p-3 bg-trust-green/5 rounded">
<div classname="text-sm font-semibold text-green-900">Best For:</div>
<div classname="text-sm text-green-800">Those with limited assets and income</div>
</div>
</div>
<div classname="bg-card rounded-lg shadow-lg p-6">
<div classname="flex items-center mb-4">
<i classname="fas fa-piggy-bank text-purple-600 text-2xl mr-3"></i>
<h3 classname="text-xl font-semibold text-purple-900">Self-Funding</h3>
</div>
<div classname="space-y-3">
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Complete control over care</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>No insurance restrictions</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Requires substantial savings</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Risk of depleting assets</span>
</div>
</div>
<div classname="mt-4 p-3 bg-purple-50 rounded">
<div classname="text-sm font-semibold text-purple-900">Best For:</div>
<div classname="text-sm text-purple-800">Those with significant assets ($500K+)</div>
</div>
</div>
<div classname="bg-card rounded-lg shadow-lg p-6">
<div classname="flex items-center mb-4">
<i classname="fas fa-home text-orange-600 text-2xl mr-3"></i>
<h3 classname="text-xl font-semibold text-orange-900">Reverse Mortgage</h3>
</div>
<div classname="space-y-3">
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Access home equity</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>No monthly payments</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Reduces inheritance</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Fees and interest costs</span>
</div>
</div>
<div classname="mt-4 p-3 bg-orange-50 rounded">
<div classname="text-sm font-semibold text-orange-900">Best For:</div>
<div classname="text-sm text-orange-800">Homeowners with substantial equity</div>
</div>
</div>
<div classname="bg-card rounded-lg shadow-lg p-6">
<div classname="flex items-center mb-4">
<i classname="fas fa-users text-teal-600 text-2xl mr-3"></i>
<h3 classname="text-xl font-semibold text-teal-900">Family Support</h3>
</div>
<div classname="space-y-3">
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Familiar caregivers</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Lower costs</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Caregiver burden</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>May lack expertise</span>
</div>
</div>
<div classname="mt-4 p-3 bg-teal-50 rounded">
<div classname="text-sm font-semibold text-teal-900">Best For:</div>
<div classname="text-sm text-teal-800">Those with available family members</div>
</div>
</div>
<div classname="bg-card rounded-lg shadow-lg p-6">
<div classname="flex items-center mb-4">
<i classname="fas fa-chart-line text-indigo-600 text-2xl mr-3"></i>
<h3 classname="text-xl font-semibold text-indigo-900">Hybrid Life Insurance</h3>
</div>
<div classname="space-y-3">
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Combines life insurance + LTC</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-check text-green-500 mr-2"></i>
<span>Guaranteed premiums</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Higher initial cost</span>
</div>
<div classname="flex items-center text-sm">
<i classname="fas fa-times text-red-500 mr-2"></i>
<span>Complex product</span>
</div>
</div>
<div classname="mt-4 p-3 bg-indigo-50 rounded">
<div classname="text-sm font-semibold text-indigo-900">Best For:</div>
<div classname="text-sm text-indigo-800">Those wanting guaranteed protection</div>
</div>
</div>
</div>
<!-- Funding Strategy Comparison -->
<div classname="bg-card rounded-lg shadow-lg p-8">
<h3 classname="text-2xl font-bold mb-6 text-blue-900">Funding Strategy Comparison</h3>
<div classname="overflow-x-auto">
<table classname="w-full text-sm">
<thead classname="bg-background">
<tr>
<th classname="px-4 py-3 text-left">Strategy</th>
<th classname="px-4 py-3 text-left">Initial Cost</th>
<th classname="px-4 py-3 text-left">Coverage Amount</th>
<th classname="px-4 py-3 text-left">Flexibility</th>
<th classname="px-4 py-3 text-left">Risk Level</th>
</tr>
</thead>
<tbody classname="divide-y divide-gray-200">
<tr>
<td classname="px-4 py-3 font-medium">LTC Insurance</td>
<td classname="px-4 py-3">$2,000-5,000/year</td>
<td classname="px-4 py-3">$150,000-500,000</td>
<td classname="px-4 py-3">Medium</td>
<td classname="px-4 py-3"><span classname="text-yellow-600">Medium</span></td>
</tr>
<tr>
<td classname="px-4 py-3 font-medium">Self-Funding</td>
<td classname="px-4 py-3">$500,000+</td>
<td classname="px-4 py-3">Based on assets</td>
<td classname="px-4 py-3">High</td>
<td classname="px-4 py-3"><span classname="text-red-600">High</span></td>
</tr>
<tr>
<td classname="px-4 py-3 font-medium">Hybrid Insurance</td>
<td classname="px-4 py-3">$50,000-150,000</td>
<td classname="px-4 py-3">$100,000-300,000</td>
<td classname="px-4 py-3">Low</td>
<td classname="px-4 py-3"><span classname="text-trust-green">Low</span></td>
</tr>
<tr>
<td classname="px-4 py-3 font-medium">Medicaid</td>
<td classname="px-4 py-3">Asset spend-down</td>
<td classname="px-4 py-3">Full coverage</td>
<td classname="px-4 py-3">Low</td>
<td classname="px-4 py-3"><span classname="text-trust-green">Low</span></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</section>
<!-- Cost Analysis Section -->
<section classname="content-section hidden" id="costs">
<div classname="max-w-6xl mx-auto">
<h2 classname="text-3xl font-bold mb-8 text-blue-900 text-center">Cost Analysis &amp; Planning</h2>
<div classname="grid lg:grid-cols-2 gap-8">
<!-- Cost Calculator -->
<div classname="bg-card rounded-lg shadow-lg p-8">
<h3 classname="text-2xl font-bold mb-6 text-blue-900">Care Cost Calculator</h3>
<div classname="space-y-4">
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Care Type</label>
<select classname="w-full p-3 border border-input rounded-lg" id="careType">
<option value="home">Home Care</option>
<option value="assisted">Assisted Living</option>
<option value="nursing">Nursing Home</option>
<option value="memory">Memory Care</option>
</select>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Hours per Day (for home care)</label>
<input classname="w-full p-3 border border-input rounded-lg" id="hoursPerDay" max="24" min="1" type="number" value="8"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Expected Duration (years)</label>
<input classname="w-full p-3 border border-input rounded-lg" id="duration" max="20" min="1" type="number" value="3"/>
</div>
<div>
<label classname="block text-sm font-medium text-gray-700 mb-2">Annual Cost Inflation (%)</label>
<input classname="w-full p-3 border border-input rounded-lg" id="inflation" max="10" min="0" step="0.1" type="number" value="3"/>
</div>
<button classname="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition" onclick="calculateCosts()">
                                Calculate Total Cost
                            </button>
</div>
<div classname="mt-6 hidden" id="costResults">
<div classname="bg-primary/5 p-4 rounded-lg">
<h4 classname="font-semibold text-blue-900 mb-2">Estimated Costs</h4>
<div classname="space-y-2">
<div classname="flex justify-between">
<span>Monthly Cost:</span>
<span classname="font-semibold" id="monthlyCost"></span>
</div>
<div classname="flex justify-between">
<span>Annual Cost:</span>
<span classname="font-semibold" id="annualCost"></span>
</div>
<div classname="flex justify-between">
<span>Total Cost (with inflation):</span>
<span classname="font-semibold text-blue-900" id="totalCost"></span>
</div>
</div>
</div>
</div>
</div>
<!-- Cost Breakdown Chart -->
<div classname="bg-card rounded-lg shadow-lg p-8">
<h3 classname="text-2xl font-bold mb-6 text-blue-900">Annual Care Costs by Type</h3>
<div style="height: 400px;">
<canvas id="costChart"></canvas>
</div>
</div>
</div>
<!-- Regional Cost Variations -->
<div classname="mt-8 bg-card rounded-lg shadow-lg p-8">
<h3 classname="text-2xl font-bold mb-6 text-blue-900">Regional Cost Variations</h3>
<div classname="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
<div classname="text-center">
<h4 classname="font-semibold text-gray-800 mb-2">Northeast</h4>
<div classname="text-2xl font-bold text-blue-900">$110,000</div>
<div classname="text-sm text-muted-foreground">Annual nursing home cost</div>
</div>
<div classname="text-center">
<h4 classname="font-semibold text-gray-800 mb-2">West</h4>
<div classname="text-2xl font-bold text-blue-900">$105,000</div>
<div classname="text-sm text-muted-foreground">Annual nursing home cost</div>
</div>
<div classname="text-center">
<h4 classname="font-semibold text-gray-800 mb-2">South</h4>
<div classname="text-2xl font-bold text-blue-900">$85,000</div>
<div classname="text-sm text-muted-foreground">Annual nursing home cost</div>
</div>
<div classname="text-center">
<h4 classname="font-semibold text-gray-800 mb-2">Midwest</h4>
<div classname="text-2xl font-bold text-blue-900">$90,000</div>
<div classname="text-sm text-muted-foreground">Annual nursing home cost</div>
</div>
</div>
</div>
</div>
</section>
<!-- Action Plan Section -->
<section classname="content-section hidden" id="planning">
<div classname="max-w-4xl mx-auto">
<h2 classname="text-3xl font-bold mb-8 text-blue-900 text-center">Your Long-Term Care Action Plan</h2>
<!-- Planning Checklist -->
<div classname="bg-card rounded-lg shadow-lg p-8 mb-8">
<h3 classname="text-2xl font-bold mb-6 text-blue-900">Planning Checklist</h3>
<div classname="space-y-4">
<div classname="flex items-start space-x-3">
<input classname="mt-1" id="assess" type="checkbox"/>
<label classname="text-gray-700" htmlfor="assess">
<strong>Assess Your Risk:</strong> Consider your family health history, current health status, and likelihood of needing care
                            </label>
</div>
<div classname="flex items-start space-x-3">
<input classname="mt-1" id="research" type="checkbox"/>
<label classname="text-gray-700" htmlfor="research">
<strong>Research Care Options:</strong> Visit local facilities, interview home care agencies, and understand quality ratings
                            </label>
</div>
<div classname="flex items-start space-x-3">
<input classname="mt-1" id="calculate" type="checkbox"/>
<label classname="text-gray-700" htmlfor="calculate">
<strong>Calculate Costs:</strong> Estimate potential care costs in your area and factor in inflation
                            </label>
</div>
<div classname="flex items-start space-x-3">
<input classname="mt-1" id="evaluate" type="checkbox"/>
<label classname="text-gray-700" htmlfor="evaluate">
<strong>Evaluate Funding Options:</strong> Compare insurance, self-funding, and hybrid strategies
                            </label>
</div>
<div classname="flex items-start space-x-3">
<input classname="mt-1" id="discuss" type="checkbox"/>
<label classname="text-gray-700" htmlfor="discuss">
<strong>Discuss with Family:</strong> Share your preferences and plans with loved ones
                            </label>
</div>
<div classname="flex items-start space-x-3">
<input classname="mt-1" id="documents" type="checkbox"/>
<label classname="text-gray-700" htmlfor="documents">
<strong>Prepare Legal Documents:</strong> Create or update advance directives, powers of attorney, and wills
                            </label>
</div>
<div classname="flex items-start space-x-3">
<input classname="mt-1" id="review" type="checkbox"/>
<label classname="text-gray-700" htmlfor="review">
<strong>Review Annually:</strong> Update your plan as your health, finances, and preferences change
                            </label>
</div>
</div>
</div>
<!-- Age-Based Planning Timeline -->
<div classname="bg-card rounded-lg shadow-lg p-8 mb-8">
<h3 classname="text-2xl font-bold mb-6 text-blue-900">Planning Timeline by Age</h3>
<div classname="space-y-6">
<div classname="border-l-4 border-blue-500 pl-6">
<h4 classname="text-xl font-semibold text-blue-900">Ages 40-50</h4>
<p classname="text-gray-700 mb-2">Start thinking about long-term care insurance while you're healthy and premiums are lower.</p>
<ul classname="text-sm text-muted-foreground space-y-1">
<li>â¢ Research insurance options</li>
<li>â¢ Begin saving in dedicated accounts</li>
<li>â¢ Discuss family history and preferences</li>
</ul>
</div>
<div classname="border-l-4 border-green-500 pl-6">
<h4 classname="text-xl font-semibold text-green-900">Ages 50-60</h4>
<p classname="text-gray-700 mb-2">Make decisions about insurance and begin concrete planning.</p>
<ul classname="text-sm text-muted-foreground space-y-1">
<li>â¢ Purchase long-term care insurance if desired</li>
<li>â¢ Create advance directives</li>
<li>â¢ Research care options in your area</li>
</ul>
</div>
<div classname="border-l-4 border-yellow-500 pl-6">
<h4 classname="text-xl font-semibold text-yellow-900">Ages 60-70</h4>
<p classname="text-gray-700 mb-2">Finalize your care preferences and funding strategy.</p>
<ul classname="text-sm text-muted-foreground space-y-1">
<li>â¢ Update estate planning documents</li>
<li>â¢ Make home modifications for aging in place</li>
<li>â¢ Communicate plan with family</li>
</ul>
</div>
<div classname="border-l-4 border-red-500 pl-6">
<h4 classname="text-xl font-semibold text-red-900">Ages 70+</h4>
<p classname="text-gray-700 mb-2">Implement your plan and make adjustments as needed.</p>
<ul classname="text-sm text-muted-foreground space-y-1">
<li>â¢ Review and update plans annually</li>
<li>â¢ Consider moving to more supportive housing</li>
<li>â¢ Activate care services when needed</li>
</ul>
</div>
</div>
</div>
<!-- Next Steps -->
<div classname="bg-gradient-to-r from-blue-600 to-blue-800 text-primary-foreground rounded-lg p-8">
<h3 classname="text-2xl font-bold mb-4">Ready to Take Action?</h3>
<p classname="text-blue-100 mb-6">Don't wait until you need care to start planning. The earlier you start, the more options you'll have.</p>
<div classname="flex flex-wrap gap-4">
<button classname="bg-card text-primary px-6 py-3 rounded-lg font-semibold hover:bg-muted transition">
                            Schedule Consultation
                        </button>
<button classname="border border-white text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-card hover:text-primary transition">
                            Download Planning Guide
                        </button>
</div>
</div>
</div>
</section>
</main>
 Footer 
<footer classname="bg-gray-800 text-primary-foreground py-12">
<div classname="container mx-auto px-4 text-center">
        <p classname="text-gray-300">© 2024 SeniorSimple - Your trusted partner in retirement planning</p>
</div>
</footer>
<style>
        .nav-pill {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: all 0.3s ease;
            background: white;
            color: #64748b;
            border: 2px solid #e2e8f0;
        }
        .nav-pill.active {
            background: #1e40af;
            color: white;
            border-color: #1e40af;
        }
        .nav-pill:hover {
            background: #f1f5f9;
        }
        .nav-pill.active:hover {
            background: #1d4ed8;
        }
        .content-section {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
<script>
        // Navigation functionality
        document.addEventListener('DOMContentLoaded', function() {
            const navPills = document.querySelectorAll('.nav-pill');
            const sections = document.querySelectorAll('.content-section');
            
            navPills.forEach(pill => {
                pill.addEventListener('click', function() {
                    const targetSection = this.dataset.section;
                    
                    // Update active pill
                    navPills.forEach(p => p.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show target section
                    sections.forEach(section => {
                        if (section.id === targetSection) {
                            section.classList.remove('hidden');
                        } else {
                            section.classList.add('hidden');
                        }
                    });
                });
            });
            
            // Initialize cost chart
            initializeCostChart();
        });
        
        // Cost calculator functionality
        function calculateCosts() {
            const careType = document.getElementById('careType').value;
            const hoursPerDay = parseInt(document.getElementById('hoursPerDay').value);
            const duration = parseInt(document.getElementById('duration').value);
            const inflation = parseFloat(document.getElementById('inflation').value) / 100;
            
            let monthlyCost = 0;
            
            switch(careType) {
                case 'home':
                    monthlyCost = hoursPerDay * 30 * 30; // $30/hour average
                    break;
                case 'assisted':
                    monthlyCost = 4500;
                    break;
                case 'nursing':
                    monthlyCost = 8500;
                    break;
                case 'memory':
                    monthlyCost = 6000;
                    break;
            }
            
            const annualCost = monthlyCost * 12;
            
            // Calculate total cost with inflation
            let totalCost = 0;
            for (let year = 0; year < duration; year++) {
                totalCost += annualCost * Math.pow(1 + inflation, year);
            }
            
            // Display results
            document.getElementById('monthlyCost').textContent = '$' + monthlyCost.toLocaleString();
            document.getElementById('annualCost').textContent = '$' + annualCost.toLocaleString();
            document.getElementById('totalCost').textContent = '$' + Math.round(totalCost).toLocaleString();
            document.getElementById('costResults').classList.remove('hidden');
        }
        
        // Initialize cost chart
        function initializeCostChart() {
            const ctx = document.getElementById('costChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Home Care (8hr/day)', 'Adult Day Care', 'Assisted Living', 'Memory Care', 'Nursing Home'],
                    datasets: [{
                        label: 'Annual Cost',
                        data: [87600, 18250, 54000, 72000, 102000],
                        backgroundColor: [
                            '#3B82F6',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444',
                            '#8B5CF6'
                        ],
                        borderColor: [
                            '#2563EB',
                            '#059669',
                            '#D97706',
                            '#DC2626',
                            '#7C3AED'
                        ],
                        borderWidth: 1
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
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    </script>

    </div>
  );
};

export default LtcPlanningGuide;