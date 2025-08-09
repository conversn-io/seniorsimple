import React, { useState, useCallback } from 'react';

interface HealthcareCostCalculatorProps {
  className?: string;
}

export default function HealthcareCostCalculator({ className }: HealthcareCostCalculatorProps = {}) {
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
      let costBreakdownChart, costTrendChart;

        function calculateCosts() {
            const currentAge = parseInt(document.getElementById('currentAge').value);
            const retirementAge = parseInt(document.getElementById('retirementAge').value);
            const lifeExpectancy = parseInt(document.getElementById('lifeExpectancy').value);
            const annualIncome = parseInt(document.getElementById('annualIncome').value);
            const healthStatus = document.getElementById('healthStatus').value;
            const state = document.getElementById('state').value;

            // Base healthcare costs (2024 estimates)
            const baseCosts = {
                medicarePremiums: 2000,
                supplementalInsurance: 1800,
                outOfPocket: 3500,
                prescriptionDrugs: 2400,
                dentalVision: 1200,
                longTermCare: 4500
            };

            // Adjust for health status
            const healthMultiplier = {
                excellent: 0.8,
                good: 1.0,
                fair: 1.3,
                poor: 1.6
            };

            // Adjust for state
            const stateMultiplier = {
                national: 1.0,
                high: 1.3,
                medium: 1.0,
                low: 0.8
            };

            // Calculate adjusted costs
            const adjustedCosts = {};
            const multiplier = healthMultiplier[healthStatus] * stateMultiplier[state];
            
            for (const [category, cost] of Object.entries(baseCosts)) {
                adjustedCosts[category] = Math.round(cost * multiplier);
            }

            const yearsInRetirement = lifeExpectancy - retirementAge;
            const annualTotal = Object.values(adjustedCosts).reduce((sum, cost) => sum + cost, 0);
            const lifetimeTotal = annualTotal * yearsInRetirement;

            // Display results
            displayResults(adjustedCosts, annualTotal, lifetimeTotal, yearsInRetirement);
            
            // Create charts
            createCostBreakdownChart(adjustedCosts);
            createCostTrendChart(adjustedCosts, retirementAge, lifeExpectancy);
            
            // Update table
            updateCostTable(adjustedCosts, yearsInRetirement, annualTotal);
        }

        function displayResults(costs, annualTotal, lifetimeTotal, years) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = `
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-primary-foreground p-6 rounded-lg">
                    <h3 className="text-2xl font-bold mb-4">Your Healthcare Cost Estimates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm opacity-90">Annual Healthcare Costs</div>
                            <div className="text-3xl font-bold">$${annualTotal.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm opacity-90">Lifetime Healthcare Costs</div>
                            <div className="text-3xl font-bold">$${lifetimeTotal.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-warning/5 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Important Note
                    </h4>
                    <p className="text-yellow-700">These estimates are based on current costs and assumptions. Actual costs may vary based on individual circumstances, healthcare inflation, and policy changes.</p>
                </div>
            `;
        }

        function createCostBreakdownChart(costs) {
            const ctx = document.getElementById('costBreakdownChart').getContext('2d');
            
            if (costBreakdownChart) {
                costBreakdownChart.destroy();
            }

            costBreakdownChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [
                        'Medicare Premiums',
                        'Supplemental Insurance',
                        'Out-of-Pocket',
                        'Prescription Drugs',
                        'Dental & Vision',
                        'Long-Term Care'
                    ],
                    datasets: [{
                        data: Object.values(costs),
                        backgroundColor: [
                            '#3B82F6',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444',
                            '#8B5CF6',
                            '#06B6D4'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': $' + context.parsed.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }

        function createCostTrendChart(costs, retirementAge, lifeExpectancy) {
            const ctx = document.getElementById('costTrendChart').getContext('2d');
            
            if (costTrendChart) {
                costTrendChart.destroy();
            }

            const years = [];
            const annualCosts = [];
            const inflationRate = 0.06; // 6% healthcare inflation
            
            for (let age = retirementAge; age <= lifeExpectancy; age++) {
                years.push(age);
                const yearsSinceRetirement = age - retirementAge;
                const inflatedCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0) * Math.pow(1 + inflationRate, yearsSinceRetirement);
                annualCosts.push(Math.round(inflatedCost));
            }

            costTrendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'Annual Healthcare Costs',
                        data: annualCosts,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
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
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Age'
                            }
                        }
                    }
                }
            });
        }

        function updateCostTable(costs, years, annualTotal) {
            const tbody = document.getElementById('costTableBody');
            const categories = {
                medicarePremiums: 'Medicare Premiums',
                supplementalInsurance: 'Supplemental Insurance',
                outOfPocket: 'Out-of-Pocket Expenses',
                prescriptionDrugs: 'Prescription Drugs',
                dentalVision: 'Dental & Vision',
                longTermCare: 'Long-Term Care'
            };

            tbody.innerHTML = '';
            
            for (const [key, value] of Object.entries(costs)) {
                const lifetimeCost = value * years;
                const percentage = ((value / annualTotal) * 100).toFixed(1);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td className="border border-input px-4 py-2 font-medium">${categories[key]}</td>
                    <td className="border border-input px-4 py-2 text-right">$${value.toLocaleString()}</td>
                    <td className="border border-input px-4 py-2 text-right">$${lifetimeCost.toLocaleString()}</td>
                    <td className="border border-input px-4 py-2 text-right">${percentage}%</td>
                `;
                tbody.appendChild(row);
            }
            
            // Add total row
            const totalRow = document.createElement('tr');
            totalRow.className = 'bg-muted font-bold';
            totalRow.innerHTML = `
                <td className="border border-input px-4 py-2">Total</td>
                <td className="border border-input px-4 py-2 text-right">$${annualTotal.toLocaleString()}</td>
                <td className="border border-input px-4 py-2 text-right">$${(annualTotal * years).toLocaleString()}</td>
                <td className="border border-input px-4 py-2 text-right">100.0%</td>
            `;
            tbody.appendChild(totalRow);
        }

        // Initialize calculator with default values
        window.addEventListener('load', function() {
            calculateCosts();
        });
    </div>
  );
}