'use client';

import React, { useState, useEffect } from 'react';

interface EstatePlanningEssentialsProps {
  // Add your props here
}

interface EstatePlanningEssentialsState {
  activeTab: string;
  checkedItems: Record<string, any>;
  priorityLevel: string;
  estateValue: number;
}

const { useState, useEffect } = React;

        const EstatePlanningEssentials = () => {
            const [activeTab, setActiveTab] = useState('overview');
            const [checkedItems, setCheckedItems] = useState({});
            const [priorityLevel, setPriorityLevel] = useState('basic');
            const [estateValue, setEstateValue] = useState(500000);

            const handleCheckboxChange = (id) => {
                setCheckedItems(prev => ({
                    ...prev,
                    [id]: !prev[id]
                }));
            };

            const essentialDocuments = [
                {
                    id: 'will',
                    title: 'Last Will and Testament',
                    description: 'Directs how your assets will be distributed after death',
                    priority: 'high',
                    estimated_cost: '$300-$1,000',
                    timeline: '2-4 weeks'
                },
                {
                    id: 'trust',
                    title: 'Revocable Living Trust',
                    description: 'Avoids probate and provides privacy for asset distribution',
                    priority: 'high',
                    estimated_cost: '$1,200-$3,000',
                    timeline: '4-6 weeks'
                },
                {
                    id: 'financial_poa',
                    title: 'Financial Power of Attorney',
                    description: 'Authorizes someone to manage your financial affairs if incapacitated',
                    priority: 'high',
                    estimated_cost: '$200-$400',
                    timeline: '1-2 weeks'
                },
                {
                    id: 'healthcare_poa',
                    title: 'Healthcare Power of Attorney',
                    description: 'Designates someone to make medical decisions on your behalf',
                    priority: 'high',
                    estimated_cost: '$150-$300',
                    timeline: '1-2 weeks'
                },
                {
                    id: 'advance_directive',
                    title: 'Advance Healthcare Directive',
                    description: 'Outlines your wishes for end-of-life medical care',
                    priority: 'high',
                    estimated_cost: '$100-$200',
                    timeline: '1 week'
                },
                {
                    id: 'guardianship',
                    title: 'Guardianship Designations',
                    description: 'Names guardians for minor children',
                    priority: 'high',
                    estimated_cost: '$200-$500',
                    timeline: '2-3 weeks'
                }
            ];

            const planningSteps = [
                {
                    phase: 'Phase 1: Assessment',
                    timeline: '1-2 weeks',
                    tasks: [
                        'Inventory all assets and debts',
                        'Identify beneficiaries and heirs',
                        'Determine estate planning goals',
                        'Assess current estate tax implications'
                    ]
                },
                {
                    phase: 'Phase 2: Document Creation',
                    timeline: '4-8 weeks',
                    tasks: [
                        'Draft will and/or trust documents',
                        'Prepare power of attorney forms',
                        'Create healthcare directives',
                        'Review and finalize all documents'
                    ]
                },
                {
                    phase: 'Phase 3: Implementation',
                    timeline: '2-4 weeks',
                    tasks: [
                        'Fund trust with assets',
                        'Update beneficiary designations',
                        'Store documents securely',
                        'Communicate plan to family'
                    ]
                },
                {
                    phase: 'Phase 4: Maintenance',
                    timeline: 'Ongoing',
                    tasks: [
                        'Review plan annually',
                        'Update after major life events',
                        'Adjust for tax law changes',
                        'Maintain current beneficiaries'
                    ]
                }
            ];

            const EstateValueChart = () => {
                useEffect(() => {
                    const ctx = document.getElementById('estateValueChart');
                    if (ctx) {
                        new Chart(ctx, {
                            type: 'doughnut',
                            data: {
                                labels: ['Real Estate', 'Retirement Accounts', 'Investments', 'Life Insurance', 'Other Assets'],
                                datasets: [{
                                    data: [35, 25, 20, 15, 5],
                                    backgroundColor: [
                                        '#3B82F6',
                                        '#10B981',
                                        '#F59E0B',
                                        '#EF4444',
                                        '#6B7280'
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
                }, []);

                return (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Typical Estate Asset Distribution</h3>
                        <div style={{ height: '300px' }}>
                            <canvas id="estateValueChart"></canvas>
                        </div>
                    </div>
                );
            };

            const TaxImplicationChart = () => {
                useEffect(() => {
                    const ctx = document.getElementById('taxChart');
                    if (ctx) {
                        new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: ['$500K', '$1M', '$2M', '$5M', '$10M'],
                                datasets: [{
                                    label: 'Federal Estate Tax',
                                    data: [0, 0, 0, 360000, 3600000],
                                    backgroundColor: '#EF4444'
                                }, {
                                    label: 'State Estate Tax (avg)',
                                    data: [0, 0, 20000, 200000, 800000],
                                    backgroundColor: '#F59E0B'
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
                                }
                            }
                        });
                    }
                }, []);

                return (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Estate Tax Implications by Value</h3>
                        <div style={{ height: '300px' }}>
                            <canvas id="taxChart"></canvas>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            *Based on 2024 federal exemption of $13.61M and average state rates
                        </p>
                    </div>
                );
            };

            const DocumentChecklist = () => (
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-6">Essential Documents Checklist</h3>
                    <div className="space-y-4">
                        {essentialDocuments.map((doc) => (
                            <div key={doc.id} className="border rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id={doc.id}
                                        checked={checkedItems[doc.id] || false}
                                        onChange={() => handleCheckboxChange(doc.id)}
                                        className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                                    />
                                    <div className="flex-1">
                                        <label htmlFor={doc.id} className="font-medium text-foreground cursor-pointer">
                                            {doc.title}
                                        </label>
                                        <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                            <span className="text-trust-green">
                                                <i className="fas fa-dollar-sign mr-1"></i>
                                                {doc.estimated_cost}
                                            </span>
                                            <span className="text-primary">
                                                <i className="fas fa-clock mr-1"></i>
                                                {doc.timeline}
                                            </span>
                                            <span className={`${doc.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                                {doc.priority} priority
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

            const PlanningTimeline = () => (
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-6">Estate Planning Timeline</h3>
                    <div className="space-y-6">
                        {planningSteps.map((step, index) => (
                            <div key={index} className="flex">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm mr-4">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-foreground">{step.phase}</h4>
                                        <span className="text-sm text-muted-foreground">{step.timeline}</span>
                                    </div>
                                    <ul className="space-y-1">
                                        {step.tasks.map((task, taskIndex) => (
                                            <li key={taskIndex} className="text-sm text-muted-foreground flex items-center">
                                                <i className="fas fa-check text-green-500 mr-2"></i>
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

            const WillVsTrustComparison = () => (
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-6">Will vs Trust Comparison</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-background">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Feature</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Will</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Trust</th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Probate</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-destructive">Required</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-green">Avoided</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Privacy</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-destructive">Public Record</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-green">Private</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Cost</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-green">$300-$1,000</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-warning">$1,200-$3,000</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Flexibility</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-warning">Limited</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-green">High</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Incapacity Planning</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-destructive">No</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-green">Yes</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Time to Distribute</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-destructive">6-18 months</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-green">Immediate</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );

            const EstateValueCalculator = () => (
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-6">Estate Value Calculator</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Total Estate Value
                            </label>
                            <input
                                type="range"
                                min="100000"
                                max="10000000"
                                step="100000"
                                value={estateValue}
                                onChange={(e) => setEstateValue(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                <span>$100K</span>
                                <span className="font-medium">${estateValue.toLocaleString()}</span>
                                <span>$10M</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Federal Estate Tax</h4>
                                <p className="text-2xl font-bold text-primary">
                                    ${estateValue > 13610000 ? ((estateValue - 13610000) * 0.40).toLocaleString() : '0'}
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    2024 exemption: $13.61M
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Estimated State Tax</h4>
                                <p className="text-2xl font-bold text-trust-green">
                                    ${estateValue > 1000000 ? ((estateValue - 1000000) * 0.10).toLocaleString() : '0'}
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                    Varies by state
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-medium text-yellow-900 mb-2">Recommended Actions</h4>
                            <ul className="text-sm space-y-1">
                                {estateValue > 13610000 && (
                                    <li className="flex items-center text-yellow-700">
                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                        Consider advanced tax planning strategies
                                    </li>
                                )}
                                {estateValue > 1000000 && (
                                    <li className="flex items-center text-yellow-700">
                                        <i className="fas fa-shield-alt mr-2"></i>
                                        Revocable living trust recommended
                                    </li>
                                )}
                                <li className="flex items-center text-yellow-700">
                                    <i className="fas fa-file-contract mr-2"></i>
                                    Update beneficiary designations
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            );

            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-foreground mb-4">
                            Estate Planning Essentials
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Protect your legacy and provide for your loved ones with comprehensive estate planning. 
                            Get step-by-step guidance, essential documents, and expert strategies.
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mb-8">
                        <nav className="flex space-x-8 border-b border-border">
                            {[
                                { id: 'overview', label: 'Overview', icon: 'fas fa-home' },
                                { id: 'documents', label: 'Documents', icon: 'fas fa-file-alt' },
                                { id: 'planning', label: 'Planning', icon: 'fas fa-tasks' },
                                { id: 'calculator', label: 'Calculator', icon: 'fas fa-calculator' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <i className={`${tab.icon} mr-2`}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-8">
                        {activeTab === 'overview' && (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <EstateValueChart />
                                    <TaxImplicationChart />
                                </div>
                                <WillVsTrustComparison />
                                
                                <div className="bg-blue-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                        Why Estate Planning Matters
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-shield-alt text-primary mt-1"></i>
                                                <div>
                                                    <h4 className="font-medium text-blue-900">Protect Your Family</h4>
                                                    <p className="text-sm text-blue-700">Ensure your loved ones are cared for according to your wishes</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-money-bill-wave text-primary mt-1"></i>
                                                <div>
                                                    <h4 className="font-medium text-blue-900">Minimize Taxes</h4>
                                                    <p className="text-sm text-blue-700">Reduce estate and inheritance taxes through proper planning</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-gavel text-primary mt-1"></i>
                                                <div>
                                                    <h4 className="font-medium text-blue-900">Avoid Probate</h4>
                                                    <p className="text-sm text-blue-700">Keep your affairs private and speed up asset distribution</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <i className="fas fa-heart text-primary mt-1"></i>
                                                <div>
                                                    <h4 className="font-medium text-blue-900">Peace of Mind</h4>
                                                    <p className="text-sm text-blue-700">Rest easy knowing your affairs are in order</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'documents' && (
                            <DocumentChecklist />
                        )}

                        {activeTab === 'planning' && (
                            <PlanningTimeline />
                        )}

                        {activeTab === 'calculator' && (
                            <EstateValueCalculator />
                        )}
                    </div>

                    {/* Call to Action */}
                    <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center">
                        <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                            Ready to Protect Your Legacy?
                        </h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Don't wait to secure your family's future. Get personalized estate planning guidance 
                            from our certified professionals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-card text-primary px-8 py-3 rounded-lg font-semibold hover:bg-muted/80 transition">
                                <i className="fas fa-phone mr-2"></i>
                                Schedule Free Consultation
                            </button>
                            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition">
                                <i className="fas fa-download mr-2"></i>
                                Download Estate Planning Guide
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        ReactDOM.render(<EstatePlanningEssentials />, document.getElementById('root'));

export default EstatePlanningEssentials;
