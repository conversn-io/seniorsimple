import React, { useState } from 'react';

interface HomeEquityCalculatorProps {
  // Add props as needed
}

const HomeEquityCalculator: React.FC<HomeEquityCalculatorProps> = () => {
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="container mx-auto p-6">

        let equityChart;
        let marketChart;

        function calculateEquity() {
            const homeValue = parseFloat(document.getElementById('homeValue').value) || 450000;
            const mortgageBalance = parseFloat(document.getElementById('mortgageBalance').value) || 250000;
            const appreciationRate = parseFloat(document.getElementById('appreciationRate').value) || 3.5;
            const projectionYears = parseInt(document.getElementById('projectionYears').value) || 10;
            const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value) || 1200;

            // Calculate current equity
            const currentEquity = homeValue - mortgageBalance;
            const equityPercentage = (currentEquity / homeValue * 100).toFixed(1);

            // Update display
            document.getElementById('currentEquity').textContent = `$${currentEquity.toLocaleString()}`;
            document.getElementById('equityPercentage').textContent = `${equityPercentage}% of home value`;
            document.getElementById('displayHomeValue').textContent = `$${homeValue.toLocaleString()}`;
            document.getElementById('displayMortgageBalance').textContent = `$${mortgageBalance.toLocaleString()}`;

            // Calculate projections
            const projections = [];
            let currentHomeValue = homeValue;
            let currentMortgageBalance = mortgageBalance;
            const annualAppreciationRate = appreciationRate / 100;
            const principalPayment = monthlyPayment * 12 * 0.6; // Rough estimate

            for (let year = 0; year <= projectionYears; year++) {
                if (year > 0) {
                    currentHomeValue *= (1 + annualAppreciationRate);
                    currentMortgageBalance = Math.max(0, currentMortgageBalance - principalPayment);
                }
                
                const equity = currentHomeValue - currentMortgageBalance;
                const equityPercent = (equity / currentHomeValue * 100);
                
                projections.push({
                    year: year,
                    homeValue: currentHomeValue,
                    mortgageBalance: currentMortgageBalance,
                    equity: equity,
                    equityPercent: equityPercent
                });
            }

            // Update future equity display
            const futureEquity = projections[projectionYears].equity;
            const equityGrowth = futureEquity - currentEquity;
            document.getElementById('futureEquity').textContent = `$${futureEquity.toLocaleString()}`;
            document.getElementById('equityGrowth').textContent = `+$${equityGrowth.toLocaleString()} growth`;

            // Update table
            updateProjectionTable(projections);
            
            // Update charts
            updateEquityChart(projections);
            updateMarketChart();
        }

        function updateProjectionTable(projections) {
            const tableBody = document.getElementById('projectionTable');
            tableBody.innerHTML = '';
            
            projections.forEach(proj => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td className="border border-input px-4 py-2">${proj.year}</td>
                    <td className="border border-input px-4 py-2">$${proj.homeValue.toLocaleString()}</td>
                    <td className="border border-input px-4 py-2">$${proj.mortgageBalance.toLocaleString()}</td>
                    <td className="border border-input px-4 py-2 font-semibold text-green-600">$${proj.equity.toLocaleString()}</td>
                    <td className="border border-input px-4 py-2">${proj.equityPercent.toFixed(1)}%</td>
                `;
            });
        }

        function updateEquityChart(projections) {
            const ctx = document.getElementById('equityChart').getContext('2d');
            
            if (equityChart) {
                equityChart.destroy();
            }
            
            equityChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: projections.map(p => `Year ${p.year}`),
                    datasets: [{
                        label: 'Home Value',
                        data: projections.map(p => p.homeValue),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: false
                    }, {
                        label: 'Mortgage Balance',
                        data: projections.map(p => p.mortgageBalance),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: false
                    }, {
                        label: 'Home Equity',
                        data: projections.map(p => p.equity),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true
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

        function updateMarketChart() {
            const ctx = document.getElementById('marketChart').getContext('2d');
            
            if (marketChart) {
                marketChart.destroy();
            }
            
            // Sample historical data
            const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
            const appreciation = [3.2, 2.8, 11.2, 8.1, 4.5, 3.8];
            
            marketChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'Home Price Appreciation (%)',
                        data: appreciation,
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 1
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
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize on page load
        window.onload = function() {
            calculateEquity();
        };
    
</div>
  );
};

export default HomeEquityCalculator;
