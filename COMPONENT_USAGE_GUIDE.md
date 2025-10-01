# SeniorSimple Enhanced CMS Components Guide

This guide covers all the new interactive components created for the SeniorSimple CMS system. These components provide rich, interactive experiences for calculators, tools, checklists, and content display.

## 🧮 Calculator Components

### CalculatorWrapper

A comprehensive calculator component that handles input forms, real-time calculations, and result display.

#### Features:
- ✅ **Real-time calculations** with debounced input handling
- ✅ **Multiple input types**: number, select, range
- ✅ **Currency and percentage formatting**
- ✅ **Save/load functionality** with localStorage
- ✅ **Print and download capabilities**
- ✅ **Error handling** and validation
- ✅ **Responsive design** for all screen sizes

#### Usage:

```tsx
import { CalculatorWrapper } from '@/components'
import { CalculatorConfig } from '@/lib/enhanced-articles'

const calculatorConfig: CalculatorConfig = {
  calculator_type: 'financial',
  inputs: [
    {
      id: 'homeValue',
      label: 'Current Home Value',
      type: 'number',
      required: true,
      default_value: 450000,
      help_text: 'Enter the current market value of your home'
    },
    {
      id: 'newHomeValue',
      label: 'New Home Purchase Price',
      type: 'number',
      required: true,
      default_value: 325000
    }
  ],
  outputs: [
    {
      id: 'netEquityGain',
      label: 'Net Equity Gain',
      type: 'currency',
      format: 'currency',
      formula: 'homeValue - newHomeValue - 50000'
    },
    {
      id: 'annualSavings',
      label: 'Annual Savings',
      type: 'currency',
      format: 'currency',
      formula: '(homeValue * 0.02) - (newHomeValue * 0.015)'
    }
  ],
  disclaimer: 'This calculator provides estimates only. Consult with a financial advisor for personalized advice.'
}

function DownsizingCalculator() {
  return (
    <CalculatorWrapper
      config={calculatorConfig}
      title="Downsizing Calculator"
      description="Calculate the financial impact of downsizing your home in retirement"
    />
  )
}
```

#### Input Types Supported:

1. **Number Inputs**:
   ```tsx
   {
     id: 'homeValue',
     label: 'Home Value',
     type: 'number',
     min: 0,
     max: 10000000,
     step: 1000,
     unit: 'USD'
   }
   ```

2. **Select Inputs**:
   ```tsx
   {
     id: 'state',
     label: 'State',
     type: 'select',
     options: ['California', 'Florida', 'Texas', 'New York']
   }
   ```

3. **Range Inputs**:
   ```tsx
   {
     id: 'age',
     label: 'Age',
     type: 'range',
     min: 18,
     max: 100,
     step: 1
   }
   ```

#### Output Types Supported:

1. **Currency**: Automatically formats as USD
2. **Percentage**: Displays with % symbol
3. **Number**: Standard number formatting

## 🛠️ Tool Components

### InteractiveTool

A multi-step interactive tool for guided processes and assessments.

#### Features:
- ✅ **Multi-step workflow** with progress tracking
- ✅ **Form validation** and data persistence
- ✅ **Progress saving** to localStorage
- ✅ **Step-by-step guidance** and help text
- ✅ **Completion tracking** with time metrics
- ✅ **Export functionality** for results

#### Usage:

```tsx
import { InteractiveTool } from '@/components'
import { ToolConfig } from '@/lib/enhanced-articles'

const toolConfig: ToolConfig = {
  steps: [
    {
      title: 'Personal Information',
      description: 'Tell us about yourself',
      inputs: [
        {
          id: 'firstName',
          label: 'First Name',
          type: 'text',
          required: true
        },
        {
          id: 'age',
          label: 'Age',
          type: 'number',
          required: true,
          min: 18,
          max: 100
        }
      ]
    },
    {
      title: 'Financial Assessment',
      description: 'Help us understand your financial situation',
      inputs: [
        {
          id: 'income',
          label: 'Annual Income',
          type: 'number',
          required: true
        },
        {
          id: 'savings',
          label: 'Current Savings',
          type: 'number',
          required: true
        }
      ],
      guidance: 'Include all sources of income and liquid savings'
    }
  ],
  completion_message: 'Thank you for completing the assessment! Your personalized plan is ready.'
}

function BeneficiaryPlanningTool() {
  return (
    <InteractiveTool
      config={toolConfig}
      title="Beneficiary Planning Tool"
      description="Organize and track all your beneficiary designations"
    />
  )
}
```

