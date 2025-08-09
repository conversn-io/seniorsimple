import React, { useState } from 'react';

interface SeniorHousingOptionsProps {
  // Add props as needed
}

const SeniorHousingOptions: React.FC<SeniorHousingOptionsProps> = () => {
  const [formData, setFormData] = useState({});

  return (
    <div className="container mx-auto p-6">

        // Cost Chart
        const costCtx = document.getElementById('costChart').getContext('2d');
        new Chart(costCtx, {
            type: 'bar',
            data: {
                labels: ['Age in Place', 'Downsize', 'Active Adult', 'Assisted Living', 'Memory Care', 'Skilled Nursing'],
                datasets: [{
                    label: 'Average Monthly Cost ($)',
                    data: [1200, 1800, 2500, 4500, 6000, 8000],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(147, 51, 234, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(107, 114, 128, 1)'
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
                        text: 'National Average Monthly Costs'
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

        // Regional Cost Chart
        const regionalCtx = document.getElementById('regionalChart').getContext('2d');
        new Chart(regionalCtx, {
            type: 'line',
            data: {
                labels: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast'],
                datasets: [{
                    label: 'Assisted Living',
                    data: [5200, 3800, 4000, 4200, 5800],
                    borderColor: 'rgba(147, 51, 234, 1)',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Active Adult Community',
                    data: [2800, 2200, 2300, 2400, 3200],
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Regional Cost Variations by Housing Type'
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

        // Interactive recommendation function
        function showRecommendation(type) {
            let recommendation = '';
            let bgColor = '';
            
            switch(type) {
                case 'independent':
                    recommendation = 'Based on your independence level, consider: <strong>Age in Place</strong> or <strong>Downsizing</strong>. Both options maintain your autonomy while potentially reducing costs.';
                    bgColor = 'bg-green-100 border-green-500 text-green-800';
                    break;
                case 'some-help':
                    recommendation = 'For those needing some assistance, <strong>Active Adult Communities</strong> or <strong>Assisted Living</strong> might be ideal. They offer support while maintaining independence.';
                    bgColor = 'bg-yellow-100 border-yellow-500 text-yellow-800';
                    break;
                case 'full-care':
                    recommendation = 'If you need comprehensive care, <strong>Assisted Living</strong> or <strong>Memory Care</strong> facilities provide 24/7 support with professional healthcare staff.';
                    bgColor = 'bg-purple-100 border-purple-500 text-purple-800';
                    break;
            }
            
            // Create recommendation popup
            const popup = document.createElement('div');
            popup.className = `fixed top-4 right-4 max-w-md p-4 border-l-4 rounded-lg shadow-lg ${bgColor} z-50`;
            popup.innerHTML = `
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold mb-2">Your Recommendation</h3>
                        <p className="text-sm">${recommendation}</p>
                    </div>
                    <button onClick="this.parentElement.parentElement.remove()" className="ml-4 text-gray-500 hover:text-gray-700">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            // Auto-remove after 8 seconds
            setTimeout(() => {
                if (popup.parentElement) {
                    popup.remove();
                }
            }, 8000);
        }

        // Add hover effects for interactive elements
        document.querySelectorAll('.interactive-element').forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    
</div>
  );
};

export default SeniorHousingOptions;
