import React, { useState } from "react";
import { UserFinancialProfile, RiskTolerance, ExpenseBreakdown } from "../types";
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  Shield, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  UserPlus,
  Compass
} from "lucide-react";

interface AdvisorFormProps {
  onSubmit: (profile: UserFinancialProfile) => void;
  isLoading: boolean;
}

const DEMO_PROFILES = [
  {
    name: "Alex - Young Professional with Debt",
    income: 4200,
    savings: 1500,
    goal: "Pay Off High-Interest Debt",
    riskTolerance: "Moderate" as RiskTolerance,
    expenseBreakdown: {
      housing: 1500,
      utilities: 280,
      food: 650,
      transport: 350,
      entertainment: 550,
      debt: 600,
      healthcare: 120,
      others: 200
    }
  },
  {
    name: "Sarah - Balanced Mid-Career Saver",
    income: 7500,
    savings: 24000,
    goal: "Buy a Home",
    riskTolerance: "Aggressive" as RiskTolerance,
    expenseBreakdown: {
      housing: 2200,
      utilities: 350,
      food: 800,
      transport: 450,
      entertainment: 600,
      debt: 250,
      healthcare: 200,
      others: 350
    }
  },
  {
    name: "Marcus - High Earner, High Spends",
    income: 12500,
    savings: 8000,
    goal: "Retirement & Wealth Building",
    riskTolerance: "Aggressive" as RiskTolerance,
    expenseBreakdown: {
      housing: 4500,
      utilities: 600,
      food: 1500,
      transport: 900,
      entertainment: 1800,
      debt: 1200,
      healthcare: 400,
      others: 800
    }
  }
];

