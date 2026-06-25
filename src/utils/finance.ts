import { 
  UserFinancialProfile, 
  FinancialAnalysisResponse,
  BudgetBreakdownItem,
  OverspendingArea,
  SavingsRecommendation,
  InvestmentSuggestion,
  RiskAssessmentItem,
  ActionPlanStep
} from "../types";

/**
 * Calculates a fast, realistic Financial Health Score (0-100) locally.
 */
export function calculateLocalHealthScore(profile: UserFinancialProfile): {
  score: number;
  explanation: string;
} {
  const { income, expenses, savings, expenseBreakdown } = profile;
  
  if (income <= 0) return { score: 0, explanation: "Income must be greater than 0." };

  let score = 50; // Baseline
  
  // 1. Savings Rate Metric (Max +/- 25 points)
  const savingsRate = (income - expenses) / income;
  if (savingsRate >= 0.3) {
    score += 25;
  } else if (savingsRate >= 0.2) {
    score += 15;
  } else if (savingsRate >= 0.1) {
    score += 5;
  } else if (savingsRate >= 0) {
    score -= 5;
  } else {
    // Deficit spending
    score -= 25;
  }

  // 2. Emergency Fund coverage (Max +/- 25 points)
  const monthlyExpenses = expenses > 0 ? expenses : 1000;
  const emergencyFundMonths = savings / monthlyExpenses;
  
  if (emergencyFundMonths >= 6) {
    score += 25;
  } else if (emergencyFundMonths >= 3) {
    score += 15;
  } else if (emergencyFundMonths >= 1) {
    score += 5;
  } else {
    score -= 15;
  }

  // 3. Debt load (Max +/- 10 points)
  const debtPayment = expenseBreakdown.debt || 0;
  const debtRatio = debtPayment / income;
  if (debtRatio === 0) {
    score += 10;
  } else if (debtRatio > 0.35) {
    score -= 15;
  } else if (debtRatio > 0.15) {
    score -= 5;
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine explanation
  let explanation = "";
  if (score >= 80) {
    explanation = `Outstanding! Your Financial Health Score is ${score}/100. Your strong savings rate (${Math.round(savingsRate * 100)}%) and solid emergency cash cushion (equivalent to ${emergencyFundMonths.toFixed(1)} months of expenses) put you in an elite bracket. You are highly prepared to invest and compound your wealth.`;
  } else if (score >= 60) {
    explanation = `Good progress! Your Financial Health Score is ${score}/100. You have a positive savings rate and some financial runway. To unlock your next level, focus on automating an extra 5% of your income into savings and capping luxury spending.`;
  } else if (score >= 40) {
    explanation = `Fair. Your Financial Health Score is ${score}/100. You are living close to your financial margins. While you are getting by, a low savings rate or a shallow emergency fund makes you vulnerable to unexpected expenses. We have drafted optimization steps to secure your foundation.`;
  } else {
    explanation = `Vulnerable. Your Financial Health Score is ${score}/100. High monthly expenditures relative to income and low liquid savings leave you exposed. Prioritize debt consolidation, reducing discretionary overspending immediately, and building a starter $1,000 emergency fund.`;
  }

  return { score, explanation };
}

/**
 * Generates local 50/30/20 budget recommendation matching user categories.
 */
export function generateLocalBudgetRecommendation(profile: UserFinancialProfile): BudgetBreakdownItem[] {
  const { income, expenseBreakdown } = profile;
  
  // Categorize standard categories into Needs (50%), Wants (30%), Savings (20%)
  // Needs: Housing, Utilities, Healthcare, Debt, Transport (mostly essential)
  // Wants: Entertainment, Food (partially, but let's assume food is 60% needs, 40% wants, or keep it category-based for simplicity)
  
  // Simple rule allocation:
  // Housing: max 30%
  // Utilities: max 10%
  // Food: max 12%
  // Transport: max 10%
  // Entertainment: max 10%
  // Healthcare: actual (essential, keep as actual or adjust slightly)
  // Debt: pay down as much as possible, minimum recommendations
  // Others/Misc: max 8%

  const categories = Object.keys(expenseBreakdown) as (keyof typeof expenseBreakdown)[];
  
  const labelMap: Record<string, string> = {
    housing: "Housing & Rent",
    utilities: "Utilities & Bills",
    food: "Food & Groceries",
    transport: "Transportation",
    entertainment: "Dining & Fun",
    debt: "Debt & Loans",
    healthcare: "Medical & Health",
    others: "Miscellaneous"
  };

  const recommendationWeights: Record<string, number> = {
    housing: 0.30,
    utilities: 0.08,
    food: 0.12,
    transport: 0.08,
    entertainment: 0.08,
    debt: 0.10,
    healthcare: 0.06,
    others: 0.05
  };

  return categories.map(cat => {
    const actual = expenseBreakdown[cat] || 0;
    const weight = recommendationWeights[cat] || 0.10;
    let recommended = Math.round(income * weight);
    
    // For healthcare, keep recommended closer to actual since it's inelastic
    if (cat === 'healthcare') {
      recommended = Math.max(recommended, actual);
    }
    // For debt, if actual is high, we recommend paying it down, but target must be reasonable
    if (cat === 'debt' && actual > recommended) {
      recommended = actual; // Debt minimums must be met
    }

    const percentage = income > 0 ? (actual / income) * 100 : 0;
    
    let status: "good" | "warning" | "critical" = "good";
    let advice = "";

    const excessRatio = recommended > 0 ? actual / recommended : 1;
    if (excessRatio > 1.3) {
      status = "critical";
      advice = `Over budget by ${Math.round((excessRatio - 1) * 100)}%. Strongly recommend auditing subscriptions or shopping around for better rates.`;
    } else if (excessRatio > 1.05) {
      status = "warning";
      advice = `Slightly over budget. Keep a close eye on discretionary leakages.`;
    } else {
      status = "good";
      advice = `Excellent job! You are maintaining healthy control of your ${labelMap[cat].toLowerCase()} expense.`;
    }

    // Custom advice overrides
    if (cat === 'housing' && percentage > 35) {
      advice = "Housing costs exceed the recommended 30% rule of thumb. Consider roommates or refinancing options if possible.";
    } else if (cat === 'entertainment' && status === 'critical') {
      advice = "Dining out and recreation spending is eating into your savings. Consider adopting a weekly 'fun budget' envelope.";
    }

    return {
      category: labelMap[cat] || cat,
      actualAmount: actual,
      recommendedAmount: recommended,
      percentageOfIncome: Math.round(percentage),
      status,
      advice
    };
  });
}

/**
 * Projects year-by-year financial compound growth over time.
 */
export interface ProjectionData {
  year: number;
  contributions: number;
  totalSavings: number;
}

export function calculateProjection(
  initialSavings: number,
  monthlyContribution: number,
  annualReturnRate: number, // e.g., 7 for 7%
  years: number
): ProjectionData[] {
  const data: ProjectionData[] = [];
  const monthlyRate = (annualReturnRate / 100) / 12;
  const months = years * 12;

  let currentTotal = initialSavings;
  let currentContributions = initialSavings;

  // Year 0
  data.push({
    year: 0,
    contributions: Math.round(currentContributions),
    totalSavings: Math.round(currentTotal)
  });

  for (let m = 1; m <= months; m++) {
    currentTotal = (currentTotal + monthlyContribution) * (1 + monthlyRate);
    currentContributions += monthlyContribution;

    if (m % 12 === 0) {
      const year = m / 12;
      data.push({
        year,
        contributions: Math.round(currentContributions),
        totalSavings: Math.round(currentTotal)
      });
    }
  }

  return data;
}

/**
 * Dynamic fallback generator when Gemini API is unconfigured or fails
 */
export function generateLocalFallbackAdvisorResponse(profile: UserFinancialProfile): FinancialAnalysisResponse {
  const { score, explanation } = calculateLocalHealthScore(profile);
  const budgetBreakdown = generateLocalBudgetRecommendation(profile);
  
  // Find critical items
  const overspendingAreas: OverspendingArea[] = [];
  budgetBreakdown.forEach(item => {
    if (item.status === 'critical' || (item.status === 'warning' && item.actualAmount > 150)) {
      let practicalAlternative = "Find competitive quotes or downscale to standard alternatives.";
      if (item.category.includes("Dining") || item.category.includes("Food")) {
        practicalAlternative = "Commit to meal-prep Sundays and limit commercial food delivery to twice monthly.";
      } else if (item.category.includes("Housing")) {
        practicalAlternative = "Explore refinancing options, room sub-letting, or utilities consolidation.";
      } else if (item.category.includes("Entertainment")) {
        practicalAlternative = "Host backyard games nights or switch to free community-organized social activities.";
      } else if (item.category.includes("Transport")) {
        practicalAlternative = "Optimize travel routes, ride-share, or use public transport twice a week.";
      }

      const excess = Math.max(50, item.actualAmount - item.recommendedAmount);

      overspendingAreas.push({
        category: item.category,
        severity: item.status === 'critical' ? 'high' : 'medium',
        potentialSavings: Math.round(excess),
        practicalAlternative
      });
    }
  });

  // If empty, add a default advice card
  if (overspendingAreas.length === 0) {
    overspendingAreas.push({
      category: "Miscellaneous",
      severity: "low",
      potentialSavings: 50,
      practicalAlternative: "Audit streaming services and cancel at least two inactive subscription models."
    });
  }

  // 1. Savings recommendations
  const netSurplus = profile.income - profile.expenses;
  const emergencyFundCoverage = profile.expenses > 0 ? profile.savings / profile.expenses : 12;
  const savingsRecommendations: SavingsRecommendation[] = [];

  if (emergencyFundCoverage < 3) {
    savingsRecommendations.push({
      title: "Establish a Starter Emergency Fund",
      description: "Amass a highly liquid reserve covering at least 3 months of basic living costs. Park this exclusively in a high-yield savings vehicle.",
      monthlyTarget: Math.round(profile.income * 0.15),
      expectedImpact: `Quickly builds a safety runway of ${Math.round(profile.income * 0.45)} within three months.`
    });
  }

  savingsRecommendations.push({
    title: "Enforce 'Pay Yourself First' Automation",
    description: "Program a direct deposit to route 15% of your paycheck directly into high-yield deposits on the exact day your salary is released.",
    monthlyTarget: Math.round(profile.income * 0.15),
    expectedImpact: "Eradicates the impulse to spend surplus income and standardizes savings velocity."
  });

  savingsRecommendations.push({
    title: "Deconstruct Subscription Liabilities",
    description: "Utilize card trackers to find and cancel recurring charges for memberships, SaaS products, and apps not accessed in the last 45 days.",
    monthlyTarget: 45,
    expectedImpact: "Reclaims $540 of immediate annual cash flow to direct into your primary goal."
  });

  // 2. Investment allocation based on Risk tolerance
  const investmentSuggestions: InvestmentSuggestion[] = [];
  if (profile.riskTolerance === "Conservative") {
    investmentSuggestions.push(
      { assetClass: "High-Yield Savings Accounts (HYSA)", suggestedAllocationPercentage: 50, expectedReturnRange: "4.5% - 5.1% APY", whyItFits: "Unmatched safety and liquid flexibility, ideal for short-term goal preservation." },
      { assetClass: "Treasury Bills & Certificates of Deposit (CDs)", suggestedAllocationPercentage: 35, expectedReturnRange: "4.8% - 5.2% APY", whyItFits: "Locks in premium yields with absolute federal backing." },
      { assetClass: "Short-Term Bond ETFs", suggestedAllocationPercentage: 15, expectedReturnRange: "3.5% - 4.5% Annual", whyItFits: "Gives stable, low-volatility interest distributions." }
    );
  } else if (profile.riskTolerance === "Aggressive") {
    investmentSuggestions.push(
      { assetClass: "Broad S&P 500 Index Funds (VOO / SPY)", suggestedAllocationPercentage: 60, expectedReturnRange: "8.0% - 10.5% Average", whyItFits: "Excellent long-term compounding mechanism tracking America's largest businesses." },
      { assetClass: "International Developed Markets Equity", suggestedAllocationPercentage: 25, expectedReturnRange: "6.0% - 8.0% Average", whyItFits: "Geopolitical diversification to protect against localized domestic downturns." },
      { assetClass: "High-Yield Savings (Liquid Cash Anchor)", suggestedAllocationPercentage: 15, expectedReturnRange: "4.5% APY", whyItFits: "Maintains necessary dry powder to exploit equity market discount opportunities." }
    );
  } else {
    // Moderate
    investmentSuggestions.push(
      { assetClass: "S&P 500 Index & Total Stock Market ETFs", suggestedAllocationPercentage: 50, expectedReturnRange: "8.0% - 10.0% Average", whyItFits: "Reliable wealth builder with solid compounding performance." },
      { assetClass: "High-Yield Savings Accounts (HYSA)", suggestedAllocationPercentage: 30, expectedReturnRange: "4.5% - 5.0% APY", whyItFits: "Safely hedges volatility while keeping capital completely accessible." },
      { assetClass: "High-Grade Corporate & Treasury Bonds", suggestedAllocationPercentage: 20, expectedReturnRange: "4.2% - 5.0% APY", whyItFits: "Smoothes portfolio fluctuations and locks in stable yields." }
    );
  }

  // 3. Risk Assessment
  const riskAssessment: RiskAssessmentItem[] = [];
  const efRating = emergencyFundCoverage >= 6 ? "safe" : emergencyFundCoverage >= 3 ? "moderate" : "high";
  const efText = emergencyFundCoverage >= 6 
    ? "Your savings cover over 6 months of expenses, safeguarding you from sudden job loss." 
    : emergencyFundCoverage >= 3 
      ? "Your savings cover 3-5 months of expenses. Healthy, but vulnerable to dual emergencies." 
      : `Critical safety gap. Liquid savings cover only ${emergencyFundCoverage.toFixed(1)} months of costs. An unexpected medical or car expense will force you into credit card debt.`;

  riskAssessment.push({
    riskType: "Emergency Fund Adequacy",
    rating: efRating,
    details: efText
  });

  const spendingRatio = profile.expenses / profile.income;
  const spendRating = spendingRatio <= 0.7 ? "safe" : spendingRatio <= 0.9 ? "moderate" : "high";
  riskAssessment.push({
    riskType: "Fixed Cost Overhead Ratio",
    rating: spendRating,
    details: spendingRatio > 0.9 
      ? `Extremely dangerous. You spend ${Math.round(spendingRatio * 100)}% of your income. Any decline in earnings instantly results in a structural deficit.`
      : spendingRatio > 0.7
        ? `Moderate burden. Expenses consume ${Math.round(spendingRatio * 100)}% of earnings. Your savings potential is constrained.`
        : `Healthy allocation. You consume only ${Math.round(spendingRatio * 100)}% of net income, leaving ample space for savings.`
  });

  // 4. Action plan
  const threeStepActionPlan: ActionPlanStep[] = [
    {
      step: 1,
      title: "Establish and Fund an Automated Cash Sweep",
      description: "Open a specialized High-Yield Savings Account (HYSA) separate from your checking account. Instruct your bank to automatically route $100-$300 (or your surplus equivalent) on payday.",
      timeline: "Next 48 Hours"
    },
    {
      step: 2,
      title: "Deploy a Sub-Category Audit of Your Top Overspent Area",
      description: `Audit the past 60 days of spending in your high category: "${overspendingAreas[0]?.category || 'Dining & Fun'}". Identify recurring subscriptions or regular transactions to replace with your alternative.`,
      timeline: "This Weekend"
    },
    {
      step: 3,
      title: "Initiate Your Investment Vehicle",
      description: `Open a low-cost brokerage account or tax-advantaged account and set up a recurring $50 monthly purchase into the suggested diversified ETF option.`,
      timeline: "Within 14 Days"
    }
  ];

  return {
    healthScore: score,
    healthScoreExplanation: explanation,
    budgetBreakdown,
    overspendingAreas,
    savingsRecommendations,
    investmentSuggestions,
    riskAssessment,
    threeStepActionPlan
  };
}
