import React, { useState } from 'react';

interface DownsizingCalculatorProps {
  // Add props as needed
}

const DownsizingCalculator: React.FC<DownsizingCalculatorProps> = () => {
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="container mx-auto p-6">

        let savingsChart, costChart;

        function calculateDownsizing() {
            // Get input values
            const currentHomeValue = parseFloat(document.getElementById('currentHomeValue').value) || 0;
            const outstandingMortgage = parseFloat(document.getElementById('outstandingMortgage').value) || 0;
            const currentMonthlyCosts = parseFloat(document.getElementById('currentMonthlyCosts').value) || 0;
            const newHomeValue = parseFloat(document.getElementById('newHomeValue').value) || 0;
            const downPaymentPercent = parseFloat(document.getElementById('downPaymentPercent').value) || 0;
            const newMonthlyCosts = parseFloat(document.getElementById('newMonthlyCosts').value) || 0;
            const realtorCommission = parseFloat(document.getElementById('realtorCommission').value) || 0;
            const closingCosts = parseFloat(document.getElementById('closingCosts').value) || 0;
            const movingExpenses = parseFloat(document.getElementById('movingExpenses').value) || 0;

            // Calculate costs
            const commissionCost = currentHomeValue * (realtorCommission / 100);
            const totalSellingCosts = commissionCost + closingCosts + movingExpenses;
            const netFromSale = currentHomeValue - outstandingMortgage - totalSellingCosts;
            const downPayment = newHomeValue * (downPaymentPercent / 100);
            const cashFromSale = netFromSale - downPayment;
            const monthlySavings = currentMonthlyCosts - newMonthlyCosts;
            const tenYearSavings = (monthlySavings * 12 * 10) + cashFromSale;

            // Update summary cards
            document.getElementById('cashFromSale').textContent = formatCurrency(cashFromSale);
            document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
            document.getElementById('tenYearSavings').textContent = formatCurrency(tenYearSavings);

            // Update cost displays
            document.getElementById('currentCostDisplay').textContent = formatCurrency(currentMonthlyCosts);
            document.getElementById('newCostDisplay').textContent = formatCurrency(newMonthlyCosts);
            document.getElementById('monthlySavingsDisplay').textContent = formatCurrency(monthlySavings);

            // Update cost breakdown table
            updateCostBreakdownTable({
                currentHomeValue,
                outstandingMortgage,
                commissionCost,
                closingCosts,
                movingExpenses,
                totalSellingCosts,
                netFromSale,
                downPayment,
                cashFromSale
            });

            // Create charts
            createSavingsChart(monthlySavings, cashFromSale);
            createCostChart(currentMonthlyCosts, newMonthlyCosts);

            // Show results
            document.getElementById('resultsSection').classList.remove('hidden');
        }

        function updateCostBreakdownTable(costs) {
            const tbody = document.getElementById('costBreakdownTable');
            tbody.innerHTML = `
                <tr>
                    <td className="border border-input px-4 py-2 font-medium">Current Home Value</td>
                    <td className="border border-input px-4 py-2 text-right">${formatCurrency(costs.currentHomeValue)}</td>
                </tr>
                <tr>
                    <td className="border border-input px-4 py-2">Less: Outstanding Mortgage</td>
                    <td className="border border-input px-4 py-2 text-right text-red-600">-${formatCurrency(costs.outstandingMortgage)}</td>
                </tr>
                <tr>
                    <td className="border border-input px-4 py-2">Less: Real Estate Commission</td>
                    <td className="border border-input px-4 py-2 text-right text-red-600">-${formatCurrency(costs.commissionCost)}</td>
                </tr>
                <tr>
                    <td className="border border-input px-4 py-2">Less: Closing Costs</td>
                    <td className="border border-input px-4 py-2 text-right text-red-600">-${formatCurrency(costs.closingCosts)}</td>
                </tr>
                <tr>
                    <td className="border border-input px-4 py-2">Less: Moving Expenses</td>
                    <td className="border border-input px-4 py-2 text-right text-red-600">-${formatCurrency(costs.movingExpenses)}</td>
                </tr>
                <tr className="bg-background">
                    <td className="border border-input px-4 py-2 font-medium">Net from Sale</td>
                    <td className="border border-input px-4 py-2 text-right font-medium">${formatCurrency(costs.netFromSale)}</td>
                </tr>
                <tr>
                    <td className="border border-input px-4 py-2">Less: Down Payment on New Home</td>
                    <td className="border border-input px-4 py-2 text-right text-red-600">-${formatCurrency(costs.downPayment)}</td>
                </tr>
                <tr className="bg-green-50">
                    <td className="border border-input px-4 py-2 font-bold">Cash Available</td>
                    <td className="border border-input px-4 py-2 text-right font-bold text-green-600">${formatCurrency(costs.cashFromSale)}</td>
                </tr>
            `;
        }

        function createSavingsChart(monthlySavings, initialCash) {
            const ctx = document.getElementById('savingsChart').getContext('2d');
            
            if (savingsChart) {
                savingsChart.destroy();
            }

            const years = Array.from({length: 21}, (_, i) => i);
            const cumulativeSavings = years.map(year => initialCash + (monthlySavings * 12 * year));

            savingsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'Cumulative Savings',
                        data: cumulativeSavings,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Years'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Financial Benefit Over Time'
                        }
                    }
                }
            });
        }

        function createCostChart(currentCosts, newCosts) {
            const ctx = document.getElementById('costChart').getContext('2d');
            
            if (costChart) {
                costChart.destroy();
            }

            costChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Current Home Costs', 'New Home Costs', 'Monthly Savings'],
                    datasets: [{
                        data: [currentCosts, newCosts, Math.max(0, currentCosts - newCosts)],
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(34, 197, 94, 0.8)'
                        ],
                        borderColor: [
                            'rgb(239, 68, 68)',
                            'rgb(59, 130, 246)',
                            'rgb(34, 197, 94)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Monthly Cost Breakdown'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        }

        // Initialize with default calculation
        window.onload = function() {
            calculateDownsizing();
        };
    
</div>
  );
};

export default DownsizingCalculator;