export default function AdvisorForm({ onSubmit, isLoading }: AdvisorFormProps) {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState<number>(5000);
  const [savings, setSavings] = useState<number>(5000);
  const [goal, setGoal] = useState<string>("Build an Emergency Fund");
  const [goalCustomText, setGoalCustomText] = useState<string>("");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("Moderate");
  
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown>({
    housing: 1500,
    utilities: 300,
    food: 600,
    transport: 400,
    entertainment: 400,
    debt: 300,
    healthcare: 150,
    others: 200
  });

  const handleExpenseChange = (category: keyof ExpenseBreakdown, value: number) => {
    setExpenseBreakdown(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const totalExpenses = (Object.values(expenseBreakdown) as number[]).reduce((sum, val) => sum + val, 0);
  const surplus = income - totalExpenses;
  const savingsRate = income > 0 ? (surplus / income) * 100 : 0;

  const loadProfile = (profile: typeof DEMO_PROFILES[0]) => {
    setIncome(profile.income);
    setSavings(profile.savings);
    setGoal(profile.goal);
    setGoalCustomText("");
    setRiskTolerance(profile.riskTolerance);
    setExpenseBreakdown(profile.expenseBreakdown);
    setStep(1); // Reset to step 1 so they can view details or submit
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGoal = goal === "Other" && goalCustomText 
      ? goalCustomText 
      : goal;
      
    onSubmit({
      income,
      expenses: totalExpenses,
      savings,
      goal: finalGoal,
      goalCustomText: goalCustomText || undefined,
      riskTolerance,
      expenseBreakdown
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto" id="advisor-form-container">
      {/* Quick Demo Loader */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-5 h-5 text-indigo-600" />
          <h3 className="font-display font-semibold text-slate-800 text-sm">
            Want a fast test? Choose a pre-configured scenario:
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_PROFILES.map((prof, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadProfile(prof)}
              className="text-left bg-white border border-slate-200 hover:border-indigo-400 p-3 rounded-xl transition duration-200 shadow-xs hover:shadow-md cursor-pointer group"
            >
              <div className="font-medium text-slate-800 text-xs group-hover:text-indigo-700 transition">
                {prof.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Income: ${prof.income.toLocaleString()} | Savings: ${prof.savings.toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Form Header Progress */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-8 py-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">AI Finance Advisor</span>
              <h2 className="text-2xl font-display font-bold mt-1">Configure Your Profile</h2>
            </div>
            <div className="bg-indigo-900/50 border border-indigo-700/50 rounded-full px-3 py-1 text-xs text-indigo-200 font-mono">
              Step {step} of 3
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-300" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* STEP 1: INCOME AND LIQUID ASSETS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in" id="form-step-1">
              <div>
                <h3 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Net Income & Existing Savings
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  We calculate everything relative to your disposable income after direct taxes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Income Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Net Monthly Income ($)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-mono text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      required
                      min={100}
                      value={income || ""}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="block w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                      placeholder="e.g. 4500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Your reliable monthly take-home salary or net recurring cash inflow.
                  </span>
                </div>

                {/* Savings Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Total Liquid Savings ($)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-mono text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      required
                      min={0}
                      value={savings || ""}
                      onChange={(e) => setSavings(Number(e.target.value))}
                      className="block w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                      placeholder="e.g. 12000"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Cash in high-yield savings, checking, or emergency reserves.
                  </span>
                </div>
              </div>

              {/* Instant Health Check Indicator */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 mt-4">
                <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-indigo-950 text-xs">Why this matters:</h4>
                  <p className="text-indigo-900/80 text-[11px] leading-relaxed mt-1">
                    Your current savings relative to expenses indicates your <strong>Emergency Runway</strong>. Financial planners recommend 3 to 6 months of living expenses parked in liquid cash before starting aggressive long-term investments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORIZED MONTHLY EXPENSES */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in" id="form-step-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-rose-500" />
                    Categorized Monthly Spending
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Adjust the sliders below to match your average monthly expenditure.
                  </p>
                </div>
                
                {/* Instant budget overview ticker */}
                <div className="text-right">
                  <div className="text-xs text-slate-500">Total Spent</div>
                  <div className={`text-lg font-mono font-bold ${surplus >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                    ${totalExpenses.toLocaleString()} / ${income.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-medium">
                    {surplus >= 0 ? (
                      <span className="text-emerald-600">Surplus: +${surplus.toLocaleString()} ({savingsRate.toFixed(0)}%)</span>
                    ) : (
                      <span className="text-rose-600">Deficit: -${Math.abs(surplus).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Housing */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Rent or Mortgage</span>
                    <span className="font-mono text-slate-900">${expenseBreakdown.housing}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(4000, income * 0.8)}
                    step="50"
                    value={expenseBreakdown.housing}
                    onChange={(e) => handleExpenseChange("housing", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Utilities */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Utilities & Smart Bills</span>
                    <span className="font-mono text-slate-900">${expenseBreakdown.utilities}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="20"
                    value={expenseBreakdown.utilities}
                    onChange={(e) => handleExpenseChange("utilities", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Food & Groceries */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Food & Groceries</span>
                    <span className="font-mono text-slate-900">${expenseBreakdown.food}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="20"
                    value={expenseBreakdown.food}
                    onChange={(e) => handleExpenseChange("food", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Transport */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Transportation & Fuel</span>
                    <span className="font-mono text-slate-900">${expenseBreakdown.transport}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1500"
                    step="20"
                    value={expenseBreakdown.transport}
                    onChange={(e) => handleExpenseChange("transport", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Entertainment & Dining */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Dining & Fun / Subscriptions</span>
                    <span className="font-mono text-slate-900">${expenseBreakdown.entertainment}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2500"
                    step="25"
                    value={expenseBreakdown.entertainment}
                    onChange={(e) => handleExpenseChange("entertainment", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Debt Payments */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Debt Repayments / Loans</span>
                    <span className="font-mono text-slate-900">${expenseBreakdown.debt}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="50"
                    value={expenseBreakdown.debt}
                    onChange={(e) => handleExpenseChange("debt", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Healthcare */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Healthcare & Insurance</span>
                    <span className="font-mono text-slate-900">${expenseBreakdown.healthcare}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1500"
                    step="10"
                    value={expenseBreakdown.healthcare}
                    onChange={(e) => handleExpenseChange("healthcare", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Others */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Miscellaneous / Others</span>
                    <span className="font-mono text-slate-900">${expenseBreakdown.others}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="25"
                    value={expenseBreakdown.others}
                    onChange={(e) => handleExpenseChange("others", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Visual warnings or guidelines */}
              {surplus < 0 && (
                <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-4 text-xs">
                  ⚠️ <strong>Deficit detected!</strong> Your expenses (${totalExpenses.toLocaleString()}) exceed your monthly income (${income.toLocaleString()}) by <strong>${Math.abs(surplus).toLocaleString()}</strong>. Your local and AI report will focus heavily on reducing high-leakage spending.
                </div>
              )}
            </div>
          )}

          {/* STEP 3: FINANCIAL GOAL & RISK APPETITE */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in" id="form-step-3">
              <div>
                <h3 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  Primary Financial Goal & Risk Profile
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  What is your primary milestone, and how comfortable are you with stock market fluctuations?
                </p>
              </div>

              <div className="space-y-4">
                {/* Goal Selector Grid */}
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Select Target Goal
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Build an Emergency Fund",
                    "Pay Off High-Interest Debt",
                    "Buy a Home",
                    "Retirement",
                    "Wealth Building / Investing",
                    "Other"
                  ].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={`py-3 px-4 rounded-xl border text-left transition text-xs font-medium cursor-pointer ${
                        goal === g
                          ? "bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* Custom Goal Text Input */}
                {goal === "Other" && (
                  <div className="space-y-2 pt-2 animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-600">
                      Describe your custom financial goal:
                    </label>
                    <input
                      type="text"
                      required
                      value={goalCustomText}
                      onChange={(e) => setGoalCustomText(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                      placeholder="e.g. Save $10,000 for a Europe trip in 12 months"
                    />
                  </div>
                )}
              </div>

              {/* Risk Tolerance Profile */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  Investment Risk Profile
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      level: "Conservative" as RiskTolerance,
                      desc: "Prioritize principal preservation. Comfortable with 3-5% returns in low-volatility HYSA, bonds, and deposits.",
                      color: "text-emerald-600 border-emerald-100 hover:border-emerald-300 bg-emerald-50/20"
                    },
                    {
                      level: "Moderate" as RiskTolerance,
                      desc: "Balanced strategy. Accept slight stock volatility for historical 6-8% annual returns. Index funds + fixed income.",
                      color: "text-indigo-600 border-indigo-100 hover:border-indigo-300 bg-indigo-50/20"
                    },
                    {
                      level: "Aggressive" as RiskTolerance,
                      desc: "Maximize long-term compounding. Comfortable with steep market drawdowns for target 9-11% stock market index growth.",
                      color: "text-purple-600 border-purple-100 hover:border-purple-300 bg-purple-50/20"
                    }
                  ].map((p) => (
                    <button
                      key={p.level}
                      type="button"
                      onClick={() => setRiskTolerance(p.level)}
                      className={`text-left p-4 rounded-xl border transition cursor-pointer ${
                        riskTolerance === p.level
                          ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/25"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-semibold text-xs block text-slate-800">{p.level}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block leading-normal">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions footer */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium text-xs py-2 px-4 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                className="flex items-center gap-2 bg-slate-900 text-white font-medium text-xs py-2.5 px-6 rounded-xl hover:bg-slate-800 transition duration-200 cursor-pointer"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-3 px-6 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-indigo-200" />
                    Generate Strategy Report
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