#### Step Configuration:

Each step can include:
- **Title and description**
- **Input fields** with validation
- **Output calculations**
- **Guidance text** for users
- **Conditional logic** for next steps

## ✅ Checklist Components

### InteractiveChecklist

An interactive checklist with progress tracking and categorization.

#### Features:
- ✅ **Categorized items** with priority levels
- ✅ **Progress tracking** with completion percentage
- ✅ **Notes functionality** for each item
- ✅ **Filtering and sorting** options
- ✅ **Time tracking** and completion metrics
- ✅ **Export and save** capabilities

#### Usage:

```tsx
import { InteractiveChecklist } from '@/components'
import { ChecklistConfig } from '@/lib/enhanced-articles'

const checklistConfig: ChecklistConfig = {
  introduction: 'Use this checklist to ensure you have all the necessary documents and information for estate planning.',
  items: [
    {
      id: 'will',
      text: 'Create or update your will',
      category_id: 'legal',
      priority: 'high',
      estimated_time: '2-3 hours'
    },
    {
      id: 'powerOfAttorney',
      text: 'Set up power of attorney documents',
      category_id: 'legal',
      priority: 'high',
      estimated_time: '1-2 hours'
    },
    {
      id: 'beneficiaryReview',
      text: 'Review and update beneficiary designations',
      category_id: 'financial',
      priority: 'medium',
      estimated_time: '30 minutes'
    }
  ],
  categories: ['legal', 'financial', 'healthcare'],
  conclusion: 'Congratulations! You\'ve completed your estate planning checklist. Consider consulting with an estate planning attorney for complex situations.'
}

function EstatePlanningChecklist() {
  return (
    <InteractiveChecklist
      config={checklistConfig}
      title="Estate Planning Checklist"
      description="Complete this checklist to ensure your estate is properly planned"
    />
  )
}
```

#### Item Properties:

- **Priority levels**: high, medium, low
- **Categories**: Custom categorization
- **Estimated time**: Time to complete each item
- **Due dates**: Optional deadline tracking
- **Notes**: User can add personal notes

## 📄 Content Display Components

### EnhancedArticleDisplay

A comprehensive article display component with interactive features.

#### Features:
- ✅ **Reading progress tracking**
- ✅ **Bookmark functionality**
- ✅ **Share and print options**
- ✅ **Table of contents** navigation
- ✅ **Interactive content** integration
- ✅ **SEO-optimized** structure
- ✅ **Responsive design**

#### Usage:

```tsx
import { EnhancedArticleDisplay } from '@/components'
import { EnhancedArticleWithCategory } from '@/lib/enhanced-articles'

function ArticlePage({ article }: { article: EnhancedArticleWithCategory }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <EnhancedArticleDisplay
        article={article}
        className="max-w-4xl"
      />
    </div>
  )
}
```

#### Article Features:

- **Content type detection** (guide, calculator, tool, checklist)
- **Difficulty level** indicators
- **Reading time** estimation
- **Readability score** display
- **Engagement metrics** (views, likes)
- **Related articles** suggestions

## 🔍 Search Components

### ContentSearch

A powerful search component with filtering and suggestions.

#### Features:
- ✅ **Real-time search** with debouncing
- ✅ **Advanced filtering** by content type, category, difficulty
- ✅ **Recent searches** tracking
- ✅ **Popular searches** suggestions
- ✅ **Search result highlighting**
- ✅ **Keyboard navigation** support

#### Usage:

