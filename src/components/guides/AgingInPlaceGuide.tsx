import React, { useState } from 'react';

interface AgingInPlaceGuideProps {
  // Add props as needed
}

const AgingInPlaceGuide: React.FC<AgingInPlaceGuideProps> = () => {
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="container mx-auto p-6">

        const AgingInPlaceGuide = () => {
            const [activeSection, setActiveSection] = React.useState('overview');
            const [checkedItems, setCheckedItems] = React.useState({});
            const [estimatedCosts, setEstimatedCosts] = React.useState({});

            const modificationAreas = {
                bathroom: {
                    title: "Bathroom Safety",
                    icon: "fas fa-bath",
                    modifications: [
                        { item: "Grab bars in shower/tub", cost: 150, priority: "high" },
                        { item: "Non-slip flooring", cost: 800, priority: "high" },
                        { item: "Walk-in shower conversion", cost: 3500, priority: "medium" },
                        { item: "Raised toilet seat", cost: 50, priority: "low" },
                        { item: "Shower seat/bench", cost: 200, priority: "medium" },
                        { item: "Hand-held shower head", cost: 100, priority: "low" }
                    ]
                },
                kitchen: {
                    title: "Kitchen Accessibility",
                    icon: "fas fa-utensils",
                    modifications: [
                        { item: "Lever-style door handles", cost: 200, priority: "medium" },
                        { item: "Pull-out drawers in cabinets", cost: 600, priority: "medium" },
                        { item: "Lowered countertop section", cost: 1200, priority: "low" },
                        { item: "Easy-grip cabinet hardware", cost: 300, priority: "low" },
                        { item: "Under-counter lighting", cost: 400, priority: "low" }
                    ]
                },
                bedroom: {
                    title: "Bedroom Safety",
                    icon: "fas fa-bed",
                    modifications: [
                        { item: "Bedside lighting controls", cost: 150, priority: "medium" },
                        { item: "Bed rails/assist bars", cost: 100, priority: "medium" },
                        { item: "Bedroom door widening", cost: 800, priority: "low" },
                        { item: "Accessible closet systems", cost: 1000, priority: "low" }
                    ]
                },
                stairs: {
                    title: "Stair Safety",
                    icon: "fas fa-walking",
                    modifications: [
                        { item: "Stair railings (both sides)", cost: 300, priority: "high" },
                        { item: "Improved stair lighting", cost: 200, priority: "high" },
                        { item: "Non-slip stair treads", cost: 150, priority: "high" },
                        { item: "Stair lift installation", cost: 4000, priority: "medium" }
                    ]
                },
                general: {
                    title: "General Home Safety",
                    icon: "fas fa-home",
                    modifications: [
                        { item: "Improved outdoor lighting", cost: 300, priority: "high" },
                        { item: "Ramp installation", cost: 1500, priority: "medium" },
                        { item: "Doorway widening", cost: 500, priority: "medium" },
                        { item: "Lever door handles throughout", cost: 400, priority: "medium" },
                        { item: "Smart home safety systems", cost: 800, priority: "low" }
                    ]
                }
            };

            const costRanges = {
                immediate: { label: "Immediate (0-6 months)", color: "bg-red-100 text-red-800" },
                shortTerm: { label: "Short-term (6-18 months)", color: "bg-yellow-100 text-yellow-800" },
                longTerm: { label: "Long-term (1-3 years)", color: "bg-green-100 text-green-800" }
            };

            const toggleCheck = (area, index) => {
                const key = `${area}-${index}`;
                setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
            };

            const calculateTotalCost = () => {
                let total = 0;
                Object.keys(modificationAreas).forEach(area => {
                    modificationAreas[area].modifications.forEach((mod, index) => {
                        const key = `${area}-${index}`;
                        if (checkedItems[key]) {
                            total += mod.cost;
                        }
                    });
                });
                return total;
            };

            const getPriorityColor = (priority) => {
                switch(priority) {
                    case 'high': return 'text-red-600 bg-red-50';
                    case 'medium': return 'text-yellow-600 bg-yellow-50';
                    case 'low': return 'text-green-600 bg-green-50';
                    default: return 'text-muted-foreground bg-background';
                }
            };

            React.useEffect(() => {
                // Create cost breakdown chart
                const ctx = document.getElementById('costBreakdownChart');
                if (ctx) {
                    const chart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(modificationAreas).map(key => modificationAreas[key].title),
                            datasets: [{
                                data: Object.keys(modificationAreas).map(key => {
                                    return modificationAreas[key].modifications.reduce((sum, mod) => sum + mod.cost, 0);
                                }),
                                backgroundColor: [
                                    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'
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
                                }
                            }
                        }
                    });
                }
            }, []);

            return (
                <div className="min-h-screen bg-background">
                    {/* Header */}
                    <div className="bg-card shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="py-6">
                                <h1 className="text-3xl font-bold text-foreground">
                                    <i className="fas fa-home mr-3 text-primary"></i>
                                    Aging in Place Guide
                                </h1>
                                <p className="mt-2 text-muted-foreground">
                                    Make your home safe, accessible, and comfortable for aging in place
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="bg-card shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <nav className="flex space-x-8 py-4">
                                {[
                                    { id: 'overview', label: 'Overview', icon: 'fas fa-eye' },
                                    { id: 'checklist', label: 'Modification Checklist', icon: 'fas fa-list-check' },
                                    { id: 'costs', label: 'Cost Estimator', icon: 'fas fa-calculator' },
                                    { id: 'timeline', label: 'Planning Timeline', icon: 'fas fa-calendar' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveSection(tab.id)}
                                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                                            activeSection === tab.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <i className={`${tab.icon} mr-2`}></i>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Overview Section */}
                        {activeSection === 'overview' && (
                            <div className="space-y-8">
                                <div className="bg-card rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">
                                        Why Age in Place?
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-3">Benefits</h3>
                                            <ul className="space-y-2">
                                                {[
                                                    'Maintain independence and familiar surroundings',
                                                    'Often more cost-effective than assisted living',
                                                    'Stay connected to community and neighbors',
                                                    'Preserve emotional attachment to home',
                                                    'Flexibility to modify as needs change'
                                                ].map((benefit, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                                                        <span className="text-gray-700">{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-3">Considerations</h3>
                                            <ul className="space-y-2">
                                                {[
                                                    'Home modifications may require upfront investment',
                                                    'Ongoing maintenance responsibilities',
                                                    'Potential for social isolation',
                                                    'May need additional care services',
                                                    'Emergency response planning important'
                                                ].map((consideration, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-2"></i>
                                                        <span className="text-gray-700">{consideration}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">
                                        Cost Breakdown by Area
                                    </h2>
                                    <div style={{ height: '400px' }}>
                                        <canvas id="costBreakdownChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Checklist Section */}
                        {activeSection === 'checklist' && (
                            <div className="space-y-6">
                                <div className="bg-card rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">
                                        Home Modification Checklist
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        Check off modifications you're considering to build your personalized plan.
                                    </p>

                                    {Object.entries(modificationAreas).map(([areaKey, area]) => (
                                        <div key={areaKey} className="mb-8">
                                            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                                                <i className={`${area.icon} mr-3 text-primary`}></i>
                                                {area.title}
                                            </h3>
                                            <div className="space-y-3">
                                                {area.modifications.map((mod, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={checkedItems[`${areaKey}-${index}`] || false}
                                                                onChange={() => toggleCheck(areaKey, index)}
                                                                className="h-4 w-4 text-primary rounded border-input focus:ring-blue-500"
                                                            />
                                                            <label className="ml-3 text-foreground font-medium">
                                                                {mod.item}
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(mod.priority)}`}>
                                                                {mod.priority.toUpperCase()}
                                                            </span>
                                                            <span className="text-lg font-semibold text-foreground">
                                                                ${mod.cost.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                        Selected Modifications Total
                                    </h3>
                                    <p className="text-3xl font-bold text-primary">
                                        ${calculateTotalCost().toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Cost Estimator Section */}
                        {activeSection === 'costs' && (
                            <div className="space-y-6">
                                <div className="bg-card rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">
                                        Cost Estimation by Priority
                                    </h2>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-background">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Modification
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Area
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Priority
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Cost
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-card divide-y divide-gray-200">
                                                {Object.entries(modificationAreas).flatMap(([areaKey, area]) =>
                                                    area.modifications.map((mod, index) => (
                                                        <tr key={`${areaKey}-${index}`}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                                {mod.item}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {area.title}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(mod.priority)}`}>
                                                                    {mod.priority.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                                ${mod.cost.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ).sort((a, b) => {
                                                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                                                    return priorityOrder[b.key.split('-')[2]] - priorityOrder[a.key.split('-')[2]];
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="bg-red-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-red-900 mb-2">
                                            High Priority
                                        </h3>
                                        <p className="text-2xl font-bold text-red-600">
                                            ${Object.values(modificationAreas).flatMap(area => area.modifications).filter(mod => mod.priority === 'high').reduce((sum, mod) => sum + mod.cost, 0).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-red-700 mt-2">
                                            Essential safety modifications
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                                            Medium Priority
                                        </h3>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            ${Object.values(modificationAreas).flatMap(area => area.modifications).filter(mod => mod.priority === 'medium').reduce((sum, mod) => sum + mod.cost, 0).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-yellow-700 mt-2">
                                            Comfort and accessibility improvements
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                                            Low Priority
                                        </h3>
                                        <p className="text-2xl font-bold text-green-600">
                                            ${Object.values(modificationAreas).flatMap(area => area.modifications).filter(mod => mod.priority === 'low').reduce((sum, mod) => sum + mod.cost, 0).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-green-700 mt-2">
                                            Convenience and quality of life
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timeline Section */}
                        {activeSection === 'timeline' && (
                            <div className="space-y-6">
                                <div className="bg-card rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">
                                        Planning Timeline
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        A suggested timeline for implementing aging in place modifications based on priority and complexity.
                                    </p>

                                    <div className="space-y-8">
                                        <div className="relative">
                                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                            
                                            {/* Immediate - 0-6 months */}
                                            <div className="relative flex items-start">
                                                <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-foreground font-bold text-sm">1</span>
                                                </div>
                                                <div className="ml-6 flex-1">
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        Immediate (0-6 months)
                                                    </h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        Focus on essential safety modifications that prevent falls and injuries.
                                                    </p>
                                                    <div className="space-y-2">
                                                        {Object.values(modificationAreas).flatMap(area => area.modifications).filter(mod => mod.priority === 'high').map((mod, index) => (
                                                            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                                                <span className="text-foreground">{mod.item}</span>
                                                                <span className="font-semibold text-red-600">${mod.cost.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Short-term - 6-18 months */}
                                            <div className="relative flex items-start mt-8">
                                                <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-foreground font-bold text-sm">2</span>
                                                </div>
                                                <div className="ml-6 flex-1">
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        Short-term (6-18 months)
                                                    </h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        Improve accessibility and comfort throughout the home.
                                                    </p>
                                                    <div className="space-y-2">
                                                        {Object.values(modificationAreas).flatMap(area => area.modifications).filter(mod => mod.priority === 'medium').slice(0, 5).map((mod, index) => (
                                                            <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                                                <span className="text-foreground">{mod.item}</span>
                                                                <span className="font-semibold text-yellow-600">${mod.cost.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Long-term - 1-3 years */}
                                            <div className="relative flex items-start mt-8">
                                                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-foreground font-bold text-sm">3</span>
                                                </div>
                                                <div className="ml-6 flex-1">
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        Long-term (1-3 years)
                                                    </h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        Enhance quality of life and plan for future needs.
                                                    </p>
                                                    <div className="space-y-2">
                                                        {Object.values(modificationAreas).flatMap(area => area.modifications).filter(mod => mod.priority === 'low').slice(0, 5).map((mod, index) => (
                                                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                                <span className="text-foreground">{mod.item}</span>
                                                                <span className="font-semibold text-green-600">${mod.cost.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                        <i className="fas fa-lightbulb mr-2"></i>
                                        Pro Tips for Implementation
                                    </h3>
                                    <ul className="space-y-2">
                                        {[
                                            'Start with an occupational therapist assessment',
                                            'Get multiple quotes for major modifications',
                                            'Check for local grants and assistance programs',
                                            'Consider hiring a certified aging-in-place specialist',
                                            'Plan modifications during home renovation projects',
                                            'Keep receipts for potential tax deductions'
                                        ].map((tip, index) => (
                                            <li key={index} className="flex items-start">
                                                <i className="fas fa-star text-blue-500 mt-1 mr-2"></i>
                                                <span className="text-blue-800">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer CTA */}
                    <div className="bg-primary text-primary-foreground py-12">
                        <div className="max-w-4xl mx-auto text-center px-4">
                            <h2 className="text-2xl font-bold mb-4">
                                Ready to Start Your Aging in Place Journey?
                            </h2>
                            <p className="text-lg mb-6">
                                Get personalized guidance from our retirement planning experts.
                            </p>
                            <button className="bg-card text-primary px-8 py-3 rounded-lg font-semibold hover:bg-muted transition-colors">
                                <i className="fas fa-calendar-alt mr-2"></i>
                                Schedule Free Consultation
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        ReactDOM.render(<AgingInPlaceGuide />, document.getElementById('root'));
    
</div>
  );
};

export default AgingInPlaceGuide;
