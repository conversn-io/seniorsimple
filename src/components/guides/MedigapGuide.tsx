import React, { useState } from 'react';

const MedigapGuide: React.FC = () => {
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
      const MedigapGuide = () => {
            const [selectedPlan, setSelectedPlan] = React.useState('');
            const [showEnrollmentChart, setShowEnrollmentChart] = React.useState(false);
            const [selectedState, setSelectedState] = React.useState('National Average');

            const medigapPlans = [
                {
                    plan: 'Plan A',
                    deductible: 'You pay',
                    coinsurance: 'You pay',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'You pay',
                    deductibleB: 'You pay',
                    excessCharges: 'You pay',
                    foreignTravel: 'You pay',
                    avgPremium: '$150-300'
                },
                {
                    plan: 'Plan B',
                    deductible: 'You pay',
                    coinsurance: 'Covers',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'You pay',
                    deductibleB: 'You pay',
                    excessCharges: 'You pay',
                    foreignTravel: 'You pay',
                    avgPremium: '$180-350'
                },
                {
                    plan: 'Plan C',
                    deductible: 'Covers',
                    coinsurance: 'Covers',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'Covers',
                    deductibleB: 'Covers',
                    excessCharges: 'You pay',
                    foreignTravel: 'You pay',
                    avgPremium: '$200-400'
                },
                {
                    plan: 'Plan D',
                    deductible: 'Covers',
                    coinsurance: 'Covers',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'Covers',
                    deductibleB: 'You pay',
                    excessCharges: 'You pay',
                    foreignTravel: 'You pay',
                    avgPremium: '$180-380'
                },
                {
                    plan: 'Plan F',
                    deductible: 'Covers',
                    coinsurance: 'Covers',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'Covers',
                    deductibleB: 'Covers',
                    excessCharges: 'Covers',
                    foreignTravel: 'Covers',
                    avgPremium: '$250-500'
                },
                {
                    plan: 'Plan G',
                    deductible: 'Covers',
                    coinsurance: 'Covers',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'Covers',
                    deductibleB: 'You pay',
                    excessCharges: 'Covers',
                    foreignTravel: 'Covers',
                    avgPremium: '$200-450'
                },
                {
                    plan: 'Plan K',
                    deductible: 'Covers 50%',
                    coinsurance: 'Covers 50%',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'Covers 50%',
                    deductibleB: 'Covers 50%',
                    excessCharges: 'You pay',
                    foreignTravel: 'You pay',
                    avgPremium: '$100-200'
                },
                {
                    plan: 'Plan L',
                    deductible: 'Covers 75%',
                    coinsurance: 'Covers 75%',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'Covers 75%',
                    deductibleB: 'Covers 75%',
                    excessCharges: 'You pay',
                    foreignTravel: 'You pay',
                    avgPremium: '$120-250'
                },
                {
                    plan: 'Plan M',
                    deductible: 'Covers 50%',
                    coinsurance: 'Covers',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'You pay',
                    deductibleB: 'You pay',
                    excessCharges: 'You pay',
                    foreignTravel: 'You pay',
                    avgPremium: '$140-280'
                },
                {
                    plan: 'Plan N',
                    deductible: 'Covers',
                    coinsurance: 'Covers',
                    hospitalCoinsurance: 'Covers',
                    skilledNursing: 'Covers',
                    deductibleB: 'You pay',
                    excessCharges: 'You pay',
                    foreignTravel: 'You pay',
                    avgPremium: '$160-320'
                }
            ];

            const enrollmentPeriods = [
                {
                    period: 'Initial Enrollment',
                    timing: '6 months starting when you turn 65 and enroll in Medicare Part B',
                    benefits: 'Guaranteed issue - no medical underwriting',
                    penalty: 'None',
                    color: 'bg-green-100 border-green-500'
                },
                {
                    period: 'Annual Open Enrollment',
                    timing: 'January 1 - March 31 each year',
                    benefits: 'Limited - can only switch to different Medigap plan with equal or lesser benefits',
                    penalty: 'Possible medical underwriting',
                    color: 'bg-yellow-100 border-yellow-500'
                },
                {
                    period: 'Special Enrollment',
                    timing: 'After losing employer coverage or moving',
                    benefits: 'Guaranteed issue in specific circumstances',
                    penalty: 'None if within 63 days',
                    color: 'bg-blue-100 border-blue-500'
                },
                {
                    period: 'Late Enrollment',
                    timing: 'After initial enrollment period ends',
                    benefits: 'Subject to medical underwriting',
                    penalty: 'Possible premium increases',
                    color: 'bg-red-100 border-red-500'
                }
            ];

            React.useEffect(() => {
                if (showEnrollmentChart) {
                    const ctx = document.getElementById('enrollmentChart');
                    if (ctx) {
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: ['Age 64', 'Age 65', 'Age 66', 'Age 67', 'Age 68', 'Age 69', 'Age 70'],
                                datasets: [{
                                    label: 'Average Monthly Premium',
                                    data: [0, 200, 220, 240, 260, 280, 300],
                                    borderColor: 'rgb(59, 130, 246)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.1
                                }]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Monthly Premium ($)'
                                        }
                                    },
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Age at Enrollment'
                                        }
                                    }
                                },
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Medigap Premium Costs by Enrollment Age'
                                    },
                                    legend: {
                                        display: true
                                    }
                                }
                            }
                        });
                    }
                }
            }, [showEnrollmentChart]);

            const handlePlanSelection = (plan) => {
                setSelectedPlan(plan);
            };

            const getPlanRecommendation = (plan) => {
                const recommendations = {
                    'Plan F': 'Most comprehensive coverage - ideal for those who want maximum protection',
                    'Plan G': 'Popular choice - comprehensive coverage with lower premiums than Plan F',
                    'Plan N': 'Good balance of coverage and cost - suitable for budget-conscious seniors',
                    'Plan C': 'Comprehensive coverage - no longer available to new Medicare beneficiaries',
                    'Plan A': 'Basic coverage - lowest premium but limited benefits',
                    'Plan B': 'Slightly more coverage than Plan A - good entry-level option'
                };
                return recommendations[plan] || 'Contact an insurance agent for personalized recommendations';
            };

            return (
                <div className="min-h-screen bg-background">
                    {/* Header */}
                    <header className="bg-card shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Medicare Supplement Insurance Guide</h1>
                                    <p className="mt-2 text-lg text-muted-foreground">Complete guide to Medigap policies and enrollment</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                        <i className="fas fa-shield-alt mr-1"></i>
                                        Comparison Guide
                                    </span>
                                    <span className="text-sm text-gray-500">Updated for 2024</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Introduction Section */}
                        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-4">What is Medicare Supplement Insurance?</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-700 mb-4">
                                        Medicare Supplement Insurance (also called Medigap) is private insurance that helps pay for some of the healthcare costs that Original Medicare doesn't cover, such as copayments, coinsurance, and deductibles.
                                    </p>
                                    <div className="bg-primary/5 border-l-4 border-blue-400 p-4 rounded">
                                        <h3 className="font-semibold text-blue-900 mb-2">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            Key Benefits
                                        </h3>
                                        <ul className="text-blue-800 space-y-1">
                                            <li>â¢ Fills gaps in Original Medicare coverage</li>
                                            <li>â¢ Standardized plans with predictable benefits</li>
                                            <li>â¢ No network restrictions - use any Medicare provider</li>
                                            <li>â¢ Premium stability with guaranteed renewable coverage</li>
                                        </ul>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-3">Important Considerations</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-2"></i>
                                            <span className="text-sm text-gray-700">You must have Medicare Part A and Part B to purchase Medigap</span>
                                        </div>
                                        <div className="flex items-start">
                                            <i className="fas fa-clock text-primary mt-1 mr-2"></i>
                                            <span className="text-sm text-gray-700">Best time to enroll is during your 6-month open enrollment period</span>
                                        </div>
                                        <div className="flex items-start">
                                            <i className="fas fa-ban text-red-500 mt-1 mr-2"></i>
                                            <span className="text-sm text-gray-700">Cannot have both Medigap and Medicare Advantage</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Plan Comparison Table */}
                        <div className="bg-card rounded-lg shadow-sm mb-8">
                            <div className="p-6 border-b">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Medigap Plans Comparison</h2>
                                <p className="text-muted-foreground">Compare standardized Medigap plans and their benefits</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-background">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part A Deductible</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part A Coinsurance</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part B Deductible</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part B Excess Charges</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foreign Travel</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Monthly Premium</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-gray-200">
                                        {medigapPlans.map((plan, index) => (
                                            <tr key={index} className={`hover:bg-background ${selectedPlan === plan.plan ? 'bg-primary/5' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`font-medium ${plan.plan === 'Plan F' || plan.plan === 'Plan G' ? 'text-primary' : 'text-foreground'}`}>
                                                        {plan.plan}
                                                        {(plan.plan === 'Plan F' || plan.plan === 'Plan G') && (
                                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Popular
                                                            </span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${plan.deductible === 'Covers' ? 'bg-green-100 text-green-800' : plan.deductible.includes('%') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                        {plan.deductible}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${plan.coinsurance === 'Covers' ? 'bg-green-100 text-green-800' : plan.coinsurance.includes('%') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                        {plan.coinsurance}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${plan.deductibleB === 'Covers' ? 'bg-green-100 text-green-800' : plan.deductibleB.includes('%') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                        {plan.deductibleB}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${plan.excessCharges === 'Covers' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {plan.excessCharges}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${plan.foreignTravel === 'Covers' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {plan.foreignTravel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                    {plan.avgPremium}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handlePlanSelection(plan.plan)}
                                                        className="text-primary hover:text-blue-900 font-medium"
                                                    >
                                                        Select
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Selected Plan Details */}
                        {selectedPlan && (
                            <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
                                <h3 className="text-xl font-bold text-foreground mb-4">
                                    <i className="fas fa-star text-yellow-500 mr-2"></i>
                                    {selectedPlan} Recommendation
                                </h3>
                                <div className="bg-primary/5 border-l-4 border-blue-400 p-4 rounded">
                                    <p className="text-blue-800">{getPlanRecommendation(selectedPlan)}</p>
                                </div>
                                <div className="mt-4 flex space-x-4">
                                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                                        <i className="fas fa-phone mr-2"></i>
                                        Get Quotes
                                    </button>
                                    <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                                        <i className="fas fa-download mr-2"></i>
                                        Download Brochure
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Enrollment Periods */}
                        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-4">Enrollment Periods</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {enrollmentPeriods.map((period, index) => (
                                    <div key={index} className={`border-l-4 p-4 rounded-lg ${period.color}`}>
                                        <h3 className="font-semibold text-foreground mb-2">{period.period}</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Timing:</strong> {period.timing}</p>
                                            <p><strong>Benefits:</strong> {period.benefits}</p>
                                            <p><strong>Penalty:</strong> {period.penalty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Enrollment Timeline Chart */}
                        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-foreground">Premium Cost by Enrollment Age</h2>
                                <button
                                    onClick={() => setShowEnrollmentChart(!showEnrollmentChart)}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    <i className="fas fa-chart-line mr-2"></i>
                                    {showEnrollmentChart ? 'Hide Chart' : 'Show Chart'}
                                </button>
                            </div>
                            {showEnrollmentChart && (
                                <div className="mt-6">
                                    <canvas id="enrollmentChart" style={{height: '400px'}}></canvas>
                                    <p className="text-sm text-muted-foreground mt-4">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        Premiums may increase with age due to medical underwriting after the initial enrollment period.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Frequently Asked Questions */}
                        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="font-semibold text-foreground mb-2">What's the difference between Medigap and Medicare Advantage?</h3>
                                    <p className="text-gray-700">Medigap works with Original Medicare to cover gaps, while Medicare Advantage replaces Original Medicare entirely. You cannot have both.</p>
                                </div>
                                <div className="border-b pb-4">
                                    <h3 className="font-semibold text-foreground mb-2">When is the best time to buy Medigap?</h3>
                                    <p className="text-gray-700">During your 6-month open enrollment period that starts when you turn 65 and enroll in Medicare Part B. During this time, you have guaranteed issue rights.</p>
                                </div>
                                <div className="border-b pb-4">
                                    <h3 className="font-semibold text-foreground mb-2">Can I switch Medigap plans?</h3>
                                    <p className="text-gray-700">Yes, but outside of certain circumstances, you may be subject to medical underwriting and could be denied coverage or charged higher premiums.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Which Medigap plan is most popular?</h3>
                                    <p className="text-gray-700">Plan G is currently the most popular choice, offering comprehensive coverage at a lower premium than Plan F (which is no longer available to new Medicare beneficiaries).</p>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm p-6 text-primary-foreground">
                            <h2 className="text-2xl font-bold mb-4">Ready to Choose Your Medigap Plan?</h2>
                            <p className="mb-6">Our licensed insurance specialists can help you compare plans and find the best coverage for your needs and budget.</p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-card text-primary px-6 py-3 rounded-md font-semibold hover:bg-muted transition-colors">
                                    <i className="fas fa-phone mr-2"></i>
                                    Get Free Quote
                                </button>
                                <button className="border border-white text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-card hover:text-primary transition-colors">
                                    <i className="fas fa-calendar-alt mr-2"></i>
                                    Schedule Consultation
                                </button>
                                <button className="border border-white text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-card hover:text-primary transition-colors">
                                    <i className="fas fa-download mr-2"></i>
                                    Download Guide
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        ReactDOM.render(<MedigapGuide />, document.getElementById('root'));
    </div>
  );
};

export default MedigapGuide;