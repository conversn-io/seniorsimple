import React, { useState } from 'react';

interface MedicareEnrollmentGuideProps {
  className?: string;
}

export default function MedicareEnrollmentGuide({ className }: MedicareEnrollmentGuideProps = {}) {
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
      // Checklist functionality
        let completedItems = 0;
        const totalItems = 10;

        function toggleChecklistItem(element) {
            const checkbox = element.querySelector('input[type="checkbox"]');
            const isChecked = checkbox.checked;
            
            checkbox.checked = !isChecked;
            
            if (checkbox.checked) {
                element.classList.add('completed');
                completedItems++;
            } else {
                element.classList.remove('completed');
                completedItems--;
            }
            
            updateProgress();
        }

        function updateProgress() {
            const progressPercentage = (completedItems / totalItems) * 100;
            document.getElementById('checklist-bar').style.width = progressPercentage + '%';
            document.getElementById('checklist-progress').textContent = `${completedItems} of ${totalItems} completed`;
            
            // Update main progress bar
            document.getElementById('progress-bar').style.width = progressPercentage + '%';
            document.getElementById('progress-text').textContent = Math.round(progressPercentage) + '% Complete';
        }

        // Enrollment periods chart
        const ctx = document.getElementById('enrollmentChart').getContext('2d');
        const enrollmentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['IEP', 'GEP', 'SEP', 'OEP'],
                datasets: [{
                    label: 'Enrollment Opportunities',
                    data: [100, 60, 80, 90],
                    backgroundColor: [
                        '#3B82F6',
                        '#10B981',
                        '#F59E0B',
                        '#8B5CF6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Enrollment Period Advantages'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Advantage Score'
                        }
                    }
                }
            }
        });

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Auto-update progress based on scroll position
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            if (completedItems === 0) {
                document.getElementById('progress-bar').style.width = Math.min(scrollPercent, 100) + '%';
                document.getElementById('progress-text').textContent = Math.round(Math.min(scrollPercent, 100)) + '% Complete';
            }
        });
    </div>
  );
}