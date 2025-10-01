# SeniorSimple CMS Setup Guide

This guide will help you set up the enhanced CMS system for SeniorSimple, including database schema, content migration, and SEO optimization.

## 🚀 Quick Start

### Prerequisites

1. **Supabase Project**: You need a Supabase project with the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for migrations)

2. **Node.js Dependencies**: Install the required packages:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📊 Database Setup

### Step 1: Run Database Migration

The enhanced schema includes:
- **Articles table** with SEO optimization fields
- **Content types**: guides, calculators, tools, checklists
- **Interactive elements**: calculator configs, tool steps, checklist items
- **Performance tracking**: analytics and user interactions
- **Full-text search** and semantic keyword support

```bash
# Run the database migration
npm run migrate:db

# If you need to rollback
npm run migrate:rollback
```

### Step 2: Verify Database Setup

The migration will:
- ✅ Create all required tables and relationships
- ✅ Set up indexes for performance
- ✅ Configure Row Level Security (RLS)
- ✅ Insert default categories and tags
- ✅ Create helpful views and functions
- ✅ Insert sample data for testing

## 📄 Content Migration

### Step 1: Import HTML Content

The content import system will:
- ✅ Process all HTML files in the `pages/` directory
- ✅ Extract and optimize content for 7th-grade readability
- ✅ Generate SEO metadata and structured data
- ✅ Create calculator, tool, and checklist configurations
- ✅ Import everything into the database

```bash
# Import all content
npm run import:content

# Clear existing content first (optional)
npm run import:clear
npm run import:content

# Run both database and content migration
npm run migrate:all
```

### Step 2: Content Processing

Each HTML file is processed to:

1. **Extract Content**: Title, description, keywords, and main content
2. **Optimize for SEO**: 
   - Simplify language for 7th-grade readability
   - Generate meta titles under 60 characters
   - Create descriptions under 155 characters
   - Extract semantic keywords for AI search
3. **Create Structured Data**: JSON-LD for search engines
4. **Configure Interactive Elements**: Calculator inputs/outputs, tool steps, checklist items

## 🎯 Content Types Supported

### 📚 Guides
- **Purpose**: Comprehensive how-to articles
- **Features**: Step-by-step instructions, FAQ sections, structured data
- **Examples**: "Complete Guide to Retirement Planning", "Medicare Made Simple"

### 🧮 Calculators
- **Purpose**: Interactive financial calculation tools
- **Features**: Input forms, real-time calculations, charts, print/save options
- **Examples**: "Downsizing Calculator", "Life Insurance Calculator"

### 🛠️ Tools
- **Purpose**: Interactive planning and assessment tools
- **Features**: Multi-step forms, progress tracking, data persistence
- **Examples**: "Beneficiary Planning Tool", "Home Modification Planner"

### ✅ Checklists
- **Purpose**: Step-by-step planning checklists
- **Features**: Interactive items, categories, progress tracking, completion rewards
- **Examples**: "Estate Planning Checklist", "Medicare Enrollment Checklist"

## 🔍 SEO Optimization Features

### 7th-Grade Readability
- **Word Simplification**: 100+ complex words replaced with simple alternatives
- **Sentence Structure**: Long sentences broken into shorter, clearer ones
- **Flesch Reading Ease**: Target score of 70+ (7th-grade level)

### AI Search Optimization
- **Semantic Keywords**: Natural language terms for AI search engines
- **Topic Clusters**: Related content grouping for better discovery
- **Structured Answers**: FAQ format optimized for voice search
- **Contextual Understanding**: Content marked up for AI comprehension

### Traditional SEO
- **Meta Optimization**: Titles, descriptions, keywords
- **Structured Data**: JSON-LD for all content types
- **Internal Linking**: Topic cluster relationships
- **Featured Snippets**: Optimized for Google's featured results

## 📊 Database Schema Overview

### Core Tables

