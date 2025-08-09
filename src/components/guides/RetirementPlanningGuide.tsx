'use client';

import React, { useState, useEffect } from 'react';

interface RetirementPlanningGuideProps {
  // Add your props here
}

interface RetirementPlanningGuideState {
  activeTab: string;
  retirementAge: number;
  currentAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  expandedSection: any;
}

const { useState, useEffect, useRef } = React;

        const RetirementPlanningGuide = () => {
            const [activeTab, setActiveTab] = useState('overview');
            const [retirementAge, setRetirementAge] = useState(65);
            const [currentAge, setCurrentAge] = useState(55);
            const [currentSavings, setCurrentSavings] = useState(250000);
            const [monthlyContribution, setMonthlyContribution] = useState(2000);
            const [expectedReturn, setExpectedReturn] = useState(7);
            const [expandedSection, setExpandedSection] = useState(null);
            
            const savingsChartRef = useRef(null);
            const withdrawalChartRef = useRef(null);
            const allocationChartRef = useRef(null);

            // Calculate retirement projections
            const calculateRetirementProjection = () => {
                const yearsToRetirement = retirementAge - currentAge;
                const monthsToRetirement = yearsToRetirement * 12;
                const monthlyRate = expectedReturn / 100 / 12;
                
                const futureValue = currentSavings * Math.pow(1 + monthlyRate, monthsToRetirement) +
                    monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate);
                
                return {
                    projectedBalance: futureValue,
                    totalContributions: currentSavings + (monthlyContribution * monthsToRetirement),
                    growthFromInterest: futureValue - currentSavings - (monthlyContribution * monthsToRetirement),
                    yearsToRetirement
                };
            };

            const projection = calculateRetirementProjection();

            // Chart initialization
            useEffect(() => {
                // Savings Growth Chart
                if (savingsChartRef.current) {
                    const ctx = savingsChartRef.current.getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: Array.from({length: projection.yearsToRetirement + 1}, (_, i) => currentAge + i),
                            datasets: [{
                                label: 'Projected Balance',
                                data: Array.from({length: projection.yearsToRetirement + 1}, (_, i) => {
                                    const years = i;
                                    const months = years * 12;
                                    const monthlyRate = expectedReturn / 100 / 12;
                                    return currentSavings * Math.pow(1 + monthlyRate, months) +
                                        monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
                                }),
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Retirement Savings Growth Projection'
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return '$' + value.toLocaleString();
                                        }
                                    }
                                }
                            }
                        }
                    });
                }

                // Withdrawal Strategy Chart
                if (withdrawalChartRef.current) {
                    const ctx = withdrawalChartRef.current.getContext('2d');
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Age 60-65', 'Age 65-70', 'Age 70-75', 'Age 75-80', 'Age 80+'],
                            datasets: [{
                                label: 'Taxable Accounts',
                                data: [80, 60, 40, 20, 10],
                                backgroundColor: 'rgba(34, 197, 94, 0.8)'
                            }, {
                                label: 'Tax-Deferred (401k/IRA)',
                                data: [20, 40, 60, 70, 70],
                                backgroundColor: 'rgba(59, 130, 246, 0.8)'
                            }, {
                                label: 'Tax-Free (Roth)',
                                data: [0, 0, 0, 10, 20],
                                backgroundColor: 'rgba(168, 85, 247, 0.8)'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Optimal Withdrawal Strategy by Age'
                                }
                            },
                            scales: {
                                x: {
                                    stacked: true
                                },
                                y: {
                                    stacked: true,
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return value + '%';
                                        }
                                    }
                                }
                            }
                        }
                    });
                }

                // Asset Allocation Chart
                if (allocationChartRef.current) {
                    const ctx = allocationChartRef.current.getContext('2d');
                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Stocks', 'Bonds', 'Real Estate', 'Cash'],
                            datasets: [{
                                data: [50, 30, 15, 5],
                                backgroundColor: [
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(34, 197, 94, 0.8)',
                                    'rgba(249, 115, 22, 0.8)',
                                    'rgba(156, 163, 175, 0.8)'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Recommended Asset Allocation (Age 55-65)'
                                }
                            }
                        }
                    });
                }
            }, [currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn]);

            const tabs = [
                { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line' },
                { id: 'calculator', label: 'Calculator', icon: 'fas fa-calculator' },
                { id: 'strategies', label: 'Strategies', icon: 'fas fa-lightbulb' },
                { id: 'income', label: 'Income Planning', icon: 'fas fa-money-bill-wave' },
                { id: 'checklist', label: 'Checklist', icon: 'fas fa-check-circle' }
            ];

            const retirementMilestones = [
                { age: 50, milestone: 'Catch-up contributions allowed', description: 'Additional $7,500 to 401(k), $1,000 to IRA' },
                { age: 59.5, milestone: 'Penalty-free withdrawals', description: 'Access retirement accounts without 10% penalty' },
                { age: 62, milestone: 'Early Social Security', description: 'Reduced benefits available' },
                { age: 65, milestone: 'Medicare eligibility', description: 'Healthcare coverage begins' },
                { age: 67, milestone: 'Full retirement age', description: 'Full Social Security benefits' },
                { age: 70, milestone: 'Maximum Social Security', description: 'Delayed retirement credits stop' },
                { age: 73, milestone: 'Required distributions', description: 'Must begin RMDs from retirement accounts' }
            ];

            const incomeStrategies = [
                {
                    strategy: 'The Bucket Strategy',
                    description: 'Divide retirement savings into three buckets',
                    details: [
                        'Bucket 1: 1-3 years of expenses in cash/short-term bonds',
                        'Bucket 2: 4-10 years in moderate-risk investments',
                        'Bucket 3: 10+ years in growth investments'
                    ],
                    pros: ['Reduces sequence of returns risk', 'Provides peace of mind', 'Allows for market timing'],
                    cons: ['May be overly conservative', 'Requires active management', 'Complex to implement']
                },
                {
                    strategy: 'Total Return Approach',
                    description: 'Maintain strategic asset allocation and rebalance regularly',
                    details: [
                        'Keep consistent stock/bond allocation',
                        'Rebalance quarterly or semi-annually',
                        'Withdraw from overweight asset classes'
                    ],
                    pros: ['Simpler to implement', 'Historically higher returns', 'Natural rebalancing'],
                    cons: ['Higher volatility', 'Requires discipline', 'May need to sell in down markets']
                },
                {
                    strategy: 'Bond Ladder',
                    description: 'Create predictable income stream with bonds',
                    details: [
                        'Purchase bonds with staggered maturity dates',
                        'Reinvest principal when bonds mature',
                        'Supplement with dividend-paying stocks'
                    ],
                    pros: ['Predictable income', 'Protection from interest rate risk', 'Capital preservation'],
                    cons: ['Lower potential returns', 'Inflation risk', 'Requires active management']
                }
            ];

            const expenseCategories = [
                { category: 'Housing', percentage: 35, amount: 2800, description: 'Mortgage/rent, utilities, maintenance' },
                { category: 'Healthcare', percentage: 20, amount: 1600, description: 'Insurance, medical expenses, long-term care' },
                { category: 'Food', percentage: 12, amount: 960, description: 'Groceries, dining out' },
                { category: 'Transportation', percentage: 10, amount: 800, description: 'Car payments, gas, maintenance' },
                { category: 'Recreation', percentage: 8, amount: 640, description: 'Travel, hobbies, entertainment' },
                { category: 'Taxes', percentage: 8, amount: 640, description: 'Income taxes, property taxes' },
                { category: 'Other', percentage: 7, amount: 560, description: 'Insurance, miscellaneous' }
            ];

            return (
                <div className="min-h-screen bg-background">
                    {/* Header */}
                    <div className="bg-card shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-foreground">Complete Guide to Retirement Planning</h1>
                                        <p className="mt-2 text-lg text-muted-foreground">Everything you need to know for a secure retirement</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-100 px-3 py-1 rounded-full">
                                            <span className="text-sm font-medium text-blue-800">15 min read</span>
                                        </div>
                                        <div className="bg-green-100 px-3 py-1 rounded-full">
                                            <span className="text-sm font-medium text-green-800">Beginner</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-card border-b border-border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <nav className="flex space-x-8" aria-label="Tabs">
                                {tabs.map((tab) => (
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

                    {/* Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Key Statistics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-card rounded-lg shadow-sm p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <i className="fas fa-chart-line text-2xl text-primary"></i>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-muted-foreground">Average Retirement Savings</p>
                                                <p className="text-2xl font-semibold text-foreground">$289,000</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-card rounded-lg shadow-sm p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <i className="fas fa-percentage text-2xl text-trust-green"></i>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-muted-foreground">Replacement Ratio Needed</p>
                                                <p className="text-2xl font-semibold text-foreground">70-80%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-card rounded-lg shadow-sm p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <i className="fas fa-calendar-alt text-2xl text-purple-600"></i>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-muted-foreground">Years in Retirement</p>
                                                <p className="text-2xl font-semibold text-foreground">25-30</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Retirement Milestones */}
                                <div className="bg-card rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Key Retirement Milestones</h3>
                                    <div className="space-y-4">
                                        {retirementMilestones.map((milestone, index) => (
                                            <div key={index} className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-primary">{milestone.age}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-foreground">{milestone.milestone}</h4>
                                                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Asset Allocation Chart */}
                                <div className="bg-card rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Asset Allocation by Age</h3>
                                    <div style={{ height: '400px' }}>
                                        <canvas ref={allocationChartRef}></canvas>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Calculator Tab */}
                        {activeTab === 'calculator' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Calculator Inputs */}
                                    <div className="bg-card rounded-lg shadow-sm p-6">
                                        <h3 className="text-lg font-medium text-foreground mb-4">Retirement Calculator</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Current Age</label>
                                                <input
                                                    type="number"
                                                    value={currentAge}
                                                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Retirement Age</label>
                                                <input
                                                    type="number"
                                                    value={retirementAge}
                                                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Current Savings</label>
                                                <input
                                                    type="number"
                                                    value={currentSavings}
                                                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Monthly Contribution</label>
                                                <input
                                                    type="number"
                                                    value={monthlyContribution}
                                                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Expected Return (%)</label>
                                                <input
                                                    type="number"
                                                    value={expectedReturn}
                                                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Calculator Results */}
                                    <div className="bg-card rounded-lg shadow-sm p-6">
                                        <h3 className="text-lg font-medium text-foreground mb-4">Projection Results</h3>
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <p className="text-sm text-blue-700">Projected Balance at Retirement</p>
                                                <p className="text-2xl font-bold text-blue-900">${projection.projectedBalance.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <p className="text-sm text-green-700">Total Contributions</p>
                                                <p className="text-xl font-semibold text-green-900">${projection.totalContributions.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <p className="text-sm text-purple-700">Growth from Interest</p>
                                                <p className="text-xl font-semibold text-purple-900">${projection.growthFromInterest.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-orange-50 p-4 rounded-lg">
                                                <p className="text-sm text-orange-700">Years to Retirement</p>
                                                <p className="text-xl font-semibold text-orange-900">{projection.yearsToRetirement} years</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Savings Growth Chart */}
                                <div className="bg-card rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Savings Growth Projection</h3>
                                    <div style={{ height: '400px' }}>
                                        <canvas ref={savingsChartRef}></canvas>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Strategies Tab */}
                        {activeTab === 'strategies' && (
                            <div className="space-y-8">
                                {/* Income Strategies */}
                                <div className="bg-card rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Retirement Income Strategies</h3>
                                    <div className="space-y-6">
                                        {incomeStrategies.map((strategy, index) => (
                                            <div key={index} className="border-b border-border pb-6 last:border-b-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-lg font-medium text-foreground">{strategy.strategy}</h4>
                                                    <button
                                                        onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                                                        className="text-primary hover:text-primary/90"
                                                    >
                                                        <i className={`fas fa-chevron-${expandedSection === index ? 'up' : 'down'}`}></i>
                                                    </button>
                                                </div>
                                                <p className="text-muted-foreground mt-2">{strategy.description}</p>
                                                
                                                {expandedSection === index && (
                                                    <div className="mt-4 space-y-4">
                                                        <div>
                                                            <h5 className="font-medium text-foreground mb-2">Details:</h5>
                                                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                                {strategy.details.map((detail, i) => (
                                                                    <li key={i}>{detail}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h5 className="font-medium text-green-900 mb-2">Pros:</h5>
                                                                <ul className="list-disc list-inside space-y-1 text-green-700">
                                                                    {strategy.pros.map((pro, i) => (
                                                                        <li key={i}>{pro}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-medium text-red-900 mb-2">Cons:</h5>
                                                                <ul className="list-disc list-inside space-y-1 text-red-700">
                                                                    {strategy.cons.map((con, i) => (
                                                                        <li key={i}>{con}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Withdrawal Strategy Chart */}
                                <div className="bg-card rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Optimal Withdrawal Strategy</h3>
                                    <div style={{ height: '400px' }}>
                                        <canvas ref={withdrawalChartRef}></canvas>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Income Planning Tab */}
                        {activeTab === 'income' && (
                            <div className="space-y-8">
                                {/* Expense Categories */}
                                <div className="bg-card rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Typical Retirement Expenses</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-background">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Percentage</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-card divide-y divide-gray-200">
                                                {expenseCategories.map((category, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{category.category}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{category.percentage}%</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">${category.amount.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-sm text-muted-foreground">{category.description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-background">
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Total</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">100%</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">$8,000</td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground">Total monthly expenses</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Income Sources */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-card rounded-lg shadow-sm p-6">
                                        <h3 className="text-lg font-medium text-foreground mb-4">Income Sources</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-foreground">Social Security</span>
                                                <span className="text-sm text-muted-foreground">$2,400/month</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-foreground">Pension</span>
                                                <span className="text-sm text-muted-foreground">$1,200/month</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-foreground">401(k) Withdrawal</span>
                                                <span className="text-sm text-muted-foreground">$2,000/month</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-foreground">IRA Withdrawal</span>
                                                <span className="text-sm text-muted-foreground">$1,500/month</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-foreground">Part-time Work</span>
                                                <span className="text-sm text-muted-foreground">$900/month</span>
                                            </div>
                                            <div className="border-t pt-4">
                                                <div className="flex justify-between items-center font-medium">
                                                    <span className="text-foreground">Total Income</span>
                                                    <span className="text-foreground">$8,000/month</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-card rounded-lg shadow-sm p-6">
                                        <h3 className="text-lg font-medium text-foreground mb-4">Key Considerations</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                                <p className="text-sm text-foreground">Plan for healthcare cost increases</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                                <p className="text-sm text-foreground">Consider inflation impact on expenses</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                                <p className="text-sm text-foreground">Review and adjust annually</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                                <p className="text-sm text-foreground">Maintain emergency fund</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                                <p className="text-sm text-foreground">Plan for long-term care costs</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Checklist Tab */}
                        {activeTab === 'checklist' && (
                            <div className="space-y-8">
                                <div className="bg-card rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Retirement Planning Checklist</h3>
                                    <div className="space-y-6">
                                        {/* Ages 40-50 */}
                                        <div>
                                            <h4 className="font-medium text-foreground mb-3">Ages 40-50: Building Foundation</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Maximize employer 401(k) match</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Open and fund IRA accounts</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Create emergency fund (3-6 months expenses)</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Review and update beneficiaries</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Ages 50-60 */}
                                        <div>
                                            <h4 className="font-medium text-foreground mb-3">Ages 50-60: Accelerating Savings</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Take advantage of catch-up contributions</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Estimate retirement expenses and income needs</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Consider long-term care insurance</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Review asset allocation strategy</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Ages 60-65 */}
                                        <div>
                                            <h4 className="font-medium text-foreground mb-3">Ages 60-65: Pre-Retirement</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Develop withdrawal strategy</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Understand Medicare options</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Plan Social Security claiming strategy</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Consider housing decisions</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Ages 65+ */}
                                        <div>
                                            <h4 className="font-medium text-foreground mb-3">Ages 65+: In Retirement</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Enroll in Medicare</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Begin Social Security benefits</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Plan for Required Minimum Distributions</span>
                                                </label>
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded"/>
                                                    <span className="text-sm text-foreground">Review estate planning documents</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Call to Action */}
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-blue-900 mb-2">Ready to Take Action?</h3>
                                    <p className="text-blue-700 mb-4">Get personalized retirement planning guidance from our certified financial advisors.</p>
                                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
                                        Schedule Free Consultation
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="bg-gray-800 text-primary-foreground py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h3 className="text-lg font-medium mb-2">SeniorSimple</h3>
                                <p className="text-gray-400">Your trusted partner in retirement planning</p>
                            </div>
                        </div>
                    </footer>
                </div>
            );
        };

        ReactDOM.render(<RetirementPlanningGuide />, document.getElementById('root'));

export default RetirementPlanningGuide;
