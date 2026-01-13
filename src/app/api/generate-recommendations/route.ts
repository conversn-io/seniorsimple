import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { quizAnswers, tier, percentile, firstName } = await request.json();

    // DeepSeek API endpoint
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Build context from quiz answers
    const context = buildContextFromAnswers(quizAnswers, tier, percentile, firstName);

    // Call DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a retirement income planning specialist writing personalized recommendations for retirees. 
            Your tone should be warm, empathetic, and direct. Avoid jargon. Write as if speaking to a friend who needs clear, actionable advice.
            Focus on their specific situation revealed in the quiz answers. Be specific about their concerns and how the Retirement Income Blueprint addresses them.
            Keep recommendations to 3-4 paragraphs maximum.`
          },
          {
            role: 'user',
            content: `Based on this quiz data, write personalized recommendations for ${firstName || 'this retiree'}:

${context}

Write recommendations that:
1. Reflect their specific answers back to them
2. Address their unique concerns based on their responses
3. Connect their situation to why the Retirement Income Blueprint is the right solution
4. Use a warm, empathetic tone
5. Keep it to 3-4 paragraphs

Do not use markdown formatting. Write in plain text with natural paragraph breaks.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const recommendations = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildContextFromAnswers(answers: any, tier: string, percentile: number, firstName: string): string {
  const context: string[] = [];
  
  context.push(`Quiz Results Summary:`);
  context.push(`- Score Tier: ${tier} (${percentile}th percentile)`);
  context.push(`- Name: ${firstName || 'Not provided'}`);
  
  if (answers.retirementSavings) {
    context.push(`- Retirement Savings: ${answers.retirementSavings === 'Yes' ? 'Has $500K+' : 'Less than $500K'}`);
  }
  
  if (answers.takingIncome) {
    context.push(`- Currently Taking Income: ${answers.takingIncome}`);
  }
  
  if (answers.confidenceLevel) {
    context.push(`- Confidence Level: ${answers.confidenceLevel}`);
  }
  
  if (answers.inflationPlanning) {
    context.push(`- Inflation Planning: ${answers.inflationPlanning}`);
  }
  
  if (answers.rmdUnderstanding) {
    context.push(`- RMD Understanding: ${answers.rmdUnderstanding}`);
  }
  
  if (answers.marketDropPlan) {
    context.push(`- Market Drop Plan: ${answers.marketDropPlan}`);
  }
  
  if (answers.guaranteedIncomeFeeling) {
    context.push(`- Response to Guaranteed Income: ${answers.guaranteedIncomeFeeling}`);
  }
  
  if (answers.taxReductionAction) {
    context.push(`- Willingness to Take Action: ${answers.taxReductionAction}`);
  }
  
  if (answers.futureSelfVision) {
    context.push(`- Vision for Future Self: ${answers.futureSelfVision}`);
  }
  
  return context.join('\n');
}


