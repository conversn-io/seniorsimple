import React, { useState } from 'react';

interface ReverseMortgageCalculatorProps {
  // Add props as needed
}

const ReverseMortgageCalculator: React.FC<ReverseMortgageCalculatorProps> = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="container mx-auto p-6">

        let loanGrowthChart;

        function calculateReverseMortgage() {
            const homeValue = parseFloat(document.getElementById('homeValue').value) || 0;
            const borrowerAge = parseInt(document.getElementById('borrowerAge').value) || 62;
            const spouseAge = parseInt(document.getElementById('spouseAge').value) || 0;
            const mortgageBalance = parseFloat(document.getElementById('mortgageBalance').value) || 0;
            const state = document.getElementById('state').value;

            // Use youngest age for calculation if spouse exists
            const effectiveAge = spouseAge > 0 ? Math.min(borrowerAge, spouseAge) : borrowerAge;

            // Calculate principal limit factor based on age
            const principalLimitFactor = calculatePrincipalLimitFactor(effectiveAge);
            
            // Calculate gross principal limit
            const grossPrincipalLimit = homeValue * principalLimitFactor;
            
            // Calculate net principal limit (after paying off existing mortgage)
            const netPrincipalLimit = Math.max(0, grossPrincipalLimit - mortgageBalance);

            // Calculate available funds (after closing costs)
            const closingCosts = Math.min(homeValue * 0.02, 6000); // Estimate 2% or $6,000 max
            const availableFunds = Math.max(0, netPrincipalLimit - closingCosts);

            displayResults(homeValue, effectiveAge, grossPrincipalLimit, netPrincipalLimit, availableFunds, mortgageBalance, closingCosts);
            showPaymentOptions(availableFunds);
            showLoanGrowthChart(availableFunds);
        }

        function calculatePrincipalLimitFactor(age) {
            // Simplified principal limit factor calculation
            // In reality, this varies by interest rates and is more complex
            const baseFactor = 0.3; // 30% at age 62
            const ageBonus = (age - 62) * 0.01; // 1% per year
            return Math.min(baseFactor + ageBonus, 0.65); // Cap at 65%
        }

        function displayResults(homeValue, age, grossLimit, netLimit, availableFunds, mortgageBalance, closingCosts) {
            const resultsPanel = document.getElementById('resultsPanel');
            
            resultsPanel.innerHTML = `
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                            <i className="fas fa-money-bill-wave mr-2"></i>
                            Estimated Available Funds
                        </h3>
                        <p className="text-3xl font-bold text-green-600">$${availableFunds.toLocaleString()}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-800 mb-1">Home Value</h4>
                            <p className="text-xl text-primary">$${homeValue.toLocaleString()}</p>
                        </div>
                        
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="font-semibold text-purple-800 mb-1">Effective Age</h4>
                            <p className="text-xl text-purple-600">${age} years</p>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-800 mb-1">Gross Principal Limit</h4>
                            <p className="text-xl text-yellow-600">$${grossLimit.toLocaleString()}</p>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-800 mb-1">Less: Existing Mortgage</h4>
                            <p className="text-xl text-red-600">$${mortgageBalance.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div className="bg-background border border-border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Calculation Breakdown</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Gross Principal Limit:</span>
                                <span>$${grossLimit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Less: Existing Mortgage:</span>
                                <span>-$${mortgageBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Less: Estimated Closing Costs:</span>
                                <span>-$${closingCosts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 font-semibold text-gray-800">
                                <span>Available to You:</span>
                                <span>$${availableFunds.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function showPaymentOptions(availableFunds) {
            const section = document.getElementById('paymentOptionsSection');
            const table = document.getElementById('paymentOptionsTable');
            
            const monthlyPayment = (availableFunds * 0.05) / 12; // Rough estimate
            const lineOfCredit = availableFunds * 0.9; // 90% as line of credit
            
            table.innerHTML = `
                <tr>
                    <td className="border border-border px-4 py-3 font-semibold text-primary">Lump Sum</td>
                    <td className="border border-border px-4 py-3">Receive all funds at closing</td>
                    <td className="border border-border px-4 py-3 font-semibold">$${availableFunds.toLocaleString()}</td>
                    <td className="border border-border px-4 py-3">Large immediate expenses, debt payoff</td>
                </tr>
                <tr className="bg-background">
                    <td className="border border-border px-4 py-3 font-semibold text-green-600">Monthly Payments</td>
                    <td className="border border-border px-4 py-3">Fixed monthly income for life</td>
                    <td className="border border-border px-4 py-3 font-semibold">$${monthlyPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}/month</td>
                    <td className="border border-border px-4 py-3">Supplementing retirement income</td>
                </tr>
                <tr>
                    <td className="border border-border px-4 py-3 font-semibold text-purple-600">Line of Credit</td>
                    <td className="border border-border px-4 py-3">Access funds as needed, unused portion grows</td>
                    <td className="border border-border px-4 py-3 font-semibold">Up to $${lineOfCredit.toLocaleString()}</td>
                    <td className="border border-border px-4 py-3">Financial flexibility, future needs</td>
                </tr>
                <tr className="bg-background">
                    <td className="border border-border px-4 py-3 font-semibold text-orange-600">Combination</td>
                    <td className="border border-border px-4 py-3">Mix of lump sum, monthly payments, and credit line</td>
                    <td className="border border-border px-4 py-3 font-semibold">Customizable</td>
                    <td className="border border-border px-4 py-3">Balanced approach for multiple needs</td>
                </tr>
            `;
            
            section.style.display = 'block';
        }

        function showLoanGrowthChart(initialAmount) {
            const section = document.getElementById('chartSection');
            const ctx = document.getElementById('loanGrowthChart').getContext('2d');
            
            // Calculate loan growth over 20 years at 5% interest
            const years = Array.from({length: 21}, (_, i) => i);
            const loanBalance = years.map(year => initialAmount * Math.pow(1.05, year));
            
            // Destroy existing chart if it exists
            if (loanGrowthChart) {
                loanGrowthChart.destroy();
            }
            
            loanGrowthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years.map(year => `Year ${year}`),
                    datasets: [{
                        label: 'Loan Balance',
                        data: loanBalance,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
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
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Loan Balance: $' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
            
            section.style.display = 'block';
        }

        // Initialize with default calculation
        document.addEventListener('DOMContentLoaded', function() {
            calculateReverseMortgage();
        });
    
</div>
  );
};

export default ReverseMortgageCalculator;