```sql
-- Main articles table with enhanced fields
articles (
  id, title, slug, content, excerpt,
  content_type, difficulty_level, category,
  meta_title, meta_description, meta_keywords,
  reading_time, readability_score, semantic_keywords,
  calculator_config, tool_config, checklist_config,
  status, priority, featured, created_at, updated_at
)

-- Content categorization
article_categories (id, name, slug, description, color, icon)
article_tags (id, name, slug, description, color)

-- Interactive elements
calculator_inputs (article_id, input_id, label, type, validation)
calculator_outputs (article_id, output_id, label, type, formula)
calculator_charts (article_id, chart_id, type, title, config)
tool_steps (article_id, step_id, title, form_fields, validation)
checklist_items (article_id, item_id, title, category, priority)

-- Analytics and tracking
user_interactions (article_id, user_id, type, data, timestamp)
content_analytics (article_id, date, page_views, engagement)
```

### Views and Functions

```sql
-- Optimized views for common queries
published_articles -- Articles with category details
article_with_tags -- Articles with associated tags

-- Helper functions
get_articles_by_category(category_slug, limit)
search_articles(search_term, limit)
```

## 🚀 Usage Examples

### Querying Articles

```typescript
import { supabase } from './lib/supabase'

// Get all published articles
const { data: articles } = await supabase
  .from('published_articles')
  .select('*')
  .order('published_at', { ascending: false })

// Get articles by category
const { data: retirementArticles } = await supabase
  .from('articles')
  .select('*')
  .eq('category', 'retirement-planning')
  .eq('status', 'published')

// Search articles
const { data: searchResults } = await supabase
  .rpc('search_articles', { 
    search_term: 'medicare', 
    limit_count: 10 
  })

// Get calculators
const { data: calculators } = await supabase
  .from('articles')
  .select('*')
  .eq('content_type', 'calculator')
  .not('calculator_config', 'is', null)
```

### Using Enhanced Article Interface

```typescript
import { EnhancedArticle } from './lib/enhanced-articles'

const article: EnhancedArticle = {
  id: 'uuid',
  title: 'Downsizing Calculator',
  content_type: 'calculator',
  calculator_config: {
    calculator_type: 'financial',
    inputs: [
      {
        id: 'homeValue',
        label: 'Current Home Value',
        type: 'number',
        required: true,
        default_value: 450000
      }
    ],
    outputs: [
      {
        id: 'savings',
        label: 'Annual Savings',
        type: 'currency'
      }
    ]
  }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Migration Fails**: Check your Supabase service role key has admin permissions
2. **Content Import Errors**: Ensure HTML files are in the `pages/` directory
3. **Permission Errors**: Verify RLS policies are correctly set up
4. **Search Not Working**: Check that the `pg_trgm` extension is enabled

### Debug Commands

```bash
# Check database connection
npm run migrate:db

# Test content import with verbose output
npm run import:content

# Clear and reimport everything
npm run import:clear
npm run import:content
```

## 📈 Performance Optimization

### Database Indexes
- Full-text search on title, content, and excerpt
- GIN indexes on JSONB fields (calculator_config, etc.)
- B-tree indexes on frequently queried fields

### Caching Strategy
- Use Supabase's built-in caching for frequently accessed data
- Implement client-side caching for calculator configurations
- Cache search results for common queries

### Query Optimization
- Use the provided views for common queries
- Leverage the search function for full-text search
- Use category-specific queries for better performance

## 🎉 Next Steps

After completing the setup:

1. **Test the System**: Verify all content is imported correctly
2. **Build Components**: Create React components for calculators and tools
3. **Implement Design**: Apply SeniorSimple's design system
4. **Deploy**: Push to production and test live functionality

## 📞 Support

If you encounter any issues:

1. Check the console output for detailed error messages
2. Verify your environment variables are correct
3. Ensure your Supabase project has the necessary permissions
4. Review the database schema for any missing tables or fields

The enhanced CMS system is now ready to power SeniorSimple with optimized, interactive content that's perfectly suited for seniors and baby boomers!





