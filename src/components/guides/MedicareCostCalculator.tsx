import React, { useState, useCallback } from 'react';

interface MedicareCostCalculatorProps {
  className?: string;
}

export default function MedicareCostCalculator({ className }: MedicareCostCalculatorProps = {}) {
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  }, []);

  const handleCalculate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    try {
      // Add calculation logic here
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate calculation
      setResults(formData);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [formData]);

  return (
    <div className={`container mx-auto px-4 py-8 ${className || ''}`}>
      const { useState, useEffect, useRef } = React;

        const MedicareCostCalculator = () => {
            const [userInput, setUserInput] = useState({
                age: 65,
                income: 50000,
                state: 'national',
                healthStatus: 'good',
                prescriptions: 2,
                doctorVisits: 4,
                planType: 'original'
            });

            const [results, setResults] = useState({});
            const [showResults, setShowResults] = useState(false);
            const chartRef = useRef(null);
            const chartInstance = useRef(null);

            const states = [
                { value: 'national', label: 'National Average' },
                { value: 'CA', label: 'California' },
                { value: 'TX', label: 'Texas' },
                { value: 'FL', label: 'Florida' },
                { value: 'NY', label: 'New York' },
                { value: 'PA', label: 'Pennsylvania' }
            ];

            const calculateMedicareCosts = () => {
                const { age, income, state, healthStatus, prescriptions, doctorVisits, planType } = userInput;
                
                // Base Medicare costs for 2024
                const partBPremium = income > 97000 ? 174.70 + (income - 97000) * 0.001 : 174.70;
                const partBDeductible = 240;
                const partADeductible = 1632;
                
                // State multipliers
                const stateMultipliers = {
                    'national': 1.0,
                    'CA': 1.2,
                    'TX': 0.9,
                    'FL': 1.1,
                    'NY': 1.3,
                    'PA': 1.05
                };
                
                const multiplier = stateMultipliers[state] || 1.0;
                
                // Health status impact
                const healthMultipliers = {
                    'excellent': 0.8,
                    'good': 1.0,
                    'fair': 1.3,
                    'poor': 1.6
                };
                
                const healthMultiplier = healthMultipliers[healthStatus] || 1.0;
                
                // Calculate costs
                const partA = {
                    premium: 0, // Most people don't pay Part A premium
                    deductible: partADeductible,
                    coinsurance: 408 * healthMultiplier // Average coinsurance
                };
                
                const partB = {
                    premium: partBPremium * 12,
                    deductible: partBDeductible,
                    coinsurance: doctorVisits * 45 * healthMultiplier
                };
                
                const partD = {
                    premium: 456, // Average annual premium
                    deductible: 505,
                    coinsurance: prescriptions * 180 * healthMultiplier
                };
                
                const medigap = {
                    premium: planType === 'medigap' ? 2000 * multiplier : 0
                };
                
                const advantage = {
                    premium: planType === 'advantage' ? 1800 * multiplier : 0,
                    copays: planType === 'advantage' ? doctorVisits * 25 + prescriptions * 15 : 0
                };
                
                const totalOriginal = partA.premium + partA.deductible + partA.coinsurance +
                                   partB.premium + partB.deductible + partB.coinsurance +
                                   partD.premium + partD.deductible + partD.coinsurance +
                                   medigap.premium;
                
                const totalAdvantage = advantage.premium + advantage.copays +
                                     (partB.premium * 0.7); // Advantage plans often have lower Part B costs
                
                return {
                    partA,
                    partB,
                    partD,
                    medigap,
                    advantage,
                    totalOriginal,
                    totalAdvantage,
                    savings: totalOriginal - totalAdvantage
                };
            };

            const handleInputChange = (field, value) => {
                setUserInput(prev => ({
                    ...prev,
                    [field]: value
                }));
            };

            const handleCalculate = () => {
                const calculatedResults = calculateMedicareCosts();
                setResults(calculatedResults);
                setShowResults(true);
            };

            const createChart = () => {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const ctx = chartRef.current.getContext('2d');
                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Part A', 'Part B', 'Part D', 'Medigap/Advantage', 'Total Original', 'Total Advantage'],
                        datasets: [{
                            label: 'Annual Costs ($)',
                            data: [
                                results.partA?.premium + results.partA?.deductible + results.partA?.coinsurance || 0,
                                results.partB?.premium + results.partB?.deductible + results.partB?.coinsurance || 0,
                                results.partD?.premium + results.partD?.deductible + results.partD?.coinsurance || 0,
                                results.medigap?.premium || results.advantage?.premium + results.advantage?.copays || 0,
                                results.totalOriginal || 0,
                                results.totalAdvantage || 0
                            ],
                            backgroundColor: [
                                '#3B82F6',
                                '#10B981',
                                '#F59E0B',
                                '#EF4444',
                                '#8B5CF6',
                                '#06B6D4'
                            ],
                            borderColor: [
                                '#2563EB',
                                '#059669',
                                '#D97706',
                                '#DC2626',
                                '#7C3AED',
                                '#0891B2'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Medicare Cost Breakdown'
                            },
                            legend: {
                                display: false
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
            };

            useEffect(() => {
                if (showResults && Object.keys(results).length > 0) {
                    setTimeout(createChart, 100);
                }
            }, [showResults, results]);

            return (
                <div className="min-h-screen bg-background py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-foreground mb-4">
                                <i className="fas fa-calculator text-primary mr-3"></i>
                                Medicare Cost Calculator
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                                Get personalized Medicare cost estimates based on your specific situation. 
                                Compare Original Medicare vs Medicare Advantage plans.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Input Form */}
                            <div className="lg:col-span-1">
                                <div className="bg-card rounded-lg shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-6">
                                        <i className="fas fa-user-edit text-primary mr-2"></i>
                                        Your Information
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground/90 mb-2">
                                                Age
                                            </label>
                                            <input
                                                type="number"
                                                min="65"
                                                max="100"
                                                value={userInput.age}
                                                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground/90 mb-2">
                                                Annual Income
                                            </label>
                                            <input
                                                type="number"
                                                value={userInput.income}
                                                onChange={(e) => handleInputChange('income', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground/90 mb-2">
                                                State
                                            </label>
                                            <select
                                                value={userInput.state}
                                                onChange={(e) => handleInputChange('state', e.target.value)}
                                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {states.map(state => (
                                                    <option key={state.value} value={state.value}>
                                                        {state.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground/90 mb-2">
                                                Health Status
                                            </label>
                                            <select
                                                value={userInput.healthStatus}
                                                onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="excellent">Excellent</option>
                                                <option value="good">Good</option>
                                                <option value="fair">Fair</option>
                                                <option value="poor">Poor</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground/90 mb-2">
                                                Prescription Medications (per month)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={userInput.prescriptions}
                                                onChange={(e) => handleInputChange('prescriptions', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground/90 mb-2">
                                                Doctor Visits (per year)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={userInput.doctorVisits}
                                                onChange={(e) => handleInputChange('doctorVisits', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground/90 mb-2">
                                                Plan Type
                                            </label>
                                            <select
                                                value={userInput.planType}
                                                onChange={(e) => handleInputChange('planType', e.target.value)}
                                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="original">Original Medicare</option>
                                                <option value="medigap">Original Medicare + Medigap</option>
                                                <option value="advantage">Medicare Advantage</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={handleCalculate}
                                            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 transition duration-200 font-medium"
                                        >
                                            <i className="fas fa-calculator mr-2"></i>
                                            Calculate Costs
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="lg:col-span-2">
                                {showResults && (
                                    <div className="space-y-6">
                                        {/* Cost Summary */}
                                        <div className="bg-card rounded-lg shadow-lg p-6">
                                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                                <i className="fas fa-chart-line text-trust-green mr-2"></i>
                                                Cost Summary
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                <div className="bg-primary/5 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-blue-900 mb-2">Original Medicare + Medigap</h4>
                                                    <p className="text-3xl font-bold text-primary">
                                                        ${results.totalOriginal?.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-primary/90">per year</p>
                                                </div>
                                                
                                                <div className="bg-trust-green/5 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-green-900 mb-2">Medicare Advantage</h4>
                                                    <p className="text-3xl font-bold text-trust-green">
                                                        ${results.totalAdvantage?.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-trust-green/90">per year</p>
                                                </div>
                                            </div>

                                            {results.savings > 0 && (
                                                <div className="bg-warning/5 border border-yellow-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-yellow-900 mb-2">
                                                        <i className="fas fa-piggy-bank text-warning mr-2"></i>
                                                        Potential Savings
                                                    </h4>
                                                    <p className="text-2xl font-bold text-warning">
                                                        ${results.savings?.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-yellow-700">
                                                        Medicare Advantage could save you this much annually
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Detailed Breakdown */}
                                        <div className="bg-card rounded-lg shadow-lg p-6">
                                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                                <i className="fas fa-list-alt text-purple-600 mr-2"></i>
                                                Detailed Cost Breakdown
                                            </h3>
                                            
                                            <div className="overflow-x-auto">
                                                <table className="w-full table-auto">
                                                    <thead>
                                                        <tr className="bg-muted">
                                                            <th className="px-4 py-2 text-left">Medicare Part</th>
                                                            <th className="px-4 py-2 text-right">Premium</th>
                                                            <th className="px-4 py-2 text-right">Deductible</th>
                                                            <th className="px-4 py-2 text-right">Est. Out-of-Pocket</th>
                                                            <th className="px-4 py-2 text-right">Total Annual</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-b">
                                                            <td className="px-4 py-2 font-medium">Part A (Hospital)</td>
                                                            <td className="px-4 py-2 text-right">${results.partA?.premium?.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right">${results.partA?.deductible?.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right">${results.partA?.coinsurance?.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right font-semibold">
                                                                ${(results.partA?.premium + results.partA?.deductible + results.partA?.coinsurance)?.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="px-4 py-2 font-medium">Part B (Medical)</td>
                                                            <td className="px-4 py-2 text-right">${results.partB?.premium?.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right">${results.partB?.deductible?.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right">${results.partB?.coinsurance?.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right font-semibold">
                                                                ${(results.partB?.premium + results.partB?.deductible + results.partB?.coinsurance)?.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="px-4 py-2 font-medium">Part D (Prescription)</td>
                                                            <td className="px-4 py-2 text-right">${results.partD?.premium?.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right">${results.partD?.deductible?.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right">${results.partD?.coinsurance?.toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right font-semibold">
                                                                ${(results.partD?.premium + results.partD?.deductible + results.partD?.coinsurance)?.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                        {userInput.planType === 'medigap' && (
                                                            <tr className="border-b">
                                                                <td className="px-4 py-2 font-medium">Medigap Insurance</td>
                                                                <td className="px-4 py-2 text-right">${results.medigap?.premium?.toLocaleString()}</td>
                                                                <td className="px-4 py-2 text-right">$0</td>
                                                                <td className="px-4 py-2 text-right">$0</td>
                                                                <td className="px-4 py-2 text-right font-semibold">
                                                                    ${results.medigap?.premium?.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Chart */}
                                        <div className="bg-card rounded-lg shadow-lg p-6">
                                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                                <i className="fas fa-chart-bar text-indigo-600 mr-2"></i>
                                                Cost Comparison Chart
                                            </h3>
                                            <div className="relative" style={{height: '400px'}}>
                                                <canvas ref={chartRef}></canvas>
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div className="bg-card rounded-lg shadow-lg p-6">
                                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                                <i className="fas fa-lightbulb text-warning mr-2"></i>
                                                Recommendations
                                            </h3>
                                            
                                            <div className="space-y-4">
                                                <div className="bg-primary/5 border-l-4 border-blue-400 p-4">
                                                    <h4 className="font-semibold text-blue-900 mb-2">Best Option for You</h4>
                                                    <p className="text-primary/90">
                                                        {results.savings > 0 
                                                            ? `Medicare Advantage could save you $${results.savings.toLocaleString()} annually based on your profile.`
                                                            : 'Original Medicare with Medigap appears to be the better value for your situation.'
                                                        }
                                                    </p>
                                                </div>

                                                <div className="bg-trust-green/5 border-l-4 border-green-400 p-4">
                                                    <h4 className="font-semibold text-green-900 mb-2">Next Steps</h4>
                                                    <ul className="text-trust-green/90 space-y-1">
                                                        <li>â¢ Compare specific plans in your area</li>
                                                        <li>â¢ Check if your doctors accept the plan</li>
                                                        <li>â¢ Review prescription drug coverage</li>
                                                        <li>â¢ Consider your health needs and budget</li>
                                                    </ul>
                                                </div>

                                                <div className="bg-warning/5 border-l-4 border-yellow-400 p-4">
                                                    <h4 className="font-semibold text-yellow-900 mb-2">Important Note</h4>
                                                    <p className="text-yellow-700">
                                                        These are estimates based on national averages. Actual costs may vary based on 
                                                        your specific health needs, location, and chosen plans. Consult with a Medicare 
                                                        specialist for personalized advice.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!showResults && (
                                    <div className="bg-card rounded-lg shadow-lg p-8 text-center">
                                        <i className="fas fa-info-circle text-6xl text-blue-200 mb-4"></i>
                                        <h3 className="text-2xl font-bold text-foreground mb-4">
                                            Get Your Medicare Cost Estimate
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            Fill out the form on the left to get a personalized estimate of your Medicare costs. 
                                            Our calculator will show you detailed breakdowns and help you compare your options.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="bg-primary/5 p-4 rounded-lg">
                                                <i className="fas fa-calculator text-primary text-2xl mb-2"></i>
                                                <h4 className="font-semibold text-blue-900">Accurate Estimates</h4>
                                                <p className="text-primary/90">Based on current Medicare rates and your specific situation</p>
                                            </div>
                                            <div className="bg-trust-green/5 p-4 rounded-lg">
                                                <i className="fas fa-chart-line text-trust-green text-2xl mb-2"></i>
                                                <h4 className="font-semibold text-green-900">Visual Comparisons</h4>
                                                <p className="text-trust-green/90">Easy-to-understand charts and breakdowns</p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <i className="fas fa-recommendations text-purple-600 text-2xl mb-2"></i>
                                                <h4 className="font-semibold text-purple-900">Personalized Advice</h4>
                                                <p className="text-purple-700">Tailored recommendations for your needs</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 text-center text-muted-foreground">
                            <p className="mb-4">
                                <i className="fas fa-shield-alt text-primary mr-2"></i>
                                This calculator provides estimates based on current Medicare rates and should not replace 
                                professional Medicare guidance.
                            </p>
                            <p>
                                <strong>SeniorSimple</strong> - Your trusted partner in retirement planning
                            </p>
                        </div>
                    </div>
                </div>
            );
        };

        ReactDOM.render(<MedicareCostCalculator />, document.getElementById('root'));
    </div>
  );
}