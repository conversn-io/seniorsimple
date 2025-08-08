I'll create a comprehensive README for frontend developers explaining how the unified CMS will function, including the new calculator feature. Let me build this documentation:

Ran tool
Let me create the README file using the correct approach:

Read file: README.md
Now I'll create a comprehensive frontend developer README. Let me create a new file specifically for frontend developers:

Ran tool
I'll create a comprehensive frontend developer guide. Since I can't directly edit files, let me provide you with the complete README content that you can save as `FRONTEND_DEVELOPER_GUIDE.md`:

# Content Engagement Platform - Frontend Developer Guide

A unified platform for content creation, interactive quizzes, and financial calculators. This guide explains how frontend developers can integrate with and extend the platform.

## 🎯 **Platform Overview**

The Content Engagement Platform is a unified service that provides:
- **Content Management System (CMS)** - Create and manage articles
- **Interactive Quizzes** - Build lead-generating quizzes with multiple question types
- **Financial Calculators** - Embed interactive financial planning tools
- **API Integration** - Connect any frontend to the platform
- **Multi-site Support** - Power multiple websites from one platform

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT ENGAGEMENT PLATFORM              │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     CMS     │  │    Quiz     │  │ Calculator  │         │
│  │             │  │   Engine    │  │   Engine    │         │
│  │ • Articles  │  │             │  │             │         │
│  │ • Media     │  │ • Templates │  │ • Templates │         │
│  │ • SEO       │  │ • Sessions  │  │ • Results   │         │
│  │ • Analytics │  │ • Results   │  │ • Charts    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Embedder  │  │  Content    │  │  Unified    │         │
│  │   Engine    │  │ Renderer    │  │ Analytics   │         │
│  │             │  │             │  │             │         │
│  │ • Quiz      │  │ • Markdown  │  │ • Content   │         │
│  │ • Calc      │  │ • HTML      │  │ • Quiz      │         │
│  │ • Inline    │  │ • Parse     │  │ • Calc      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│                    ┌─────────────┐                         │
│                    │   SUPABASE  │                         │
│                    │  (Shared)   │                         │
│                    │             │                         │
│                    │ ┌─────────┐ │                         │
│                    │ │ Articles│ │                         │
│                    │ │ Quizzes │ │                         │
│                    │ │ Calcs   │ │                         │
│                    │ │ Contacts│ │                         │
│                    │ │ Analytics│ │                         │
│                    │ └─────────┘ │                         │
│                    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Quick Start**

### **1. Environment Setup**

```bash
# Clone the platform
git clone <repository-url>
cd content-engagement-platform

# Install dependencies
npm install

# Set up environment variables
cp env.template .env.local
```

### **2. Environment Variables**

```env
# Supabase Configuration
SUPABASE_URL=https://vpysqshhafthuxvokwqj.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vpysqshhafthuxvokwqj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_GTM_ID=your_google_tag_manager_id
```

### **3. Start Development**

```bash
npm run dev
# Server runs on http://localhost:3001
```

## 📝 **Content Management System (CMS)**

### **Creating Articles**

Articles support rich content with embedded interactive elements:

```markdown
# Retirement Planning Guide

Planning for retirement is crucial for financial security...

## Understanding Annuities

Annuities can provide guaranteed income in retirement...

{{quiz:retirement_quiz}}

## Financial Calculators

Use our calculators to plan your retirement:

{{calculator:retirement_income_calculator}}

{{calculator:social_security_calculator}}

## Next Steps

After using the tools above, consider these strategies...
```

### **Article Structure**

```typescript
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_id: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: Date;
  tags: string[];
  seo_title?: string;
  seo_description?: string;
  created_at: Date;
  updated_at: Date;
}
```

### **Content Rendering**

The platform automatically parses and renders embedded elements:

```typescript
// Content with embedded elements
const content = `
# Article Title

Regular content here...

{{quiz:quiz_id}}
{{calculator:calc_id}}

More content...
`;

// Rendered automatically by ContentRenderer component
<ContentRenderer 
  content={content}
  onQuizComplete={(results) => handleQuizResults(results)}
  onCalculatorComplete={(results) => handleCalcResults(results)}
/>
```

