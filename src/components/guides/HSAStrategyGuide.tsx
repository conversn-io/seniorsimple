import React, { useState } from 'react';

interface HSAStrategyGuideProps {
  className?: string;
}

export default function HSAStrategyGuide({ className }: HSAStrategyGuideProps = {}) {
  const [activeSection, setActiveSection] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${className || ''}`}>
      // HSA Calculator Function
        function calculateHSA() {
            const currentAge = parseInt(document.getElementById('currentAge').value);
            const retirementAge = parseInt(document.getElementById('retirementAge').value);
            const currentBalance = parseFloat(document.getElementById('currentBalance').value);
            const annualContribution = parseFloat(document.getElementById('annualContribution').value);
            const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) / 100;
            const hasCatchup = document.getElementById('catchupContribution').checked;
            
            const yearsToRetirement = retirementAge - currentAge;
            const catchupAmount = hasCatchup ? 1000 : 0;
            const totalAnnualContribution = annualContribution + catchupAmount;
            
            let balance = currentBalance;
            let totalContributions = currentBalance;
            const chartData = [];
            
            for (let year = 0; year <= yearsToRetirement; year++) {
                if (year > 0) {
                    balance = balance * (1 + expectedReturn) + totalAnnualContribution;
                    totalContributions += totalAnnualContribution;
                }
                chartData.push({
                    year: currentAge + year,
                    balance: balance,
                    contributions: totalContributions
                });
            }
            
            const finalBalance = balance;
            const investmentGrowth = finalBalance - totalContributions;
            const taxSavings = totalContributions * 0.22; // Assuming 22% tax rate
            
            // Update results
            document.getElementById('totalContributions').textContent = '$' + totalContributions.toLocaleString();
            document.getElementById('investmentGrowth').textContent = '$' + investmentGrowth.toLocaleString();
            document.getElementById('taxSavings').textContent = '$' + taxSavings.toLocaleString();
            document.getElementById('totalValue').textContent = '$' + finalBalance.toLocaleString();
            
            // Update chart
            updateHSAChart(chartData);
        }
        
        // Chart Functions
        let hsaChart;
        let comparisonChart;
        
        function updateHSAChart(data) {
            const ctx = document.getElementById('hsaGrowthChart').getContext('2d');
            
            if (hsaChart) {
                hsaChart.destroy();
            }
            
            hsaChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.year),
                    datasets: [{
                        label: 'HSA Balance',
                        data: data.map(d => d.balance),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Total Contributions',
                        data: data.map(d => d.contributions),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: false,
                        tension: 0.4
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
                                    return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
        
        function initComparisonChart() {
            const ctx = document.getElementById('comparisonChart').getContext('2d');
            
            // Generate comparison data
            const years = [];
            const hsaValues = [];
            const taxableValues = [];
            
            let hsaBalance = 0;
            let taxableBalance = 0;
            const annualContribution = 4150;
            const returnRate = 0.07;
            const taxRate = 0.22;
            
            for (let year = 0; year <= 20; year++) {
                years.push(year);
                
                if (year > 0) {
                    // HSA: Tax-deductible contributions, tax-free growth
                    hsaBalance = hsaBalance * (1 + returnRate) + annualContribution;
                    
                    // Taxable: After-tax contributions, taxed growth
                    const afterTaxContribution = annualContribution * (1 - taxRate);
                    taxableBalance = taxableBalance * (1 + returnRate * (1 - taxRate)) + afterTaxContribution;
                }
                
                hsaValues.push(hsaBalance);
                taxableValues.push(taxableBalance);
            }
            
            comparisonChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'HSA Account',
                        data: hsaValues,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Taxable Account',
                        data: taxableValues,
                        borderColor: 'rgb(107, 114, 128)',
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        fill: false,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Years'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Account Value'
                            },
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
                                    return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            calculateHSA();
            initComparisonChart();
            
            // Add event listeners for real-time calculation
            ['currentAge', 'retirementAge', 'currentBalance', 'annualContribution', 'expectedReturn', 'coverageType', 'catchupContribution'].forEach(id => {
                document.getElementById(id).addEventListener('input', calculateHSA);
            });
        });
        
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </div>
  );
}