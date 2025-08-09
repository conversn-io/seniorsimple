import React, { useState } from 'react';

const LifeInsuranceRetirementGuide: React.FC = () => {
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
      const { useState, useEffect } = React;

        const LifeInsuranceRetirementGuide = () => {
            const [currentStep, setCurrentStep] = useState(0);
            const [userAnswers, setUserAnswers] = useState({});
            const [showRecommendation, setShowRecommendation] = useState(false);

            const decisionTree = [
                {
                    id: 'financial_independence',
                    question: 'Are you financially independent with sufficient retirement savings?',
                    options: [
                        { value: 'yes', label: 'Yes, I have adequate retirement funds', next: 'dependents' },
                        { value: 'no', label: 'No, I need income replacement', next: 'income_replacement' }
                    ]
                },
                {
                    id: 'dependents',
                    question: 'Do you have dependents who rely on your income?',
                    options: [
                        { value: 'yes', label: 'Yes, I have dependents', next: 'legacy_goals' },
                        { value: 'no', label: 'No dependents', next: 'final_expenses' }
                    ]
                },
                {
                    id: 'income_replacement',
                    question: 'How many years of income replacement do you need?',
                    options: [
                        { value: '5-10', label: '5-10 years', next: 'term_vs_permanent' },
                        { value: '10-20', label: '10-20 years', next: 'term_vs_permanent' },
                        { value: 'lifetime', label: 'Lifetime coverage', next: 'permanent_type' }
                    ]
                },
                {
                    id: 'legacy_goals',
                    question: 'What are your legacy planning goals?',
                    options: [
                        { value: 'wealth_transfer', label: 'Wealth transfer to heirs', next: 'permanent_type' },
                        { value: 'charity', label: 'Charitable giving', next: 'permanent_type' },
                        { value: 'basic_protection', label: 'Basic protection only', next: 'final_expenses' }
                    ]
                },
                {
                    id: 'final_expenses',
                    question: 'Do you want to cover final expenses and small debts?',
                    options: [
                        { value: 'yes', label: 'Yes, cover final expenses', next: 'recommendation' },
                        { value: 'no', label: 'No additional coverage needed', next: 'recommendation' }
                    ]
                },
                {
                    id: 'term_vs_permanent',
                    question: 'What\'s your priority: lower premiums or cash value?',
                    options: [
                        { value: 'lower_premiums', label: 'Lower premiums (Term)', next: 'recommendation' },
                        { value: 'cash_value', label: 'Cash value building (Permanent)', next: 'permanent_type' }
                    ]
                },
                {
                    id: 'permanent_type',
                    question: 'What type of permanent insurance interests you most?',
                    options: [
                        { value: 'whole_life', label: 'Whole Life (Guaranteed growth)', next: 'recommendation' },
                        { value: 'universal_life', label: 'Universal Life (Flexible premiums)', next: 'recommendation' },
                        { value: 'variable_life', label: 'Variable Life (Investment control)', next: 'recommendation' }
                    ]
                }
            ];

            const strategyComparisons = [
                {
                    strategy: 'Self-Insurance',
                    description: 'Rely on existing savings and investments',
                    pros: ['No premium costs', 'Full control of assets', 'Investment flexibility'],
                    cons: ['Market risk', 'No death benefit guarantee', 'May not be sufficient'],
                    bestFor: 'High net worth individuals with substantial liquid assets',
                    cost: '$0 premiums'
                },
                {
                    strategy: 'Term Life Insurance',
                    description: 'Temporary coverage for specific time period',
                    pros: ['Lower premiums', 'Simple coverage', 'Convertible options'],
                    cons: ['Temporary coverage', 'Increasing premiums', 'No cash value'],
                    bestFor: 'Temporary income replacement needs',
                    cost: '$50-300/month'
                },
                {
                    strategy: 'Whole Life Insurance',
                    description: 'Permanent coverage with guaranteed cash value',
                    pros: ['Guaranteed growth', 'Tax-deferred savings', 'Stable premiums'],
                    cons: ['Higher premiums', 'Lower returns', 'Less flexibility'],
                    bestFor: 'Conservative savers wanting guarantees',
                    cost: '$200-800/month'
                },
                {
                    strategy: 'Universal Life Insurance',
                    description: 'Flexible permanent coverage with investment options',
                    pros: ['Premium flexibility', 'Investment options', 'Tax advantages'],
                    cons: ['Market risk', 'Complex structure', 'Potential premium increases'],
                    bestFor: 'Those wanting flexibility and growth potential',
                    cost: '$150-600/month'
                }
            ];

            const getCurrentQuestion = () => {
                return decisionTree.find(q => q.id === (currentStep === 0 ? 'financial_independence' : 
                    decisionTree[currentStep - 1]?.options?.find(opt => opt.value === userAnswers[decisionTree[currentStep - 1]?.id])?.next));
            };

            const handleAnswer = (questionId, answer) => {
                setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
                
                const question = decisionTree.find(q => q.id === questionId);
                const selectedOption = question.options.find(opt => opt.value === answer);
                
                if (selectedOption.next === 'recommendation') {
                    setShowRecommendation(true);
                } else {
                    setCurrentStep(prev => prev + 1);
                }
            };

            const getRecommendation = () => {
                const { financial_independence, dependents, income_replacement, legacy_goals, final_expenses, term_vs_permanent, permanent_type } = userAnswers;
                
                if (financial_independence === 'yes' && dependents === 'no' && final_expenses === 'no') {
                    return {
                        type: 'No Life Insurance Needed',
                        reason: 'You appear to be financially independent with no dependents and don\'t need final expense coverage.',
                        action: 'Consider reviewing your decision annually as circumstances change.'
                    };
                }
                
                if (income_replacement === '5-10' && term_vs_permanent === 'lower_premiums') {
                    return {
                        type: 'Term Life Insurance',
                        reason: 'Short-term income replacement needs make term insurance most cost-effective.',
                        action: 'Consider 10-year term policy with conversion options.'
                    };
                }
                
                if (legacy_goals === 'wealth_transfer' || permanent_type) {
                    return {
                        type: permanent_type === 'whole_life' ? 'Whole Life Insurance' : 
                              permanent_type === 'universal_life' ? 'Universal Life Insurance' : 
                              permanent_type === 'variable_life' ? 'Variable Life Insurance' : 'Permanent Life Insurance',
                        reason: 'Your legacy goals and long-term needs align with permanent insurance benefits.',
                        action: 'Consult with a financial advisor to determine optimal coverage amount and premium structure.'
                    };
                }
                
                return {
                    type: 'Term Life Insurance',
                    reason: 'Based on your responses, term insurance provides the most appropriate coverage.',
                    action: 'Consider 15-20 year term policy with adequate coverage for your needs.'
                };
            };

            const CoverageCalculator = () => {
                const [income, setIncome] = useState('');
                const [years, setYears] = useState('');
                const [debts, setDebts] = useState('');
                const [finalExpenses, setFinalExpenses] = useState('');
                const [result, setResult] = useState(null);

                const calculateCoverage = () => {
                    const incomeReplacement = parseInt(income) * parseInt(years);
                    const totalDebts = parseInt(debts) || 0;
                    const expenses = parseInt(finalExpenses) || 50000;
                    const total = incomeReplacement + totalDebts + expenses;
                    
                    setResult({
                        incomeReplacement,
                        totalDebts,
                        finalExpenses: expenses,
                        total
                    });
                };

                return (
                    <div className="bg-card rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">
                            <i className="fas fa-calculator text-primary mr-2"></i>
                            Life Insurance Coverage Calculator
                        </h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Annual Income
                                </label>
                                <input
                                    type="number"
                                    value={income}
                                    onChange={(e) = /> setIncome(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., 75000"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Years of Income Replacement
                                </label>
                                <input
                                    type="number"
                                    value={years}
                                    onChange={(e) = /> setYears(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., 10"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Outstanding Debts
                                </label>
                                <input
                                    type="number"
                                    value={debts}
                                    onChange={(e) = /> setDebts(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., 250000"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Final Expenses
                                </label>
                                <input
                                    type="number"
                                    value={finalExpenses}
                                    onChange={(e) = /> setFinalExpenses(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="50000"
                                />
                            </div>
                        </div>
                        
                        <button
                            onClick={calculateCoverage}
                            className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Calculate Coverage Needed
                        </button>
                        
                        {result && (
                            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-2">Coverage Breakdown:</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Income Replacement:</span>
                                        <span className="font-semibold">${result.incomeReplacement.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Outstanding Debts:</span>
                                        <span className="font-semibold">${result.totalDebts.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Final Expenses:</span>
                                        <span className="font-semibold">${result.finalExpenses.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="font-bold">Total Coverage Needed:</span>
                                        <span className="font-bold text-primary">${result.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            };

            return (
                <div className="min-h-screen bg-background">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-primary-foreground py-12">
                        <div className="max-w-4xl mx-auto px-6 text-center">
                            <h1 className="text-4xl font-bold mb-4">Life Insurance in Retirement Guide</h1>
                            <p className="text-xl text-blue-100">Make informed decisions about life insurance coverage in your retirement years</p>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-6 py-8">
                        {/* Introduction */}
                        <div className="bg-card rounded-lg shadow-md p-8 mb-8">
                            <div className="flex items-center mb-6">
                                <i className="fas fa-shield-alt text-3xl text-primary mr-4"></i>
                                <h2 className="text-3xl font-bold text-gray-800">Do You Need Life Insurance in Retirement?</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                Life insurance needs change significantly as you enter retirement. While you may no longer need to replace decades of lost income, 
                                there are still important reasons to consider maintaining or obtaining coverage. This guide will help you determine if life insurance 
                                makes sense for your retirement strategy.
                            </p>
                            <div className="grid md:grid-cols-3 gap-6 mt-8">
                                <div className="text-center p-4 bg-primary/5 rounded-lg">
                                    <i className="fas fa-heart text-2xl text-primary mb-2"></i>
                                    <h3 className="font-semibold text-gray-800">Protecting Loved Ones</h3>
                                    <p className="text-sm text-muted-foreground">Ensure your spouse and dependents are financially secure</p>
                                </div>
                                <div className="text-center p-4 bg-trust-green/5 rounded-lg">
                                    <i className="fas fa-gift text-2xl text-trust-green mb-2"></i>
                                    <h3 className="font-semibold text-gray-800">Legacy Planning</h3>
                                    <p className="text-sm text-muted-foreground">Create or enhance the inheritance you leave behind</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <i className="fas fa-coins text-2xl text-purple-600 mb-2"></i>
                                    <h3 className="font-semibold text-gray-800">Final Expenses</h3>
                                    <p className="text-sm text-muted-foreground">Cover funeral costs and outstanding debts</p>
                                </div>
                            </div>
                        </div>

                        {/* Coverage Calculator */}
                        <CoverageCalculator />

                        {/* Decision Tree */}
                        <div className="bg-card rounded-lg shadow-md p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                <i className="fas fa-sitemap text-primary mr-2"></i>
                                Interactive Decision Tree
                            </h2>
                            <p className="text-muted-foreground mb-6">Answer these questions to get personalized recommendations for your situation.</p>
                            
                            {!showRecommendation ? (
                                <div className="space-y-6">
                                    {(() => {
                                        const currentQuestion = getCurrentQuestion();
                                        if (!currentQuestion) return null;
                                        
                                        return (
                                            <div key={currentQuestion.id} className="p-6 bg-primary/5 rounded-lg">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                    {currentQuestion.question}
                                                </h3>
                                                <div className="space-y-3">
                                                    {currentQuestion.options.map((option, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleAnswer(currentQuestion.id, option.value)}
                                                            className="w-full text-left p-4 bg-card rounded-md hover:bg-blue-100 transition-colors border border-border hover:border-blue-300"
                                                        >
                                                            <span className="font-medium text-gray-800">{option.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="p-6 bg-trust-green/5 rounded-lg">
                                    <h3 className="text-xl font-bold text-green-800 mb-4">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        Your Recommendation
                                    </h3>
                                    {(() => {
                                        const recommendation = getRecommendation();
                                        return (
                                            <div>
                                                <div className="mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-800">{recommendation.type}</h4>
                                                    <p className="text-muted-foreground mt-2">{recommendation.reason}</p>
                                                </div>
                                                <div className="bg-card p-4 rounded-md">
                                                    <h5 className="font-medium text-gray-800 mb-2">Next Steps:</h5>
                                                    <p className="text-muted-foreground">{recommendation.action}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setShowRecommendation(false);
                                                        setCurrentStep(0);
                                                        setUserAnswers({});
                                                    }}
                                                    className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                                                >
                                                    Start Over
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Strategy Comparison Table */}
                        <div className="bg-card rounded-lg shadow-md p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                <i className="fas fa-balance-scale text-primary mr-2"></i>
                                Strategy Comparison
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="border border-input px-4 py-3 text-left font-semibold text-gray-800">Strategy</th>
                                            <th className="border border-input px-4 py-3 text-left font-semibold text-gray-800">Description</th>
                                            <th className="border border-input px-4 py-3 text-left font-semibold text-gray-800">Pros</th>
                                            <th className="border border-input px-4 py-3 text-left font-semibold text-gray-800">Cons</th>
                                            <th className="border border-input px-4 py-3 text-left font-semibold text-gray-800">Best For</th>
                                            <th className="border border-input px-4 py-3 text-left font-semibold text-gray-800">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {strategyComparisons.map((strategy, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-card' : 'bg-background'}>
                                                <td className="border border-input px-4 py-3 font-medium text-gray-800">
                                                    {strategy.strategy}
                                                </td>
                                                <td className="border border-input px-4 py-3 text-muted-foreground">
                                                    {strategy.description}
                                                </td>
                                                <td className="border border-input px-4 py-3">
                                                    <ul className="text-sm text-trust-green space-y-1">
                                                        {strategy.pros.map((pro, i) => (
                                                            <li key={i} className="flex items-center">
                                                                <i className="fas fa-check text-xs mr-2"></i>
                                                                {pro}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="border border-input px-4 py-3">
                                                    <ul className="text-sm text-red-600 space-y-1">
                                                        {strategy.cons.map((con, i) => (
                                                            <li key={i} className="flex items-center">
                                                                <i className="fas fa-times text-xs mr-2"></i>
                                                                {con}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="border border-input px-4 py-3 text-sm text-muted-foreground">
                                                    {strategy.bestFor}
                                                </td>
                                                <td className="border border-input px-4 py-3 text-sm font-medium text-gray-800">
                                                    {strategy.cost}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Key Considerations */}
                        <div className="bg-card rounded-lg shadow-md p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                <i className="fas fa-lightbulb text-yellow-600 mr-2"></i>
                                Key Considerations for Retirement
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <i className="fas fa-clock text-primary mt-1 mr-3"></i>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Age and Health</h3>
                                            <p className="text-muted-foreground text-sm">Premiums increase with age and health issues. Consider purchasing while you're healthy.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <i className="fas fa-dollar-sign text-trust-green mt-1 mr-3"></i>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Premium Affordability</h3>
                                            <p className="text-muted-foreground text-sm">Ensure premiums fit comfortably within your retirement budget.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <i className="fas fa-users text-purple-600 mt-1 mr-3"></i>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Family Needs</h3>
                                            <p className="text-muted-foreground text-sm">Consider your spouse's income needs and dependent family members.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <i className="fas fa-chart-line text-red-600 mt-1 mr-3"></i>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Investment Alternatives</h3>
                                            <p className="text-muted-foreground text-sm">Compare life insurance returns with other investment options.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <i className="fas fa-gavel text-indigo-600 mt-1 mr-3"></i>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Estate Planning</h3>
                                            <p className="text-muted-foreground text-sm">Use life insurance strategically for estate liquidity and tax planning.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <i className="fas fa-hand-holding-usd text-teal-600 mt-1 mr-3"></i>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Long-Term Care</h3>
                                            <p className="text-muted-foreground text-sm">Some policies offer long-term care benefits as an additional feature.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-primary-foreground rounded-lg p-8 text-center">
                            <h2 className="text-2xl font-bold mb-4">Ready to Make a Decision?</h2>
                            <p className="text-blue-100 mb-6">
                                Life insurance in retirement requires careful consideration of your unique circumstances. 
                                Our experienced advisors can help you evaluate your options and make the right choice for your family.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="bg-card text-primary px-6 py-3 rounded-md font-semibold hover:bg-muted transition-colors">
                                    <i className="fas fa-phone mr-2"></i>
                                    Schedule Consultation
                                </button>
                                <button className="bg-primary/50 text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-blue-400 transition-colors">
                                    <i className="fas fa-download mr-2"></i>
                                    Get Free Quote
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        ReactDOM.render(<LifeInsuranceRetirementGuide />, document.getElementById('root'));
    </div>
  );
};

export default LifeInsuranceRetirementGuide;