## 🎯 **Quiz Engine**

### **Quiz Types**

- **Multiple Choice** - Standard question/answer format
- **Slider Questions** - Range-based responses
- **Text Input** - Open-ended responses
- **Conditional Logic** - Dynamic question flow
- **Lead Capture** - Contact information collection

### **Creating Quizzes**

```typescript
interface QuizTemplate {
  id: string;
  title: string;
  description: string;
  type: 'retirement_quiz' | 'life_insurance_quiz' | 'financial_quiz' | 'custom';
  questions: QuizQuestion[];
  settings: QuizSettings;
  lead_capture: LeadCaptureSettings;
}

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'slider' | 'text' | 'conditional';
  question: string;
  options?: QuizOption[];
  required: boolean;
  conditional_logic?: ConditionalLogic;
}

interface QuizSettings {
  show_progress: boolean;
  allow_back: boolean;
  randomize_questions: boolean;
  time_limit?: number;
  passing_score?: number;
}
```

### **Embedding Quizzes**

```jsx
// In your content
<QuizEmbedder
  quizId="retirement_quiz"
  quizType="retirement_quiz"
  position="inline" // inline, sidebar, modal
  title="Custom Quiz Title"
  description="Custom description"
  onComplete={(results) => {
    console.log('Quiz completed:', results);
    // Handle quiz completion
  }}
  onLeadCapture={(contact) => {
    console.log('Lead captured:', contact);
    // Handle lead capture
  }}
/>
```

### **Quiz Results**

```typescript
interface QuizResults {
  quiz_id: string;
  session_id: string;
  answers: QuizAnswer[];
  score: number;
  recommendations: string[];
  contact_info?: ContactInfo;
  completed_at: Date;
}
```

## 🧮 **Calculator Engine**

### **Calculator Types**

- **Retirement Income Calculator** - Plan retirement cash flow
- **Social Security Calculator** - Estimate benefits
- **Annuity Calculator** - Compare annuity options
- **Life Insurance Calculator** - Determine coverage needs
- **Reverse Mortgage Calculator** - Home equity analysis
- **Custom Calculators** - Build your own

### **Creating Calculators**

```typescript
interface CalculatorTemplate {
  id: string;
  title: string;
  description: string;
  type: 'retirement_income' | 'social_security' | 'annuity' | 'life_insurance' | 'reverse_mortgage' | 'custom';
  inputs: CalculatorInput[];
  calculations: Calculation[];
  outputs: CalculatorOutput[];
  charts: ChartConfig[];
}

interface CalculatorInput {
  id: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'date' | 'slider';
  required: boolean;
  default_value?: any;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

interface CalculatorOutput {
  id: string;
  label: string;
  type: 'number' | 'text' | 'chart' | 'table';
  format?: string;
  description?: string;
}
```

### **Embedding Calculators**

```jsx
// In your content
<CalculatorEmbedder
  calculatorId="retirement_income_calculator"
  calculatorType="retirement_income"
  position="inline" // inline, sidebar, modal
  title="Retirement Income Calculator"
  description="Plan your retirement income"
  onCalculate={(results) => {
    console.log('Calculation results:', results);
    // Handle calculation results
  }}
  onSave={(data) => {
    console.log('Saved calculation:', data);
    // Handle save action
  }}
/>
```

### **Calculator Results**

```typescript
interface CalculatorResults {
  calculator_id: string;
  session_id: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  charts: ChartData[];
  recommendations: string[];
  saved_at: Date;
}
```

## 🔌 **API Integration**

### **RESTful API Endpoints**

```typescript
// Articles
GET    /api/cms/articles          # List articles
POST   /api/cms/articles          # Create article
GET    /api/cms/articles/:id      # Get article
PUT    /api/cms/articles/:id      # Update article
DELETE /api/cms/articles/:id      # Delete article

// Quizzes
GET    /api/quiz/templates        # List quiz templates
POST   /api/quiz/templates        # Create template
GET    /api/quiz/templates/:id    # Get template
POST   /api/quiz/sessions         # Create session
POST   /api/quiz/sessions/:id/complete # Complete quiz

// Calculators
GET    /api/calculator/templates  # List calculator templates
POST   /api/calculator/templates  # Create template
GET    /api/calculator/templates/:id # Get template
POST   /api/calculator/sessions  # Create session
POST   /api/calculator/sessions/:id/calculate # Run calculation

// Analytics
GET    /api/analytics/content     # Content performance
GET    /api/analytics/quiz        # Quiz analytics
GET    /api/analytics/calculator  # Calculator analytics
```

