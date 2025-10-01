const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const missingContent = [
  {
    title: 'Disability Insurance Calculator: Protect Your Income',
    slug: 'disability-calculator',
    content: `# Disability Insurance Calculator: Protect Your Income

## Secure Your Financial Future Against Disability

Disability insurance is one of the most important yet often overlooked forms of protection. With a 25% chance of becoming disabled before retirement, having adequate disability coverage is crucial for protecting your income and financial security. This calculator helps you determine how much disability insurance you need and evaluate your current coverage.

## Understanding Disability Insurance

### What is Disability Insurance?

Disability insurance provides income replacement if you become unable to work due to illness or injury. It's designed to help you maintain your standard of living and meet financial obligations when you can't earn an income.

**Key Features:**
- **Income Replacement**: Typically 60-80% of your pre-disability income
- **Benefit Period**: How long benefits are paid (2 years to age 65)
- **Elimination Period**: Waiting period before benefits begin (30-180 days)
- **Definition of Disability**: Own occupation vs. any occupation
- **Premium Cost**: Based on age, health, occupation, and coverage amount

## Disability Insurance Calculator

**Use our interactive calculator below to determine your disability insurance needs:**

[EMBEDDED CALCULATOR WILL APPEAR HERE]

### How to Use This Calculator

1. **Current Income**: Enter your annual gross income
2. **Monthly Expenses**: Input your essential monthly expenses
3. **Existing Coverage**: Include current disability insurance benefits
4. **Other Income Sources**: Add any other income you'd have if disabled
5. **Coverage Preferences**: Select your desired benefit period and elimination period

The calculator will show you:
- Recommended disability insurance coverage amount
- Monthly benefit needed to maintain lifestyle
- Coverage gap analysis
- Premium cost estimates
- Different coverage scenarios

## Conclusion

Disability insurance is a critical component of comprehensive financial planning that protects your most valuable asset—your ability to earn income. By using our disability insurance calculator and understanding the key features and options, you can make informed decisions about protecting your financial future.

**Ready to protect your income? Use our calculator above to determine your disability insurance needs, then consult with an insurance professional to find the right coverage for your situation.**`,
    excerpt: 'Calculate your disability insurance needs with our comprehensive calculator. Protect your income and financial security with the right disability coverage for your situation.',
    content_type: 'html',
    category: 'insurance',
    focus_keyword: 'disability insurance calculator'
  },
  {
    title: 'Retirement Planning Assessment: Evaluate Your Readiness',
    slug: 'retirement-planning-assessment',
    content: `# Retirement Planning Assessment: Evaluate Your Readiness

## Take Control of Your Retirement Future

Retirement planning is one of the most important financial decisions you'll make. This comprehensive assessment helps you evaluate your current retirement readiness, identify areas for improvement, and create a personalized action plan to achieve your retirement goals.

## Why Retirement Planning Matters

### The Retirement Reality

**Current Statistics:**
- Average retirement age: 64 years old
- Average life expectancy: 78.8 years (men), 81.2 years (women)
- 25% of people will live to age 90
- Healthcare costs in retirement: $300,000+ for a couple
- Social Security provides only 40% of pre-retirement income

## Retirement Planning Assessment

**Complete our comprehensive assessment to evaluate your retirement readiness:**

[EMBEDDED ASSESSMENT WILL APPEAR HERE]

### Assessment Categories

**1. Financial Foundation (25 points)**
- Current savings and investments
- Debt management
- Emergency fund adequacy
- Insurance coverage
- Estate planning basics

**2. Income Planning (25 points)**
- Social Security optimization
- Pension benefits
- Investment income
- Part-time work plans
- Other income sources

**3. Expense Management (20 points)**
- Retirement budget planning
- Healthcare cost planning
- Housing decisions
- Lifestyle expectations
- Inflation considerations

**4. Investment Strategy (20 points)**
- Asset allocation
- Risk management
- Tax efficiency
- Diversification
- Rebalancing strategy

**5. Healthcare Planning (10 points)**
- Medicare planning
- Long-term care planning
- Health savings accounts
- Supplemental insurance
- Wellness planning

## Conclusion

Retirement planning is a lifelong process that requires regular review and adjustment. By completing our comprehensive assessment and following the action plan, you can take control of your retirement future and work toward achieving your goals.

**Ready to evaluate your retirement readiness? Complete our assessment above to identify areas for improvement and create your personalized retirement planning action plan.**`,
    excerpt: 'Evaluate your retirement readiness with our comprehensive assessment. Identify areas for improvement and create a personalized action plan to achieve your retirement goals.',
    content_type: 'html',
    category: 'retirement-planning',
    focus_keyword: 'retirement planning assessment'
  },
  {
    title: 'Life Insurance Assessment: Evaluate Your Coverage Needs',
    slug: 'life-insurance-assessment',
    content: `# Life Insurance Assessment: Evaluate Your Coverage Needs

## Protect Your Family's Financial Future

Life insurance is a critical component of comprehensive financial planning that provides financial security for your loved ones. This assessment helps you evaluate your current life insurance coverage, identify gaps, and determine the right amount and type of coverage for your unique situation.

## Understanding Life Insurance

### What is Life Insurance?

Life insurance is a contract between you and an insurance company that provides a death benefit to your beneficiaries when you pass away. It's designed to replace your income, pay off debts, cover final expenses, and provide financial security for your family.

## Life Insurance Assessment

**Complete our comprehensive assessment to evaluate your life insurance needs:**

[EMBEDDED ASSESSMENT WILL APPEAR HERE]

### Assessment Categories

**1. Current Coverage Analysis (20 points)**
- Existing life insurance policies
- Coverage amounts and types
- Beneficiary designations
- Policy performance and costs
- Employer-provided coverage

**2. Financial Needs Assessment (30 points)**
- Income replacement needs
- Debt obligations
- Final expenses
- Education funding
- Retirement income for spouse

**3. Family Situation (20 points)**
- Number of dependents
- Ages of children
- Spouse's income and benefits
- Special needs considerations
- Family health history

## Conclusion

Life insurance is a fundamental component of financial planning that provides essential protection for your family's financial future. By completing our comprehensive assessment and understanding the different types of coverage available, you can make informed decisions about protecting your loved ones.

**Ready to evaluate your life insurance needs? Complete our assessment above to identify coverage gaps and determine the right protection for your family's financial security.**`,
    excerpt: 'Evaluate your life insurance coverage needs with our comprehensive assessment. Identify gaps, determine the right amount and type of coverage for your family\'s financial security.',
    content_type: 'html',
    category: 'insurance',
    focus_keyword: 'life insurance assessment'
  },
  {
    title: 'Aging in Place Guide: Stay Independent at Home',
    slug: 'aging-in-place-guide',
    content: `# Aging in Place Guide: Stay Independent at Home

## Create a Safe, Comfortable Home for Your Golden Years

Aging in place means staying in your own home as you grow older, maintaining your independence and quality of life. This comprehensive guide helps you plan and prepare your home for successful aging in place, covering everything from home modifications to support services and financial planning.

## What is Aging in Place?

### Definition and Benefits

**Aging in Place** is the ability to live in your own home and community safely, independently, and comfortably, regardless of age, income, or ability level. It's about maintaining your lifestyle and connections while adapting your environment to meet changing needs.

**Key Benefits:**
- **Independence**: Maintain control over your daily life
- **Comfort**: Stay in familiar surroundings
- **Community**: Keep social connections and support networks
- **Cost-Effective**: Often less expensive than assisted living
- **Flexibility**: Adapt your home to your specific needs
- **Peace of Mind**: Reduce stress and anxiety about moving

## Home Modifications for Aging in Place

### Safety Modifications

**Bathroom Safety:**
- Install grab bars in shower and near toilet
- Add non-slip flooring and bath mats
- Install walk-in shower or tub
- Add shower seat or bench
- Improve lighting and ventilation
- Install raised toilet seat
- Add handheld shower head

**Kitchen Safety:**
- Lower countertops and cabinets
- Install pull-out shelves and drawers
- Add task lighting under cabinets
- Install lever-style faucets
- Add non-slip flooring
- Improve ventilation
- Consider induction cooktop

## Conclusion

Aging in place is a viable and desirable option for many older adults, but it requires careful planning, preparation, and ongoing adaptation. By understanding your needs, making appropriate home modifications, arranging for necessary services, and maintaining your health and social connections, you can successfully age in place while maintaining your independence and quality of life.

**Ready to plan for aging in place? Use this guide to assess your needs, make necessary modifications, and create a comprehensive plan for staying independent at home.**`,
    excerpt: 'Complete guide to aging in place. Learn how to modify your home, arrange services, and maintain independence while staying in your own home as you age.',
    content_type: 'html',
    category: 'housing',
    focus_keyword: 'aging in place'
  },
  {
    title: 'Estate Planning Checklist: Protect Your Legacy',
    slug: 'estate-planning-checklist',
    content: `# Estate Planning Checklist: Protect Your Legacy

## Ensure Your Wishes Are Honored and Your Family Is Protected

Estate planning is the process of arranging for the management and disposal of your assets after your death or in the event of incapacity. This comprehensive checklist helps you create a complete estate plan that protects your family, minimizes taxes, and ensures your wishes are carried out.

## What is Estate Planning?

### Definition and Importance

**Estate Planning** is the process of creating a comprehensive plan for managing your assets during your lifetime and distributing them after your death. It involves legal documents, financial strategies, and family considerations to ensure your wishes are honored and your loved ones are protected.

## Estate Planning Checklist

### Essential Documents

**□ Will and Testament**
- Distribute assets according to your wishes
- Name executor to manage estate
- Designate guardians for minor children
- Specify funeral and burial wishes
- Update regularly as circumstances change

**□ Revocable Living Trust**
- Avoid probate for trust assets
- Provide privacy and control
- Plan for incapacity
- Reduce estate administration costs
- Allow for ongoing management

**□ Durable Power of Attorney**
- Designate someone to handle financial matters
- Take effect during incapacity
- Avoid court-appointed conservatorship
- Choose trusted family member or professional
- Specify powers and limitations

## Conclusion

Estate planning is a critical component of comprehensive financial planning that protects your family, minimizes taxes, and ensures your wishes are honored. By following this comprehensive checklist and working with qualified professionals, you can create an estate plan that provides peace of mind and protects your legacy.

**Ready to protect your legacy? Use this checklist to create a comprehensive estate plan that safeguards your family's future and honors your wishes.**`,
    excerpt: 'Complete estate planning checklist to protect your legacy. Essential documents, asset planning, tax strategies, and family considerations for comprehensive estate planning.',
    content_type: 'html',
    category: 'estate-planning',
    focus_keyword: 'estate planning checklist'
  },
  {
    title: 'Will & Trust Guide: Essential Estate Planning Documents',
    slug: 'will-trust-guide',
    content: `# Will & Trust Guide: Essential Estate Planning Documents

## Protect Your Family and Assets with Proper Legal Planning

Wills and trusts are the foundation of any comprehensive estate plan. This guide explains the differences between these essential documents, when to use each, and how to create them to protect your family and ensure your wishes are carried out.

## Understanding Wills and Trusts

### What is a Will?

A **will** (also called a last will and testament) is a legal document that specifies how you want your assets distributed after your death. It also allows you to name guardians for minor children and an executor to manage your estate.

**Key Features of a Will:**
- Takes effect only after death
- Must go through probate court
- Can be changed or revoked during lifetime
- Names beneficiaries for assets
- Designates executor and guardians
- Specifies funeral and burial wishes

### What is a Trust?

A **trust** is a legal arrangement where you transfer assets to a trustee who manages them for the benefit of beneficiaries according to your instructions. Trusts can be revocable or irrevocable and can take effect during your lifetime or after death.

**Key Features of a Trust:**
- Can take effect during lifetime or after death
- Avoids probate for trust assets
- Provides privacy and control
- Can reduce estate taxes
- Allows for ongoing management
- Can provide for incapacity

## Conclusion

Wills and trusts are essential tools for protecting your family and ensuring your wishes are carried out. While wills are simpler and suitable for many situations, trusts offer additional benefits including probate avoidance, privacy, and ongoing management capabilities.

**Ready to protect your family and assets? Use this guide to understand your options and create the estate planning documents that best meet your needs and goals.**`,
    excerpt: 'Complete guide to wills and trusts. Learn the differences, when to use each, and how to create these essential estate planning documents to protect your family and assets.',
    content_type: 'html',
    category: 'estate-planning',
    focus_keyword: 'will and trust guide'
  },
  {
    title: 'Estate Tax Guide: Minimize Taxes and Protect Your Legacy',
    slug: 'estate-tax-guide',
    content: `# Estate Tax Guide: Minimize Taxes and Protect Your Legacy

## Understand and Minimize Estate Taxes to Preserve Your Wealth

Estate taxes can significantly reduce the wealth you pass on to your heirs. This comprehensive guide explains how estate taxes work, current exemption amounts, and strategies to minimize your tax burden while protecting your family's financial future.

## Understanding Estate Taxes

### What is the Estate Tax?

The **estate tax** is a federal tax on the transfer of property at death. It's calculated on the total value of your assets minus allowable deductions and exemptions. The tax is paid by your estate before assets are distributed to your heirs.

**Key Points:**
- Federal estate tax rate: 40% on amounts above exemption
- Current exemption (2024): $13.61 million per person
- Married couples can use both exemptions: $27.22 million
- Portability allows surviving spouse to use deceased spouse's unused exemption
- State estate taxes may also apply

## Estate Tax Planning Strategies

### Basic Planning Techniques

**1. Annual Gifting**
- Give up to $18,000 per person per year
- Unlimited gifts for education and medical expenses
- Reduces estate size over time
- No gift tax on annual exclusion gifts
- Can gift to multiple people

**2. Lifetime Exemption Gifts**
- Use part of lifetime exemption during life
- Reduces estate at death
- Assets appreciate outside estate
- Can be structured as trusts
- Requires careful planning

## Conclusion

Estate tax planning is a critical component of comprehensive wealth management that can significantly impact the amount of wealth you pass on to your heirs. By understanding current tax rules, implementing appropriate strategies, and working with qualified professionals, you can minimize your estate tax burden while achieving your family and charitable goals.

**Ready to minimize your estate taxes? Use this guide to understand your options and work with qualified professionals to create a comprehensive estate tax planning strategy.**`,
    excerpt: 'Complete guide to estate tax planning. Learn current exemption amounts, tax rates, and strategies to minimize estate taxes while protecting your family\'s wealth.',
    content_type: 'html',
    category: 'estate-planning',
    focus_keyword: 'estate tax guide'
  },
  {
    title: 'Power of Attorney Guide: Protect Your Rights and Assets',
    slug: 'power-of-attorney-guide',
    content: `# Power of Attorney Guide: Protect Your Rights and Assets

## Ensure Your Affairs Are Managed When You Cannot

A power of attorney is a legal document that allows someone else to act on your behalf in financial, legal, or healthcare matters. This comprehensive guide explains the different types of powers of attorney, when to use each, and how to create them to protect your interests and ensure your wishes are carried out.

## Understanding Power of Attorney

### What is a Power of Attorney?

A **power of attorney** (POA) is a legal document that gives another person (called an "agent" or "attorney-in-fact") the authority to act on your behalf in specific situations. The person creating the POA is called the "principal."

**Key Concepts:**
- **Principal**: The person granting the authority
- **Agent/Attorney-in-Fact**: The person receiving the authority
- **Scope**: What the agent can and cannot do
- **Duration**: When the POA is effective
- **Revocation**: How to cancel the POA

## Types of Power of Attorney

### Durable vs. Non-Durable

**Durable Power of Attorney:**
- Remains effective even if you become incapacitated
- Most common type for estate planning
- Continues until revoked or death
- Essential for incapacity planning
- Recommended for most situations

**Non-Durable Power of Attorney:**
- Becomes invalid if you become incapacitated
- Used for specific, temporary situations
- Common for business transactions
- Not suitable for incapacity planning
- Limited usefulness for most people

## Conclusion

A power of attorney is an essential component of comprehensive estate planning that protects your interests and ensures your affairs can be managed if you become unable to handle them yourself. By understanding the different types of POAs, choosing appropriate agents, and creating properly executed documents, you can provide peace of mind for yourself and your family.

**Ready to protect your interests? Use this guide to understand your options and create the power of attorney documents that best meet your needs and circumstances.**`,
    excerpt: 'Complete guide to power of attorney documents. Learn the different types, when to use each, and how to create them to protect your rights and assets.',
    content_type: 'html',
    category: 'estate-planning',
    focus_keyword: 'power of attorney guide'
  },
  {
    title: 'IRA Withdrawal Guide: Maximize Your Retirement Income',
    slug: 'ira-withdrawal-guide',
    content: `# IRA Withdrawal Guide: Maximize Your Retirement Income

## Strategic Withdrawal Planning for Your IRA

Individual Retirement Accounts (IRAs) are powerful tools for retirement savings, but understanding when and how to withdraw from them is crucial for maximizing your retirement income and minimizing taxes. This comprehensive guide covers IRA withdrawal rules, strategies, and tax implications to help you make informed decisions.

## Understanding IRA Withdrawals

### Types of IRAs

**Traditional IRA:**
- Contributions may be tax-deductible
- Earnings grow tax-deferred
- Withdrawals are taxed as ordinary income
- Required minimum distributions (RMDs) apply
- Early withdrawal penalties may apply

**Roth IRA:**
- Contributions are made with after-tax dollars
- Earnings grow tax-free
- Qualified withdrawals are tax-free
- No RMDs during your lifetime
- More flexible withdrawal rules

## Traditional IRA Withdrawal Rules

### Age-Based Rules

**Before Age 59½:**
- 10% early withdrawal penalty (unless exception applies)
- Ordinary income tax on withdrawal
- Exceptions for specific circumstances
- Consider alternatives to avoid penalties

**Ages 59½ to 72:**
- No early withdrawal penalty
- Ordinary income tax on withdrawal
- Can withdraw any amount
- Consider tax implications

**Age 72 and Older:**
- Required minimum distributions (RMDs)
- Must withdraw minimum amount annually
- Ordinary income tax on withdrawal
- Penalty for not taking RMDs

## Conclusion

IRA withdrawal planning is a critical component of retirement planning that requires understanding complex rules, tax implications, and strategic considerations. By planning early, understanding your options, and working with qualified professionals, you can maximize your retirement income while minimizing taxes.

**Ready to optimize your IRA withdrawals? Use this guide to understand your options and work with qualified professionals to create a comprehensive withdrawal strategy that maximizes your retirement income.**`,
    excerpt: 'Complete guide to IRA withdrawal strategies. Learn withdrawal rules, tax implications, and planning techniques to maximize your retirement income from IRAs.',
    content_type: 'html',
    category: 'retirement-planning',
    focus_keyword: 'IRA withdrawal guide'
  },
  {
    title: 'Medicare Comparison Tool: Find the Right Plan for You',
    slug: 'medicare-comparison-tool',
    content: `# Medicare Comparison Tool: Find the Right Plan for You

## Compare Medicare Plans and Make Informed Decisions

Choosing the right Medicare plan is one of the most important healthcare decisions you'll make. This comprehensive tool helps you compare different Medicare options, understand coverage differences, and select the plan that best meets your healthcare needs and budget.

## Understanding Medicare Options

### Original Medicare (Parts A & B)

**Medicare Part A (Hospital Insurance):**
- Inpatient hospital care
- Skilled nursing facility care
- Hospice care
- Home health care
- Most people don't pay premiums

**Medicare Part B (Medical Insurance):**
- Doctor visits and outpatient care
- Preventive services
- Medical equipment and supplies
- Ambulance services
- Monthly premium required

## Medicare Comparison Tool

**Use our interactive tool below to compare Medicare plans:**

[EMBEDDED COMPARISON TOOL WILL APPEAR HERE]

### How to Use This Tool

1. **Enter Your Information**: Age, location, health status, medications
2. **Select Plan Types**: Original Medicare, Advantage, or both
3. **Compare Options**: Premiums, deductibles, copays, coverage
4. **Review Benefits**: Additional benefits, provider networks, drug coverage
5. **Make Decision**: Choose the plan that best meets your needs

## Conclusion

Choosing the right Medicare plan is a critical decision that affects your healthcare access, costs, and quality of life. By using our comparison tool, understanding your options, and getting professional help when needed, you can make informed decisions that protect your health and finances.

**Ready to find the right Medicare plan? Use our comparison tool above to explore your options and make informed decisions about your healthcare coverage.**`,
    excerpt: 'Compare Medicare plans and find the right coverage for your needs. Interactive tool to compare costs, benefits, and coverage options for Original Medicare, Medicare Advantage, and Medigap plans.',
    content_type: 'html',
    category: 'health',
    focus_keyword: 'medicare comparison tool'
  },
  {
    title: 'Beneficiary Planner Tool: Organize Your Beneficiary Designations',
    slug: 'beneficiary-planner-tool',
    content: `# Beneficiary Planner Tool: Organize Your Beneficiary Designations

## Ensure Your Assets Go to the Right People

Beneficiary designations are crucial for ensuring your assets are distributed according to your wishes. This comprehensive tool helps you organize, review, and update your beneficiary designations across all your accounts and policies to avoid confusion and ensure your loved ones receive what you intend.

## Understanding Beneficiary Designations

### What are Beneficiary Designations?

**Beneficiary designations** are instructions that specify who should receive the proceeds from your accounts, policies, and other assets when you pass away. These designations override your will and can significantly impact how your assets are distributed.

**Key Points:**
- Beneficiary designations take precedence over wills
- Must be kept current and accurate
- Different types of beneficiaries
- Can be changed at any time
- Require proper documentation

## Assets with Beneficiary Designations

### Retirement Accounts

**401(k) Plans:**
- Employer-sponsored retirement plans
- Must name beneficiaries
- Spouse consent may be required
- Can name trusts as beneficiaries
- Important for tax planning

**IRAs (Traditional and Roth):**
- Individual retirement accounts
- Must name beneficiaries
- Can name individuals or trusts
- Important for tax planning
- Can be changed anytime

## Beneficiary Planner Tool

**Use our interactive tool below to organize your beneficiary designations:**

[EMBEDDED PLANNER TOOL WILL APPEAR HERE]

### How to Use This Tool

1. **List Your Assets**: All accounts, policies, and assets with beneficiary designations
2. **Current Beneficiaries**: Who is currently named as beneficiary
3. **Review and Update**: Check for accuracy and completeness
4. **Plan Changes**: Identify needed updates and changes
5. **Document Everything**: Keep records of all designations

## Conclusion

Beneficiary planning is a critical component of comprehensive estate planning that ensures your assets are distributed according to your wishes. By using our beneficiary planner tool, understanding the importance of current designations, and working with qualified professionals, you can protect your family and ensure your legacy is preserved.

**Ready to organize your beneficiary designations? Use our planner tool above to review and update your beneficiary designations and ensure your assets go to the right people.**`,
    excerpt: 'Organize and manage your beneficiary designations across all accounts and policies. Comprehensive tool to ensure your assets are distributed according to your wishes.',
    content_type: 'html',
    category: 'estate-planning',
    focus_keyword: 'beneficiary planner tool'
  }
];

async function insertAllMissingContent() {
  try {
    console.log('Inserting all missing content...');
    
    for (const article of missingContent) {
      const articleData = {
        ...article,
        user_id: '430cd47d-1cad-4188-a8bb-6812f76fb9bc',
        author_id: 'f7d47844-6532-44f0-b723-d5fc6bf0232c',
        status: 'published',
        meta_title: article.title + ' | SeniorSimple',
        meta_description: article.excerpt,
        schema_type: 'Article',
        persona: 'retirement_planner'
      };
      
      const { data, error } = await supabase
        .from('articles')
        .insert([articleData])
        .select();
      
      if (error) {
        console.log(`Error inserting ${article.slug}:`, error);
      } else {
        console.log(`✅ Successfully inserted: ${article.slug}`);
      }
    }
    
    console.log('All content insertion completed!');
  } catch (error) {
    console.log('Error:', error);
  }
}

insertAllMissingContent();
