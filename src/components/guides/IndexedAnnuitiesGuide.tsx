'use client';

import React, { useState, useEffect } from 'react';

interface IndexedAnnuitiesGuideProps {
  // Add your props here
}

interface IndexedAnnuitiesGuideState {
  activeTab: string;
  calculatorInputs: Record<string, any>;
}

const { useState, useEffect } = React;

        const IndexedAnnuitiesGuide = () => {
            const [activeTab, setActiveTab] = useState('overview');
            const [calculatorInputs, setCalculatorInputs] = useState({
                initialInvestment: 100000,
                participationRate: 80,
                years: 10
            });

            useEffect(() => {
                // Performance Comparison Chart
                const ctx1 = document.getElementById('performanceChart');
                if (ctx1) {
                    new Chart(ctx1, {
                        type: 'line',
                        data: {
                            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'],
                            datasets: [{
                                label: 'Indexed Annuity',
                                data: [100000, 107000, 109000, 118000, 125000, 128000, 135000, 142000, 145000, 155000],
                                borderColor: 'rgb(34, 197, 94)',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                tension: 0.1
                            }, {
                                label: 'S&P 500 (with losses)',
                                data: [100000, 112000, 105000, 125000, 118000, 135000, 128000, 148000, 135000, 165000],
                                borderColor: 'rgb(239, 68, 68)',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Performance Comparison: Indexed Annuity vs Market'
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: false,
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

                // Protection Features Chart
                const ctx2 = document.getElementById('protectionChart');
                if (ctx2) {
                    new Chart(ctx2, {
                        type: 'bar',
                        data: {
                            labels: ['Principal Protection', 'Market Participation', 'Guaranteed Income', 'Tax Deferral'],
                            datasets: [{
                                label: 'Indexed Annuity Benefits',
                                data: [100, 75, 90, 85],
                                backgroundColor: [
                                    'rgba(34, 197, 94, 0.8)',
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(168, 85, 247, 0.8)',
                                    'rgba(245, 158, 11, 0.8)'
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
                                    text: 'Key Protection Features Score'
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100,
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
            }, []);

            const calculateProjectedValue = () => {
                const { initialInvestment, participationRate, years } = calculatorInputs;
                const avgMarketReturn = 0.07; // 7% average market return
                const participationFactor = participationRate / 100;
                const projectedReturn = avgMarketReturn * participationFactor;
                return initialInvestment * Math.pow(1 + projectedReturn, years);
            };

            const TabButton = ({ id, label, isActive, onClick }) => (
                <button
                    onClick={() => onClick(id)}
                    className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                        isActive 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {label}
                </button>
            );

            return (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <i className="fas fa-lock mr-2"></i>
                            SECRET STRATEGY
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            The Indexed Annuities Secret
                        </h1>
                        <p className="text-xl text-muted-foreground mb-6">
                            Market Gains Without Market Risk - The Retirement Strategy Wall Street Doesn't Want You to Know
                        </p>
                        <div className="flex justify-center items-center space-x-4 text-sm text-muted-foreground">
                            <span><i className="fas fa-clock mr-1"></i> 12 min read</span>
                            <span><i className="fas fa-tag mr-1"></i> Annuities</span>
                            <span><i className="fas fa-signal mr-1"></i> Beginner</span>
                        </div>
                    </div>

                    {/* Key Benefits Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-card rounded-lg shadow-lg p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-shield-alt text-2xl text-trust-green"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">100% Principal Protection</h3>
                            <p className="text-muted-foreground">Your initial investment is guaranteed - never lose your principal to market downturns</p>
                        </div>
                        <div className="bg-card rounded-lg shadow-lg p-6 text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-chart-line text-2xl text-primary"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Market Upside Participation</h3>
                            <p className="text-muted-foreground">Participate in market gains through index linking while avoiding losses</p>
                        </div>
                        <div className="bg-card rounded-lg shadow-lg p-6 text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-coins text-2xl text-purple-600"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Guaranteed Income Options</h3>
                            <p className="text-muted-foreground">Convert to guaranteed lifetime income when you're ready to retire</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        <TabButton 
                            id="overview" 
                            label="Overview" 
                            isActive={activeTab === 'overview'} 
                            onClick={setActiveTab} 
                        />
                        <TabButton 
                            id="comparison" 
                            label="Comparison" 
                            isActive={activeTab === 'comparison'} 
                            onClick={setActiveTab} 
                        />
                        <TabButton 
                            id="calculator" 
                            label="Calculator" 
                            isActive={activeTab === 'calculator'} 
                            onClick={setActiveTab} 
                        />
                        <TabButton 
                            id="strategies" 
                            label="Strategies" 
                            isActive={activeTab === 'strategies'} 
                            onClick={setActiveTab} 
                        />
                    </div>

                    {/* Tab Content */}
                    <div className="bg-card rounded-lg shadow-lg p-8">
                        {activeTab === 'overview' && (
                            <div>
                                <h2 className="text-3xl font-bold mb-6">What Are Indexed Annuities?</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-lg text-foreground mb-4">
                                            Indexed annuities are insurance products that offer a unique combination of safety and growth potential. 
                                            Unlike traditional investments, they protect your principal while allowing you to participate in market gains.
                                        </p>
                                        <p className="text-lg text-foreground mb-6">
                                            Think of it as having the best of both worlds: the safety of a bank CD with the growth potential of market investments.
                                        </p>
                                        
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                            <div className="flex">
                                                <i className="fas fa-lightbulb text-yellow-400 mr-3 mt-1"></i>
                                                <div>
                                                    <h4 className="font-semibold text-yellow-800">Key Insight</h4>
                                                    <p className="text-yellow-700">
                                                        Wall Street doesn't promote indexed annuities because they can't charge ongoing management fees like they do with mutual funds and ETFs.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">How They Work</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-3">
                                                    <span className="text-primary font-bold text-sm">1</span>
                                                </div>
                                                <p className="text-foreground">You make an initial investment (premium) with an insurance company</p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-3">
                                                    <span className="text-primary font-bold text-sm">2</span>
                                                </div>
                                                <p className="text-foreground">Your gains are linked to a market index (like the S&P 500)</p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-3">
                                                    <span className="text-primary font-bold text-sm">3</span>
                                                </div>
                                                <p className="text-foreground">When the index goes up, you participate in a portion of the gains</p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-3">
                                                    <span className="text-primary font-bold text-sm">4</span>
                                                </div>
                                                <p className="text-foreground">When the index goes down, your principal remains protected</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <h3 className="text-2xl font-bold mb-6">Performance Comparison</h3>
                                    <div style={{ height: '400px' }}>
                                        <canvas id="performanceChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'comparison' && (
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Investment Comparison</h2>
                                
                                <div className="overflow-x-auto mb-8">
                                    <table className="w-full border-collapse bg-card">
                                        <thead>
                                            <tr className="bg-muted">
                                                <th className="border border-input px-4 py-3 text-left font-semibold">Feature</th>
                                                <th className="border border-input px-4 py-3 text-center font-semibold">Indexed Annuity</th>
                                                <th className="border border-input px-4 py-3 text-center font-semibold">Stock Market</th>
                                                <th className="border border-input px-4 py-3 text-center font-semibold">Bank CD</th>
                                                <th className="border border-input px-4 py-3 text-center font-semibold">401(k)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-input px-4 py-3 font-medium">Principal Protection</td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                            </tr>
                                            <tr className="bg-background">
                                                <td className="border border-input px-4 py-3 font-medium">Market Upside Potential</td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-input px-4 py-3 font-medium">Tax Deferral</td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                            </tr>
                                            <tr className="bg-background">
                                                <td className="border border-input px-4 py-3 font-medium">Guaranteed Income Option</td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-input px-4 py-3 font-medium">No Annual Fees</td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-check text-green-500 text-xl"></i>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-center">
                                                    <i className="fas fa-times text-red-500 text-xl"></i>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold mb-6">Protection Features Analysis</h3>
                                    <div style={{ height: '400px' }}>
                                        <canvas id="protectionChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'calculator' && (
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Indexed Annuity Calculator</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-background p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold mb-4">Your Investment Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">
                                                    Initial Investment
                                                </label>
                                                <input
                                                    type="number"
                                                    value={calculatorInputs.initialInvestment}
                                                    onChange={(e) => setCalculatorInputs({
                                                        ...calculatorInputs,
                                                        initialInvestment: parseInt(e.target.value) || 0
                                                    })}
                                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">
                                                    Participation Rate (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={calculatorInputs.participationRate}
                                                    onChange={(e) => setCalculatorInputs({
                                                        ...calculatorInputs,
                                                        participationRate: parseInt(e.target.value) || 0
                                                    })}
                                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">
                                                    Investment Period (Years)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={calculatorInputs.years}
                                                    onChange={(e) => setCalculatorInputs({
                                                        ...calculatorInputs,
                                                        years: parseInt(e.target.value) || 0
                                                    })}
                                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold mb-4">Projected Results</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-foreground">Initial Investment:</span>
                                                <span className="font-bold text-lg">
                                                    ${calculatorInputs.initialInvestment.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-foreground">Projected Value:</span>
                                                <span className="font-bold text-lg text-trust-green">
                                                    ${Math.round(calculateProjectedValue()).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-foreground">Total Gain:</span>
                                                <span className="font-bold text-lg text-primary">
                                                    ${Math.round(calculateProjectedValue() - calculatorInputs.initialInvestment).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-foreground">Effective Annual Return:</span>
                                                <span className="font-bold text-lg text-purple-600">
                                                    {((Math.pow(calculateProjectedValue() / calculatorInputs.initialInvestment, 1 / calculatorInputs.years) - 1) * 100).toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-6 p-4 bg-card rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                Results are projected based on historical market performance and are not guaranteed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'strategies' && (
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Strategic Implementation</h2>
                                
                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    <div className="bg-green-50 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold mb-4 text-green-800">
                                            <i className="fas fa-thumbs-up mr-2"></i>
                                            Best Suited For
                                        </h3>
                                        <ul className="space-y-2 text-green-700">
                                            <li className="flex items-start">
                                                <i className="fas fa-check-circle mr-2 mt-1"></i>
                                                Conservative investors seeking growth
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-check-circle mr-2 mt-1"></i>
                                                Pre-retirees (ages 50-65)
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-check-circle mr-2 mt-1"></i>
                                                Those with 401(k) rollovers
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-check-circle mr-2 mt-1"></i>
                                                People seeking tax deferral
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-check-circle mr-2 mt-1"></i>
                                                Those wanting guaranteed income options
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    <div className="bg-red-50 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold mb-4 text-red-800">
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            Important Considerations
                                        </h3>
                                        <ul className="space-y-2 text-red-700">
                                            <li className="flex items-start">
                                                <i className="fas fa-exclamation-circle mr-2 mt-1"></i>
                                                Surrender charges for early withdrawal
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-exclamation-circle mr-2 mt-1"></i>
                                                Caps on market participation
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-exclamation-circle mr-2 mt-1"></i>
                                                Complexity of product features
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-exclamation-circle mr-2 mt-1"></i>
                                                Insurance company credit risk
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-exclamation-circle mr-2 mt-1"></i>
                                                Limited liquidity during term
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-8 rounded-lg">
                                    <h3 className="text-2xl font-bold mb-4 text-blue-800">Implementation Steps</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold mb-3">Phase 1: Education & Analysis</h4>
                                            <ol className="space-y-2 text-blue-700">
                                                <li>1. Assess your risk tolerance</li>
                                                <li>2. Review current portfolio allocation</li>
                                                <li>3. Understand product features</li>
                                                <li>4. Compare different carriers</li>
                                            </ol>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-3">Phase 2: Selection & Purchase</h4>
                                            <ol className="space-y-2 text-blue-700">
                                                <li>1. Choose participation rate and caps</li>
                                                <li>2. Select index allocation</li>
                                                <li>3. Decide on income riders</li>
                                                <li>4. Complete application process</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Call to Action */}
                    <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-primary-foreground rounded-lg p-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Explore Indexed Annuities?</h2>
                        <p className="text-xl mb-6">
                            Discover how indexed annuities can provide market gains without market risk for your retirement portfolio.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-card text-primary px-8 py-3 rounded-lg font-semibold hover:bg-muted/80 transition-colors">
                                Get Free Analysis
                            </button>
                            <button className="bg-transparent border-2 border-white text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                                Download Guide
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        ReactDOM.render(<IndexedAnnuitiesGuide />, document.getElementById('root'));

export default IndexedAnnuitiesGuide;
