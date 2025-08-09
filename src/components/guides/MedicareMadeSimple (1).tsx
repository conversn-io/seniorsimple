'use client';

import React, { useState, useEffect } from 'react';

interface MedicareMadeSimpleProps {
  // Add your props here
}

interface MedicareMadeSimpleState {
  activeTab: string;
  selectedPlan: string;
  enrollmentStep: number;
  userAge: string;
  currentInsurance: string;
  income: string;
  prescription: string;
  doctorVisits: string;
  estimatedCost: any;
  checkedItems: Record<string, any>;
  selectedPlans: any[];
}

const { useState, useEffect } = React;

        const MedicareMadeSimple = () => {
            const [activeTab, setActiveTab] = useState('overview');
            const [selectedPlan, setSelectedPlan] = useState('');
            const [enrollmentStep, setEnrollmentStep] = useState(1);
            const [userAge, setUserAge] = useState('');
            const [currentInsurance, setCurrentInsurance] = useState('');

            const medicarePartsData = [
                {
                    part: 'Part A',
                    name: 'Hospital Insurance',
                    cost: 'Free for most people',
                    covers: 'Inpatient hospital care, skilled nursing facility care, hospice care, some home health care',
                    whenToEnroll: 'Automatic if receiving Social Security',
                    penalty: 'Late enrollment penalty may apply'
                },
                {
                    part: 'Part B',
                    name: 'Medical Insurance',
                    cost: '$174.70/month (2024)',
                    covers: 'Doctor visits, outpatient care, medical supplies, preventive services',
                    whenToEnroll: 'Initial enrollment period around 65th birthday',
                    penalty: '10% penalty for each 12-month period without coverage'
                },
                {
                    part: 'Part C',
                    name: 'Medicare Advantage',
                    cost: 'Varies by plan',
                    covers: 'All Part A & B benefits, often includes Part D, may include extras',
                    whenToEnroll: 'Annual Open Enrollment Oct 15 - Dec 7',
                    penalty: 'No penalty, but limited enrollment periods'
                },
                {
                    part: 'Part D',
                    name: 'Prescription Drug Coverage',
                    cost: 'Varies by plan',
                    covers: 'Prescription medications',
                    whenToEnroll: 'When first eligible for Medicare',
                    penalty: '1% penalty per month for late enrollment'
                }
            ];

            const medigapPlans = [
                { plan: 'A', monthlyPremium: '$125-200', deductible: 'Part A & B', coinsurance: 'Part A & B', foreignTravel: 'No' },
                { plan: 'B', monthlyPremium: '$135-220', deductible: 'Part A only', coinsurance: 'Part A & B', foreignTravel: 'No' },
                { plan: 'C', monthlyPremium: '$150-250', deductible: 'Part A & B', coinsurance: 'Part A & B', foreignTravel: 'Yes' },
                { plan: 'D', monthlyPremium: '$140-230', deductible: 'Part A only', coinsurance: 'Part A & B', foreignTravel: 'Yes' },
                { plan: 'F', monthlyPremium: '$160-280', deductible: 'Part A & B', coinsurance: 'Part A & B', foreignTravel: 'Yes' },
                { plan: 'G', monthlyPremium: '$145-270', deductible: 'Part A only', coinsurance: 'Part A & B', foreignTravel: 'Yes' },
                { plan: 'K', monthlyPremium: '$75-120', deductible: 'Partial', coinsurance: 'Partial', foreignTravel: 'No' },
                { plan: 'L', monthlyPremium: '$85-140', deductible: 'Partial', coinsurance: 'Partial', foreignTravel: 'No' },
                { plan: 'M', monthlyPremium: '$130-200', deductible: 'Partial', coinsurance: 'Part A & B', foreignTravel: 'No' },
                { plan: 'N', monthlyPremium: '$120-190', deductible: 'Part A only', coinsurance: 'Partial', foreignTravel: 'Yes' }
            ];

            const enrollmentTimeline = [
                {
                    period: 'Initial Enrollment Period',
                    timeframe: '7 months (3 months before 65th birthday through 3 months after)',
                    action: 'Sign up for Medicare Parts A & B',
                    penalty: 'No penalty'
                },
                {
                    period: 'General Enrollment Period',
                    timeframe: 'January 1 - March 31',
                    action: 'Sign up if you missed Initial Enrollment Period',
                    penalty: 'Late enrollment penalty may apply'
                },
                {
                    period: 'Special Enrollment Period',
                    timeframe: 'Varies based on qualifying event',
                    action: 'Sign up due to job loss, moving, etc.',
                    penalty: 'Usually no penalty'
                },
                {
                    period: 'Annual Open Enrollment',
                    timeframe: 'October 15 - December 7',
                    action: 'Change Medicare Advantage or Part D plans',
                    penalty: 'No penalty'
                }
            ];

            const CostCalculator = () => {
                const [income, setIncome] = useState('');
                const [prescription, setPrescription] = useState('');
                const [doctorVisits, setDoctorVisits] = useState('');
                const [estimatedCost, setEstimatedCost] = useState(null);

                const calculateCosts = () => {
                    const basePartB = 174.70;
                    const partADeductible = 1632;
                    const avgPartD = 45;
                    const avgMedigap = 200;
                    
                    let totalCost = basePartB * 12 + avgPartD * 12 + avgMedigap * 12;
                    
                    if (income > 97000) {
                        totalCost += 700; // IRMAA surcharge
                    }
                    
                    if (prescription === 'high') {
                        totalCost += 1200;
                    }
                    
                    if (doctorVisits > 6) {
                        totalCost += 500;
                    }
                    
                    setEstimatedCost(totalCost);
                };

                return (
                    <div className="bg-card p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Medicare Cost Calculator</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Annual Income</label>
                                <input
                                    type="number"
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                    className="w-full border border-input rounded-md px-3 py-2"
                                    placeholder="Enter your annual income"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Prescription Drug Usage</label>
                                <select
                                    value={prescription}
                                    onChange={(e) => setPrescription(e.target.value)}
                                    className="w-full border border-input rounded-md px-3 py-2"
                                >
                                    <option value="">Select usage level</option>
                                    <option value="low">Low (0-2 prescriptions)</option>
                                    <option value="medium">Medium (3-5 prescriptions)</option>
                                    <option value="high">High (6+ prescriptions)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Doctor Visits per Year</label>
                                <input
                                    type="number"
                                    value={doctorVisits}
                                    onChange={(e) => setDoctorVisits(e.target.value)}
                                    className="w-full border border-input rounded-md px-3 py-2"
                                    placeholder="Number of doctor visits"
                                />
                            </div>
                            <button
                                onClick={calculateCosts}
                                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Calculate Estimated Annual Cost
                            </button>
                            {estimatedCost && (
                                <div className="mt-4 p-4 bg-green-50 rounded-md">
                                    <h4 className="font-semibold text-green-800">Estimated Annual Medicare Cost</h4>
                                    <p className="text-2xl font-bold text-green-700">${estimatedCost.toLocaleString()}</p>
                                    <p className="text-sm text-trust-green mt-2">
                                        This includes Part B premiums, estimated Part D costs, and Medigap insurance.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            };

            const EnrollmentChecklist = () => {
                const [checkedItems, setCheckedItems] = useState({});

                const checklistItems = [
                    'Determine if you need to sign up for Part A and Part B',
                    'Decide if you want Original Medicare or Medicare Advantage',
                    'Choose a Part D prescription drug plan',
                    'Consider if you need a Medigap policy',
                    'Gather necessary documents (Social Security card, etc.)',
                    'Compare plan costs and coverage in your area',
                    'Check if your doctors accept Medicare',
                    'Review your current prescriptions for coverage',
                    'Understand enrollment deadlines and penalties',
                    'Complete enrollment during appropriate time period'
                ];

                const handleCheck = (index) => {
                    setCheckedItems(prev => ({
                        ...prev,
                        [index]: !prev[index]
                    }));
                };

                const completedItems = Object.values(checkedItems).filter(Boolean).length;
                const progressPercentage = (completedItems / checklistItems.length) * 100;

                return (
                    <div className="bg-card p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Medicare Enrollment Checklist</h3>
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                <span>Progress: {completedItems}/{checklistItems.length} completed</span>
                                <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {checklistItems.map((item, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id={`check-${index}`}
                                        checked={checkedItems[index] || false}
                                        onChange={() => handleCheck(index)}
                                        className="w-4 h-4 text-primary border-input rounded focus:ring-primary"
                                    />
                                    <label 
                                        htmlFor={`check-${index}`}
                                        className={`text-sm ${checkedItems[index] ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                                    >
                                        {item}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            };

            const PlanComparison = () => {
                const [selectedPlans, setSelectedPlans] = useState([]);

                const planTypes = [
                    {
                        name: 'Original Medicare + Medigap',
                        pros: ['Choose any doctor who accepts Medicare', 'Predictable costs', 'No networks'],
                        cons: ['Higher monthly premiums', 'No prescription drug coverage', 'May need multiple policies'],
                        bestFor: 'People who want maximum flexibility and travel frequently'
                    },
                    {
                        name: 'Medicare Advantage',
                        pros: ['Often includes prescription drugs', 'May include extras like dental/vision', 'Lower monthly premiums'],
                        cons: ['Limited to plan network', 'Costs can vary', 'May need referrals'],
                        bestFor: 'People who want convenience and don\'t mind network restrictions'
                    }
                ];

                return (
                    <div className="bg-card p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Medicare Plan Comparison</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {planTypes.map((plan, index) => (
                                <div key={index} className="border border-border rounded-lg p-4">
                                    <h4 className="font-semibold text-lg mb-3">{plan.name}</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <h5 className="font-medium text-trust-green mb-1">Pros:</h5>
                                            <ul className="text-sm space-y-1">
                                                {plan.pros.map((pro, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <i className="fas fa-check text-green-500 mr-2 mt-1 text-xs"></i>
                                                        {pro}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-destructive mb-1">Cons:</h5>
                                            <ul className="text-sm space-y-1">
                                                {plan.cons.map((con, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <i className="fas fa-times text-red-500 mr-2 mt-1 text-xs"></i>
                                                        {con}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded">
                                            <h5 className="font-medium text-blue-800 mb-1">Best For:</h5>
                                            <p className="text-sm text-blue-700">{plan.bestFor}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            };

            return (
                <div className="min-h-screen bg-background">
                    {/* Header */}
                    <div className="bg-card shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-foreground">Medicare Made Simple</h1>
                                        <p className="mt-2 text-muted-foreground">Complete Guide for Baby Boomers</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-50 px-3 py-1 rounded-full">
                                            <span className="text-sm font-medium text-blue-700">10 min read</span>
                                        </div>
                                        <div className="bg-green-50 px-3 py-1 rounded-full">
                                            <span className="text-sm font-medium text-green-700">Healthcare</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="border-b border-border">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { id: 'overview', label: 'Overview', icon: 'fas fa-home' },
                                    { id: 'parts', label: 'Medicare Parts', icon: 'fas fa-puzzle-piece' },
                                    { id: 'enrollment', label: 'Enrollment', icon: 'fas fa-calendar-check' },
                                    { id: 'costs', label: 'Costs', icon: 'fas fa-dollar-sign' },
                                    { id: 'compare', label: 'Compare Plans', icon: 'fas fa-balance-scale' },
                                    { id: 'tools', label: 'Tools', icon: 'fas fa-calculator' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                                    >
                                        <i className={tab.icon}></i>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div className="bg-card rounded-lg shadow-md p-6">
                                    <h2 className="text-2xl font-bold mb-4">Understanding Medicare: Your Complete Guide</h2>
                                    <div className="prose max-w-none">
                                        <p className="text-lg text-foreground mb-6">
                                            Medicare is a federal health insurance program for people 65 and older, certain younger people with disabilities, and people with End-Stage Renal Disease. Understanding Medicare can seem overwhelming, but this guide breaks it down into simple, actionable steps.
                                        </p>
                                        
                                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                                            <div className="bg-blue-50 p-6 rounded-lg">
                                                <h3 className="text-xl font-semibold mb-3 text-blue-800">When to Apply</h3>
                                                <ul className="space-y-2 text-blue-700">
                                                    <li>â¢ 3 months before your 65th birthday</li>
                                                    <li>â¢ During your birthday month</li>
                                                    <li>â¢ 3 months after your 65th birthday</li>
                                                </ul>
                                            </div>
                                            <div className="bg-green-50 p-6 rounded-lg">
                                                <h3 className="text-xl font-semibold mb-3 text-green-800">What You Need</h3>
                                                <ul className="space-y-2 text-green-700">
                                                    <li>â¢ Social Security number</li>
                                                    <li>â¢ Birth certificate or passport</li>
                                                    <li>â¢ Employment history</li>
                                                    <li>â¢ Current insurance information</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Reminder</h3>
                                            <p className="text-yellow-700">
                                                Missing your Initial Enrollment Period can result in lifetime penalties. If you're still working at 65 and have employer health insurance, you may be able to delay enrollment without penalty.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="bg-card p-6 rounded-lg shadow-md text-center">
                                        <i className="fas fa-hospital text-4xl text-primary mb-4"></i>
                                        <h3 className="text-lg font-semibold mb-2">Part A</h3>
                                        <p className="text-muted-foreground">Hospital Insurance</p>
                                        <p className="text-sm text-muted-foreground mt-2">Usually free</p>
                                    </div>
                                    <div className="bg-card p-6 rounded-lg shadow-md text-center">
                                        <i className="fas fa-stethoscope text-4xl text-trust-green mb-4"></i>
                                        <h3 className="text-lg font-semibold mb-2">Part B</h3>
                                        <p className="text-muted-foreground">Medical Insurance</p>
                                        <p className="text-sm text-muted-foreground mt-2">$174.70/month</p>
                                    </div>
                                    <div className="bg-card p-6 rounded-lg shadow-md text-center">
                                        <i className="fas fa-pills text-4xl text-purple-600 mb-4"></i>
                                        <h3 className="text-lg font-semibold mb-2">Part D</h3>
                                        <p className="text-muted-foreground">Prescription Drugs</p>
                                        <p className="text-sm text-muted-foreground mt-2">Varies by plan</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'parts' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Medicare Parts Explained</h2>
                                <div className="bg-card rounded-lg shadow-md overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-background">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Part</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Covers</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Enrollment</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-card divide-y divide-gray-200">
                                                {medicarePartsData.map((part, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                            {part.part}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                            {part.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                            {part.cost}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-foreground max-w-xs">
                                                            {part.covers}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-foreground max-w-xs">
                                                            {part.whenToEnroll}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'enrollment' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Medicare Enrollment Timeline</h2>
                                <div className="space-y-4">
                                    {enrollmentTimeline.map((period, index) => (
                                        <div key={index} className="bg-card rounded-lg shadow-md p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-primary font-semibold">{index + 1}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold mb-2">{period.period}</h3>
                                                    <p className="text-muted-foreground mb-2">{period.timeframe}</p>
                                                    <p className="text-foreground mb-2">{period.action}</p>
                                                    <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                                                        period.penalty.includes('No penalty') 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {period.penalty}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <EnrollmentChecklist />
                            </div>
                        )}

                        {activeTab === 'costs' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Medicare Costs Breakdown</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <CostCalculator />
                                    <div className="bg-card rounded-lg shadow-md p-6">
                                        <h3 className="text-xl font-semibold mb-4">2024 Medicare Costs</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="font-medium">Part A Deductible</span>
                                                <span className="text-lg font-semibold">$1,632</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="font-medium">Part B Premium</span>
                                                <span className="text-lg font-semibold">$174.70/month</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="font-medium">Part B Deductible</span>
                                                <span className="text-lg font-semibold">$240</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium">Part D Average Premium</span>
                                                <span className="text-lg font-semibold">$45/month</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-blue-800 mb-2">IRMAA Surcharges</h4>
                                            <p className="text-blue-700 text-sm">
                                                High-income earners pay additional premiums for Parts B and D based on their Modified Adjusted Gross Income (MAGI).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'compare' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Medicare Plan Comparison</h2>
                                <PlanComparison />
                                <div className="bg-card rounded-lg shadow-md p-6">
                                    <h3 className="text-xl font-semibold mb-4">Medigap Plans Comparison</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-background">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Plan</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Monthly Premium</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Deductible</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Coinsurance</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Foreign Travel</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-card divide-y divide-gray-200">
                                                {medigapPlans.map((plan, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                            Plan {plan.plan}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                                                            {plan.monthlyPremium}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                                                            {plan.deductible}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                                                            {plan.coinsurance}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                                                            {plan.foreignTravel}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tools' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Medicare Planning Tools</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-card rounded-lg shadow-md p-6">
                                        <h3 className="text-xl font-semibold mb-4">Quick Decision Tool</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Your Age</label>
                                                <input
                                                    type="number"
                                                    value={userAge}
                                                    onChange={(e) => setUserAge(e.target.value)}
                                                    className="w-full border border-input rounded-md px-3 py-2"
                                                    placeholder="Enter your age"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Current Insurance</label>
                                                <select
                                                    value={currentInsurance}
                                                    onChange={(e) => setCurrentInsurance(e.target.value)}
                                                    className="w-full border border-input rounded-md px-3 py-2"
                                                >
                                                    <option value="">Select current insurance</option>
                                                    <option value="employer">Employer insurance</option>
                                                    <option value="cobra">COBRA</option>
                                                    <option value="marketplace">Marketplace plan</option>
                                                    <option value="none">No insurance</option>
                                                </select>
                                            </div>
                                            {userAge && currentInsurance && (
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-blue-800 mb-2">Recommendation</h4>
                                                    <p className="text-blue-700 text-sm">
                                                        {userAge >= 65 
                                                            ? "You're eligible for Medicare now. Consider enrolling during your Initial Enrollment Period to avoid penalties."
                                                            : "You're not yet eligible for Medicare. Continue with your current coverage and plan to enroll 3 months before your 65th birthday."
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-card rounded-lg shadow-md p-6">
                                        <h3 className="text-xl font-semibold mb-4">Resources & Next Steps</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-globe text-primary mt-1"></i>
                                                <div>
                                                    <h4 className="font-medium">Medicare.gov</h4>
                                                    <p className="text-sm text-muted-foreground">Official Medicare website for enrollment and plan comparison</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-phone text-trust-green mt-1"></i>
                                                <div>
                                                    <h4 className="font-medium">1-800-MEDICARE</h4>
                                                    <p className="text-sm text-muted-foreground">Free helpline for Medicare questions</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-users text-purple-600 mt-1"></i>
                                                <div>
                                                    <h4 className="font-medium">Local SHIP Program</h4>
                                                    <p className="text-sm text-muted-foreground">Free local counseling for Medicare decisions</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-calendar text-destructive mt-1"></i>
                                                <div>
                                                    <h4 className="font-medium">Schedule Consultation</h4>
                                                    <p className="text-sm text-muted-foreground">Speak with a Medicare expert about your specific situation</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="bg-gray-800 text-primary-foreground mt-12">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-4">Ready to Get Started with Medicare?</h3>
                                <p className="text-gray-300 mb-6">
                                    Don't navigate Medicare alone. Our experts are here to help you make the right decisions for your healthcare and financial future.
                                </p>
                                <div className="flex justify-center space-x-4">
                                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
                                        Schedule Free Consultation
                                    </button>
                                    <button className="border border-white text-primary-foreground px-6 py-2 rounded-md hover:bg-white hover:text-gray-800 transition-colors">
                                        Download Medicare Guide
                                    </button>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            );
        };

        ReactDOM.render(<MedicareMadeSimple />, document.getElementById('root'));

export default MedicareMadeSimple;