```tsx
import { ContentSearch } from '@/components'
import { EnhancedArticleWithCategory } from '@/lib/enhanced-articles'

function SearchPage() {
  const handleResultSelect = (article: EnhancedArticleWithCategory) => {
    // Navigate to article page
    router.push(`/articles/${article.slug}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ContentSearch
        onResultSelect={handleResultSelect}
        placeholder="Search guides, calculators, tools, and checklists..."
        className="max-w-2xl mx-auto"
      />
    </div>
  )
}
```

#### Search Features:

- **Full-text search** across title, content, and excerpt
- **Content type filtering** (guide, calculator, tool, checklist)
- **Category filtering** (retirement, medicare, estate planning, etc.)
- **Difficulty filtering** (beginner, intermediate, advanced)
- **Search suggestions** and autocomplete
- **Result ranking** by relevance

## 🎨 Design System Integration

### Color Scheme

All components use the SeniorSimple color palette:

```css
:root {
  --primary-blue: #36596A;
  --secondary-cream: #F5F5F0;
  --accent-gold: #E4CDA1;
  --text-dark: #2D3748;
  --text-light: #718096;
  --success-green: #38A169;
  --warning-yellow: #D69E2E;
  --error-red: #E53E3E;
}
```

### Typography

Components use a 7th-grade reading level with:
- **Clear, simple language**
- **Short sentences** (15-20 words max)
- **Large, readable fonts** (16px+ for body text)
- **High contrast** text colors
- **Generous line spacing** (1.6+ line-height)

### Accessibility Features

All components include:
- ✅ **Keyboard navigation** support
- ✅ **Screen reader** compatibility
- ✅ **High contrast** color schemes
- ✅ **Focus indicators** for interactive elements
- ✅ **ARIA labels** and descriptions
- ✅ **Semantic HTML** structure

## 📱 Responsive Design

Components are fully responsive with:
- **Mobile-first** design approach
- **Touch-friendly** interface elements
- **Adaptive layouts** for all screen sizes
- **Optimized performance** on mobile devices

## 🔧 Integration Examples

### Calculator Integration

```tsx
// pages/calculators/downsizing.tsx
import { CalculatorWrapper } from '@/components'
import { getArticleBySlug } from '@/lib/articles'

export default function DownsizingCalculatorPage({ article }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <CalculatorWrapper
        config={article.calculator_config}
        title={article.title}
        description={article.excerpt}
      />
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const { article } = await getArticleBySlug(params.slug)
  return { props: { article } }
}
```

### Tool Integration

```tsx
// pages/tools/beneficiary-planning.tsx
import { InteractiveTool } from '@/components'
import { getArticleBySlug } from '@/lib/articles'

export default function BeneficiaryPlanningPage({ article }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <InteractiveTool
        config={article.tool_config}
        title={article.title}
        description={article.excerpt}
      />
    </div>
  )
}
```

### Search Integration

```tsx
// components/layout/Header.tsx
import { ContentSearch } from '@/components'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="logo">SeniorSimple</div>
          <div className="flex-1 max-w-md mx-8">
            <ContentSearch
              onResultSelect={(article) => {
                window.location.href = `/articles/${article.slug}`
              }}
            />
          </div>
          <nav>...</nav>
        </div>
      </div>
    </header>
  )
}
```

## 🚀 Performance Optimization

### Best Practices:

1. **Lazy Loading**: Components load only when needed
2. **Memoization**: Expensive calculations are memoized
3. **Debouncing**: Search and input changes are debounced
4. **Local Storage**: User progress is saved locally
5. **Error Boundaries**: Graceful error handling
6. **Loading States**: Clear feedback during operations

### Bundle Size:

- **CalculatorWrapper**: ~15KB gzipped
- **InteractiveTool**: ~12KB gzipped
- **InteractiveChecklist**: ~10KB gzipped
- **EnhancedArticleDisplay**: ~8KB gzipped
- **ContentSearch**: ~6KB gzipped

## 🧪 Testing

### Component Testing:

```tsx
// __tests__/CalculatorWrapper.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CalculatorWrapper } from '@/components'

test('calculates results correctly', () => {
  const config = {
    inputs: [
      { id: 'value', label: 'Value', type: 'number', default_value: 100 }
    ],
    outputs: [
      { id: 'result', label: 'Result', type: 'number', formula: 'value * 2' }
    ]
  }

  render(<CalculatorWrapper config={config} title="Test Calculator" />)
  
  const input = screen.getByLabelText('Value')
  fireEvent.change(input, { target: { value: '50' } })
  
  expect(screen.getByText('100')).toBeInTheDocument()
})
```

## 📊 Analytics Integration

Components automatically track:
- **User interactions** (clicks, form submissions)
- **Completion rates** for tools and checklists
- **Time spent** on each component
- **Error rates** and user feedback
- **Performance metrics** (load times, responsiveness)

## 🔒 Security Considerations

- **Input validation** on all user inputs
- **XSS prevention** with proper sanitization
- **CSRF protection** for form submissions
- **Rate limiting** on search and calculations
- **Data encryption** for sensitive information

## 🎯 Next Steps

1. **Phase 2.2**: Design System Integration
2. **Phase 3**: Advanced Features (user accounts, analytics)
3. **Phase 4**: Performance Optimization
4. **Phase 5**: Testing and Quality Assurance

The enhanced CMS components are now ready to provide rich, interactive experiences for SeniorSimple users!





