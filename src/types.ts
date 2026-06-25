export interface ExpenseBreakdown {
  housing: number;
  utilities: number;
  food: number;
  transport: number;
  entertainment: number;
  debt: number;
  healthcare: number;
  others: number;
}

export type RiskTolerance = "Conservative" | "Moderate" | "Aggressive";

export interface UserFinancialProfile {
  income: number;
  expenses: number;
  savings: number;
  goal: string;
  goalCustomText?: string;
  riskTolerance: RiskTolerance;
  expenseBreakdown: ExpenseBreakdown;
}

export interface BudgetBreakdownItem {
  category: string;
  actualAmount: number;
  recommendedAmount: number;
  percentageOfIncome: number;
  status: "good" | "warning" | "critical";
  advice: string;
}

export interface OverspendingArea {
  category: string;
  severity: "high" | "medium" | "low";
  potentialSavings: number;
  practicalAlternative: string;
}

export interface SavingsRecommendation {
  title: string;
  description: string;
  monthlyTarget: number;
  expectedImpact: string;
}

export interface InvestmentSuggestion {
  assetClass: string;
  suggestedAllocationPercentage: number;
  expectedReturnRange: string;
  whyItFits: string;
}

export interface RiskAssessmentItem {
  riskType: string;
  rating: "safe" | "moderate" | "high";
  details: string;
}

export interface ActionPlanStep {
  step: number;
  title: string;
  description: string;
  timeline: string;
}

export interface FinancialAnalysisResponse {
  healthScore: number;
  healthScoreExplanation: string;
  budgetBreakdown: BudgetBreakdownItem[];
  overspendingAreas: OverspendingArea[];
  savingsRecommendations: SavingsRecommendation[];
  investmentSuggestions: InvestmentSuggestion[];
  riskAssessment: RiskAssessmentItem[];
  threeStepActionPlan: ActionPlanStep[];
}
