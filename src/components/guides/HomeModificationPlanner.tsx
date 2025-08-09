import React, { useState } from 'react';

interface HomeModificationPlannerProps {
  // Add props as needed
}

const HomeModificationPlanner: React.FC<HomeModificationPlannerProps> = () => {
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="container mx-auto p-6">

        // Global variables
        let selectedModifications = [];
        let modificationData = [
            {
                id: 1,
                category: 'Bathroom',
                title: 'Install Grab Bars',
                description: 'Add grab bars in shower and near toilet for safety',
                cost: { min: 150, max: 500 },
                priority: 'high',
                timeline: 1,
                diy: true
            },
            {
                id: 2,
                category: 'Bathroom',
                title: 'Non-Slip Flooring',
                description: 'Install non-slip flooring in bathroom',
                cost: { min: 300, max: 800 },
                priority: 'high',
                timeline: 2,
                diy: false
            },
            {
                id: 3,
                category: 'Entry',
                title: 'Install Handrails',
                description: 'Add handrails to exterior and interior stairs',
                cost: { min: 200, max: 600 },
                priority: 'high',
                timeline: 1,
                diy: true
            },
            {
                id: 4,
                category: 'Entry',
                title: 'Ramp Installation',
                description: 'Build ramp for wheelchair/walker access',
                cost: { min: 1000, max: 3000 },
                priority: 'medium',
                timeline: 3,
                diy: false
            },
            {
                id: 5,
                category: 'Kitchen',
                title: 'Pull-Out Shelves',
                description: 'Install pull-out shelves in cabinets',
                cost: { min: 400, max: 1200 },
                priority: 'medium',
                timeline: 2,
                diy: true
            },
            {
                id: 6,
                category: 'Lighting',
                title: 'Motion Sensor Lights',
                description: 'Install motion-activated lighting',
                cost: { min: 100, max: 300 },
                priority: 'medium',
                timeline: 1,
                diy: true
            },
            {
                id: 7,
                category: 'Doorways',
                title: 'Widen Doorways',
                description: 'Widen doorways for wheelchair access',
                cost: { min: 800, max: 2500 },
                priority: 'low',
                timeline: 4,
                diy: false
            },
            {
                id: 8,
                category: 'Bathroom',
                title: 'Walk-in Shower',
                description: 'Convert tub to walk-in shower',
                cost: { min: 3000, max: 8000 },
                priority: 'low',
                timeline: 5,
                diy: false
            }
        ];

        // Tab functionality
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                
                // Update tab buttons
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('text-primary', 'border-blue-600', 'bg-blue-50');
                    btn.classList.add('text-gray-500');
                });
                button.classList.add('text-primary', 'border-blue-600', 'bg-blue-50');
                button.classList.remove('text-gray-500');
                
                // Update tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.add('hidden');
                });
                document.getElementById(tab).classList.remove('hidden');
                
                // Initialize specific tab content
                if (tab === 'modifications') {
                    renderModifications();
                } else if (tab === 'budget') {
                    updateBudgetCalculator();
                } else if (tab === 'timeline') {
                    renderTimeline();
                }
            });
        });

        // Assessment functionality
        document.querySelectorAll('.assessment-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateAssessment);
        });

        function updateAssessment() {
            const checkedBoxes = document.querySelectorAll('.assessment-checkbox:checked');
            const totalIssues = checkedBoxes.length;
            const summary = document.getElementById('assessment-summary');
            
            if (totalIssues === 0) {
                summary.textContent = 'Complete the assessment above to see your results and recommendations.';
                summary.className = 'text-blue-800';
            } else if (totalIssues <= 3) {
                summary.textContent = `You have ${totalIssues} safety concerns. Consider addressing these issues to improve home safety.`;
                summary.className = 'text-green-800';
            } else if (totalIssues <= 6) {
                summary.textContent = `You have ${totalIssues} safety concerns. We recommend prioritizing modifications to address these issues.`;
                summary.className = 'text-yellow-800';
            } else {
                summary.textContent = `You have ${totalIssues} safety concerns. Consider a comprehensive home modification plan for safety.`;
                summary.className = 'text-red-800';
            }
            
            // Update recommended modifications based on assessment
            updateRecommendedModifications();
        }

        function updateRecommendedModifications() {
            const checkedBoxes = document.querySelectorAll('.assessment-checkbox:checked');
            const issues = Array.from(checkedBoxes).map(box => ({
                area: box.dataset.area,
                issue: box.dataset.issue
            }));
            
            // Filter modifications based on identified issues
            selectedModifications = modificationData.filter(mod => {
                return issues.some(issue => {
                    if (issue.area === 'bathroom' && mod.category === 'Bathroom') return true;
                    if (issue.area === 'entry' && mod.category === 'Entry') return true;
                    if (issue.area === 'kitchen' && mod.category === 'Kitchen') return true;
                    if (issue.issue === 'lighting' && mod.category === 'Lighting') return true;
                    if (issue.issue === 'narrow-doorways' && mod.category === 'Doorways') return true;
                    return false;
                });
            });
            
            // Always include high priority items
            const highPriorityItems = modificationData.filter(mod => mod.priority === 'high');
            selectedModifications = [...new Set([...selectedModifications, ...highPriorityItems])];
        }

        // Modifications functionality
        function renderModifications() {
            if (selectedModifications.length === 0) {
                updateRecommendedModifications();
            }
            
            const container = document.getElementById('modifications-list');
            container.innerHTML = '';
            
            selectedModifications.forEach(mod => {
                const modElement = document.createElement('div');
                modElement.className = `modification-item bg-card border rounded-lg p-4 priority-${mod.priority}`;
                modElement.dataset.priority = mod.priority;
                
                modElement.innerHTML = `
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-800">${mod.title}</h4>
                                <span className="px-2 py-1 text-xs rounded-full ${getPriorityClass(mod.priority)}">${mod.priority}</span>
                                ${mod.diy ? '<span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">DIY Friendly</span>' : ''}
                            </div>
                            <p className="text-muted-foreground mb-2">${mod.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span><i className="fas fa-dollar-sign mr-1"></i>$${mod.cost.min.toLocaleString()} - $${mod.cost.max.toLocaleString()}</span>
                                <span><i className="fas fa-clock mr-1"></i>${mod.timeline} week${mod.timeline > 1 ? 's' : ''}</span>
                                <span><i className="fas fa-tag mr-1"></i>${mod.category}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" className="modification-checkbox" data-id="${mod.id}" ${selectedModifications.some(m => m.id === mod.id) ? 'checked' : ''}>
                            <label className="text-sm text-muted-foreground">Include</label>
                        </div>
                    </div>
                `;
                
                container.appendChild(modElement);
            });
            
            // Add event listeners for checkboxes
            document.querySelectorAll('.modification-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', updateSelectedModifications);
            });
        }

        function getPriorityClass(priority) {
            const classes = {
                'high': 'bg-red-100 text-red-800',
                'medium': 'bg-yellow-100 text-yellow-800',
                'low': 'bg-green-100 text-green-800'
            };
            return classes[priority] || 'bg-muted text-gray-800';
        }

        function updateSelectedModifications() {
            const checkedBoxes = document.querySelectorAll('.modification-checkbox:checked');
            const selectedIds = Array.from(checkedBoxes).map(box => parseInt(box.dataset.id));
            selectedModifications = modificationData.filter(mod => selectedIds.includes(mod.id));
        }

        // Filter functionality
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                
                // Update button styles
                document.querySelectorAll('.filter-button').forEach(btn => {
                    btn.classList.remove('bg-primary', 'text-primary-foreground');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                button.classList.add('bg-primary', 'text-primary-foreground');
                button.classList.remove('bg-gray-200', 'text-gray-700');
                
                // Filter modifications
                const modifications = document.querySelectorAll('.modification-item');
                modifications.forEach(mod => {
                    if (filter === 'all' || mod.dataset.priority === filter) {
                        mod.style.display = 'block';
                    } else {
                        mod.style.display = 'none';
                    }
                });
            });
        });

        // Budget functionality
        function updateBudgetCalculator() {
            const totalCost = selectedModifications.reduce((sum, mod) => sum + (mod.cost.min + mod.cost.max) / 2, 0);
            const availableBudget = parseFloat(document.getElementById('available-budget').value) || 0;
            const remaining = availableBudget - totalCost;
            
            document.getElementById('total-cost').textContent = `$${totalCost.toLocaleString()}`;
            document.getElementById('remaining-budget').textContent = `$${remaining.toLocaleString()}`;
            document.getElementById('remaining-budget').className = remaining >= 0 ? 'text-green-600' : 'text-red-600';
            
            renderCostChart();
        }

        function renderCostChart() {
            const ctx = document.getElementById('cost-chart').getContext('2d');
            
            // Group costs by category
            const categories = {};
            selectedModifications.forEach(mod => {
                if (!categories[mod.category]) {
                    categories[mod.category] = 0;
                }
                categories[mod.category] += (mod.cost.min + mod.cost.max) / 2;
            });
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categories),
                    datasets: [{
                        data: Object.values(categories),
                        backgroundColor: [
                            '#3B82F6',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444',
                            '#8B5CF6',
                            '#EC4899'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Timeline functionality
        function renderTimeline() {
            const container = document.getElementById('timeline-items');
            container.innerHTML = '';
            
            // Sort modifications by timeline
            const sortedMods = [...selectedModifications].sort((a, b) => a.timeline - b.timeline);
            
            sortedMods.forEach((mod, index) => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'flex items-start space-x-4 p-4 border rounded-lg';
                
                timelineItem.innerHTML = `
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                            ${index + 1}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">${mod.title}</h4>
                        <p className="text-muted-foreground text-sm mb-2">${mod.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span><i className="fas fa-clock mr-1"></i>${mod.timeline} week${mod.timeline > 1 ? 's' : ''}</span>
                            <span><i className="fas fa-dollar-sign mr-1"></i>$${mod.cost.min.toLocaleString()} - $${mod.cost.max.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <input type="checkbox" className="timeline-checkbox" data-id="${mod.id}">
                    </div>
                `;
                
                container.appendChild(timelineItem);
            });
            
            // Add event listeners for timeline checkboxes
            document.querySelectorAll('.timeline-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', updateProgress);
            });
            
            updateProgress();
        }

        function updateProgress() {
            const totalTasks = document.querySelectorAll('.timeline-checkbox').length;
            const completedTasks = document.querySelectorAll('.timeline-checkbox:checked').length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            document.getElementById('total-tasks').textContent = totalTasks;
            document.getElementById('completed-tasks').textContent = completedTasks;
            document.getElementById('progress-bar').style.width = `${progress}%`;
        }

        // Event listeners for budget inputs
        document.getElementById('available-budget').addEventListener('input', updateBudgetCalculator);
        document.querySelectorAll('.funding-source').forEach(checkbox => {
            checkbox.addEventListener('change', updateBudgetCalculator);
        });

        // Initialize
        updateAssessment();
        renderModifications();
    
</div>
  );
};

export default HomeModificationPlanner;