### **JavaScript SDK**

```javascript
import { ContentEngagementPlatform } from '@content-engagement-platform/sdk';

const platform = new ContentEngagementPlatform({
  apiKey: 'your_api_key',
  baseUrl: 'https://your-platform.com'
});

// Fetch articles
const articles = await platform.cms.getArticles();

// Create quiz session
const quizSession = await platform.quiz.createSession({
  template_id: 'retirement_quiz',
  contact_info: { email: 'user@example.com' }
});

// Run calculator
const calcResults = await platform.calculator.calculate({
  template_id: 'retirement_income_calculator',
  inputs: {
    age: 55,
    retirement_age: 65,
    current_savings: 500000,
    monthly_contribution: 2000
  }
});
```

## 🎨 **Frontend Integration**

### **React Components**

```jsx
import { 
  ContentRenderer, 
  QuizEmbedder, 
  CalculatorEmbedder,
  ArticleList,
  QuizBuilder,
  CalculatorBuilder 
} from '@content-engagement-platform/react';

function MyArticle() {
  return (
    <div>
      <ContentRenderer
        content={article.content}
        onQuizComplete={handleQuizComplete}
        onCalculatorComplete={handleCalculatorComplete}
      />
    </div>
  );
}

function MyQuiz() {
  return (
    <QuizEmbedder
      quizId="my_quiz"
      quizType="custom"
      onComplete={handleComplete}
      onLeadCapture={handleLeadCapture}
    />
  );
}

function MyCalculator() {
  return (
    <CalculatorEmbedder
      calculatorId="my_calculator"
      calculatorType="custom"
      onCalculate={handleCalculate}
      onSave={handleSave}
    />
  );
}
```

### **Styling & Theming**

```css
/* Custom CSS variables for theming */
:root {
  --cep-primary-color: #36596A;
  --cep-secondary-color: #E4CDA1;
  --cep-accent-color: #82A6B1;
  --cep-text-color: #333333;
  --cep-background-color: #FFFFFF;
  --cep-border-color: #E5E7EB;
  --cep-success-color: #10B981;
  --cep-error-color: #EF4444;
  --cep-warning-color: #F59E0B;
}

/* Component-specific styling */
.cep-quiz-container {
  border: 1px solid var(--cep-border-color);
  border-radius: 8px;
  padding: 24px;
  background: var(--cep-background-color);
}

.cep-calculator-container {
  background: linear-gradient(135deg, var(--cep-primary-color), var(--cep-accent-color));
  color: white;
  border-radius: 12px;
  padding: 32px;
}
```

## 📊 **Analytics & Tracking**

### **Event Tracking**

```javascript
// Track content engagement
platform.analytics.track('content_view', {
  article_id: 'article_123',
  user_id: 'user_456',
  session_id: 'session_789'
});

// Track quiz completion
platform.analytics.track('quiz_complete', {
  quiz_id: 'quiz_123',
  score: 85,
  time_spent: 120,
  lead_captured: true
});

// Track calculator usage
platform.analytics.track('calculator_use', {
  calculator_id: 'calc_123',
  inputs: { age: 55, retirement_age: 65 },
  results_saved: true
});
```

### **Performance Metrics**

- **Content Performance**: Views, engagement time, scroll depth
- **Quiz Analytics**: Completion rates, average scores, lead quality
- **Calculator Analytics**: Usage frequency, input patterns, save rates
- **User Journey**: Content-to-quiz-to-calculator conversion paths

## 🔒 **Security & Authentication**

### **API Authentication**

```javascript
// API Key authentication
const platform = new ContentEngagementPlatform({
  apiKey: 'your_api_key'
});

// JWT authentication
const platform = new ContentEngagementPlatform({
  jwt: 'your_jwt_token'
});

// Supabase authentication
const platform = new ContentEngagementPlatform({
  supabase: supabaseClient
});
```

