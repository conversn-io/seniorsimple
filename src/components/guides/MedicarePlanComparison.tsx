import React, { useState } from 'react';

interface MedicarePlanComparisonProps {
  className?: string;
}

export default function MedicarePlanComparison({ className }: MedicarePlanComparisonProps = {}) {
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
      // Initialize chart
        const ctx = document.getElementById('costChart').getContext('2d');
        const costChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Original Medicare', 'Medicare Advantage', 'Medicare Supplement'],
                datasets: [{
                    label: 'Average Annual Cost',
                    data: [2500, 1800, 3200],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(147, 51, 234, 0.8)'
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(147, 51, 234, 1)'
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
                        text: 'Estimated Annual Costs (Including Premiums and Out-of-Pocket)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value, index, values) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        // Filter functionality
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const planType = this.dataset.plan;
                filterPlans(planType);
            });
        });

        function filterPlans(planType) {
            const planCards = document.querySelectorAll('.plan-card');
            const tableRows = document.querySelectorAll('.feature-row');
            
            planCards.forEach(card => {
                if (planType === 'all' || card.dataset.planType === planType) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Update table headers and data based on filter
            if (planType !== 'all') {
                // Hide columns for non-selected plan types
                const headers = document.querySelectorAll('th');
                const cells = document.querySelectorAll('td');
                
                headers.forEach((header, index) => {
                    if (index === 0) return; // Keep the feature column
                    
                    const headerText = header.textContent.toLowerCase();
                    const shouldShow = planType === 'all' || 
                                     (planType === 'original' && headerText.includes('original')) ||
                                     (planType === 'advantage' && headerText.includes('advantage')) ||
                                     (planType === 'supplement' && headerText.includes('supplement'));
                    
                    header.style.display = shouldShow ? 'table-cell' : 'none';
                });
                
                // Update corresponding cells
                tableRows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    cells.forEach((cell, index) => {
                        if (index === 0) return; // Keep the feature column
                        
                        const shouldShow = planType === 'all' || 
                                         (planType === 'original' && index === 1) ||
                                         (planType === 'advantage' && index === 2) ||
                                         (planType === 'supplement' && index === 3);
                        
                        cell.style.display = shouldShow ? 'table-cell' : 'none';
                    });
                });
            } else {
                // Show all columns
                document.querySelectorAll('th, td').forEach(cell => {
                    cell.style.display = 'table-cell';
                });
            }
        }

        // Apply filters functionality
        document.getElementById('applyFilters').addEventListener('click', function() {
            const state = document.getElementById('stateFilter').value;
            const budget = document.getElementById('budgetFilter').value;
            const priority = document.getElementById('priorityFilter').value;
            
            // Simulate filtering logic
            if (state || budget || priority) {
                // Highlight recommended plans based on filters
                const planCards = document.querySelectorAll('.plan-card');
                planCards.forEach(card => {
                    card.classList.remove('highlight');
                });
                
                // Simple recommendation logic
                if (budget === 'low' || priority === 'cost') {
                    document.querySelector('[data-plan-type="advantage"]').classList.add('highlight');
                } else if (priority === 'coverage') {
                    document.querySelector('[data-plan-type="supplement"]').classList.add('highlight');
                } else if (priority === 'flexibility') {
                    document.querySelector('[data-plan-type="original"]').classList.add('highlight');
                }
            }
        });

        // Add interactive tooltips
        document.querySelectorAll('.fas').forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
            });
            
            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    </div>
  );
}