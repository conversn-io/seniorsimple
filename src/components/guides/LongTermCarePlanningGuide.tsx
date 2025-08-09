import React, { useState } from 'react';

interface LongTermCarePlanningGuideProps {
  className?: string;
}

export default function LongTermCarePlanningGuide({ className }: LongTermCarePlanningGuideProps = {}) {
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
      let costChart = null;
        
        function calculateCosts() {
            const currentAge = parseInt(document.getElementById('currentAge').value);
            const careStartAge = parseInt(document.getElementById('careStartAge').value);
            const annualCost = parseInt(document.getElementById('careType').value);
            const duration = parseFloat(document.getElementById('careDuration').value);
            const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
            const stateMultiplier = parseFloat(document.getElementById('state').value);
            
            const yearsUntilCare = careStartAge - currentAge;
            const adjustedAnnualCost = annualCost * stateMultiplier * Math.pow(1 + inflationRate, yearsUntilCare);
            const totalCost = adjustedAnnualCost * duration;
            
            // Display results
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = `
                <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Cost Projection Summary</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Annual Cost (Today)</div>
                                <div className="text-lg font-bold">$${annualCost.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Annual Cost (Future)</div>
                                <div className="text-lg font-bold">$${Math.round(adjustedAnnualCost).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-trust-green/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Total Projected Cost</h4>
                        <div className="text-3xl font-bold text-green-800">$${Math.round(totalCost).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Over ${duration} years of care</div>
                    </div>
                    
                    <div className="bg-warning/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">Monthly Savings Needed</h4>
                        <div className="text-xl font-bold text-yellow-800">$${Math.round(totalCost / (yearsUntilCare * 12)).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Starting now through age ${careStartAge}</div>
                    </div>
                </div>
            `;
            
            // Create chart
            createCostChart(currentAge, careStartAge, annualCost, adjustedAnnualCost, duration);
        }
        
        function createCostChart(currentAge, careStartAge, currentCost, futureCost, duration) {
            const ctx = document.getElementById('costChart').getContext('2d');
            
            if (costChart) {
                costChart.destroy();
            }
            
            const years = [];
            const costs = [];
            
            for (let i = 0; i <= duration; i += 0.5) {
                years.push(careStartAge + i);
                costs.push(futureCost);
            }
            
            costChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'Annual Care Cost',
                        data: costs,
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
                                text: 'Age'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Projected Annual Care Costs'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Annual Cost: $' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
        
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