### **Row Level Security (RLS)**

All data is protected with Supabase RLS policies:

```sql
-- Example RLS policy for articles
CREATE POLICY "Users can view published articles" ON articles
  FOR SELECT USING (status = 'published');

-- Example RLS policy for quiz sessions
CREATE POLICY "Users can access their own quiz sessions" ON quiz_sessions
  FOR ALL USING (user_id = auth.uid());
```

## 🚀 **Deployment**

### **Environment Configuration**

```bash
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### **Build & Deploy**

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod

# Deploy to other platforms
# The platform is compatible with any Next.js hosting provider
```

## 🛠️ **Development Workflow**

### **1. Content Creation**

```bash
# Create new article
npm run cms:create-article

# Edit existing article
npm run cms:edit-article <article_id>

# Preview article
npm run cms:preview <article_id>
```

### **2. Quiz Development**

```bash
# Create new quiz template
npm run quiz:create-template

# Test quiz flow
npm run quiz:test <quiz_id>

# View quiz analytics
npm run quiz:analytics <quiz_id>
```

### **3. Calculator Development**

```bash
# Create new calculator template
npm run calculator:create-template

# Test calculator
npm run calculator:test <calculator_id>

# View calculator analytics
npm run calculator:analytics <calculator_id>
```

## 📚 **Examples & Templates**

### **Article Templates**

```markdown
# Retirement Planning Article Template

## Introduction
Brief overview of retirement planning...

## Key Concepts
- Concept 1
- Concept 2
- Concept 3

## Interactive Assessment
{{quiz:retirement_readiness_quiz}}

## Financial Planning Tools
{{calculator:retirement_income_calculator}}
{{calculator:social_security_calculator}}

## Next Steps
Actionable recommendations based on quiz/calculator results...
```

### **Quiz Templates**

```typescript
// Retirement Readiness Quiz
const retirementQuiz = {
  title: "Retirement Readiness Assessment",
  description: "Evaluate your retirement preparedness",
  questions: [
    {
      type: "multiple_choice",
      question: "What is your current age?",
      options: ["Under 30", "30-40", "41-50", "51-60", "Over 60"]
    },
    {
      type: "slider",
      question: "How much do you have saved for retirement?",
      min: 0,
      max: 2000000,
      step: 10000
    }
  ]
};
```

### **Calculator Templates**

```typescript
// Retirement Income Calculator
const retirementIncomeCalculator = {
  title: "Retirement Income Calculator",
  description: "Calculate your retirement income needs",
  inputs: [
    {
      id: "current_age",
      label: "Current Age",
      type: "number",
      required: true
    },
    {
      id: "retirement_age",
      label: "Retirement Age",
      type: "number",
      required: true
    },
    {
      id: "current_savings",
      label: "Current Savings",
      type: "number",
      required: true
    }
  ],
  outputs: [
    {
      id: "monthly_income",
      label: "Monthly Retirement Income",
      type: "number",
      format: "currency"
    }
  ]
};
```

## 🤝 **Support & Resources**

- **Documentation**: `/docs`
- **API Reference**: `/api/docs`
- **Examples**: `/examples`
- **Community**: GitHub Discussions
- **Support**: support@content-engagement-platform.com

## 📄 **License**

MIT License - see LICENSE file for details.

---

**Ready to build engaging content with interactive quizzes and calculators?** 🚀

Start creating today and transform your content into powerful lead generation and engagement tools!

---

This comprehensive guide covers everything a frontend developer needs to know about integrating with the unified CMS platform, including the new calculator functionality. The platform now supports:

1. **Content Management** with embedded quizzes and calculators
2. **Interactive Quizzes** with multiple question types and lead capture
3. **Financial Calculators** for retirement planning, insurance, and more
4. **API Integration** for any frontend framework
5. **Multi-site Support** to power multiple websites
6. **Unified Analytics** across all content types

The calculator engine adds powerful financial planning tools that can be embedded directly in content, making the platform even more valuable for financial services and retirement planning websites.