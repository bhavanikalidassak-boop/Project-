import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserFinancialProfile, 
  FinancialAnalysisResponse,
  RiskTolerance 
} from "./types";
import { 
  generateLocalFallbackAdvisorResponse, 
  calculateLocalHealthScore 
} from "./utils/finance";
import AdvisorForm from "./components/AdvisorForm";
import BudgetChart from "./components/BudgetChart";
import ProjectionChart from "./components/ProjectionChart";
import AssetPieChart from "./components/AssetPieChart";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Shield, 
  HelpCircle, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  Award,
  Wallet,
  Activity,
  User,
  ExternalLink,
  RotateCcw,
  BookOpen
} from "lucide-react";

export default function App() {
  const [profile, setProfile] = useState<UserFinancialProfile | null>(null);
  const [analysis, setAnalysis] = useState<FinancialAnalysisResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Checklist tracker for the 3-Step Action Plan
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Reset checklist when a new analysis is loaded
  useEffect(() => {
    if (analysis) {
      setCompletedSteps({});
    }
  }, [analysis]);

  const handleFormSubmit = async (newProfile: UserFinancialProfile) => {
    setProfile(newProfile);
    setAiError(null);
    
    // 1. Instantly calculate local model data so the user sees results immediately
    const localData = generateLocalFallbackAdvisorResponse(newProfile);
    setAnalysis(localData);

    // 2. Fetch deeper AI recommendation parameters asynchronously
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProfile),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const aiData = await response.json();
      setAnalysis(aiData); // Upgrade to rich AI data
    } catch (err: any) {
      console.warn("Gemini API direct advice unavailable. Defaulting to local advisor model.", err);
      setAiError(err.message || "Could not retrieve live AI advice.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleReset = () => {
    setProfile(null);
    setAnalysis(null);
    setCompletedSteps({});
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const actionProgressCount = Object.values(completedSteps).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleReset}>
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white p-2.5 rounded-xl shadow-md shadow-indigo-500/10">
              <Coins className="w-5 h-5" id="app-logo-icon" />
            </div>
            <div>
              <span className="font-display font-bold text-slate-900 tracking-tight text-lg">
                Personal Finance Advisor
              </span>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium px-1.5 py-0.5 rounded-md ml-2 font-mono uppercase tracking-wide">
                v2.5 Pro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-800 text-xs font-semibold py-2 px-3.5 rounded-xl transition duration-150 shadow-2xs hover:shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start Over
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full">
              <span className={`w-2 h-2 rounded-full ${isAiLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
              {isAiLoading ? "AI Strategy Engine Active" : "Local Engine Ready"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <AnimatePresence mode="wait">
          {!profile ? (
            /* WELCOME / SETUP SCREEN */
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Marketing Banner */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full py-1 px-3.5 text-xs font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  AI-Optimized Wealth Strategy Planner
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
                  Master Your Money, <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
                    Smarter and Faster.
                  </span>
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Enter your monthly earnings, liquid savings, and financial goals. Get a comprehensive budget audit, risk mapping, and direct wealth-building actions powered by real finance-specialist logic.
                </p>
              </div>

              {/* Interactive Setup Form */}
              <AdvisorForm onSubmit={handleFormSubmit} isLoading={isAiLoading} />
            </motion.div>
          ) : (
            /* DASHBOARD SCREEN */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
              id="dashboard-layout"
            >
              {/* Back to details link */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Revise Financial Numbers
                </button>
                
                {/* Active profile parameters badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] bg-slate-200/60 text-slate-700 font-mono font-medium px-2.5 py-1 rounded-md">
                    Income: ${profile.income.toLocaleString()}/mo
                  </span>
                  <span className="text-[10px] bg-slate-200/60 text-slate-700 font-mono font-medium px-2.5 py-1 rounded-md">
                    Savings: ${profile.savings.toLocaleString()}
                  </span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-medium px-2.5 py-1 rounded-md">
                    Goal: {profile.goal}
                  </span>
                  <span className="text-[10px] bg-slate-200/60 text-slate-700 font-mono font-medium px-2.5 py-1 rounded-md">
                    Risk: {profile.riskTolerance}
                  </span>
                </div>
              </div>

              {/* Async AI Loading/Error Banners */}
              {isAiLoading && (
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                      <Sparkles className="w-4 h-4 text-indigo-300 absolute top-2 left-2 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs">AI Financial Playbook is Generating</h4>
                      <p className="text-indigo-200 text-[10px] mt-0.5">
                        Analyzing spending categories against the 50/30/20 benchmark and drafting practical lifestyle alternative rules...
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-950/60 px-3 py-1 rounded-full text-indigo-300 border border-indigo-800">
                    Fetching Certified Strategy
                  </span>
                </div>
              )}

              {aiError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-950">AI Strategy Server Offline</h4>
                    <p className="text-[11px] leading-relaxed mt-0.5">
                      Could not reach live Gemini services ({aiError}). Our local CFP certified mathematical model is fully active below with premium budget recommendations, overspending analytics, and projections.
                    </p>
                  </div>
                </div>
              )}

              {analysis && (
                <div className="space-y-8">
                  {/* OVERVIEW SCORECARD HERO */}
                  <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative flex flex-col lg:flex-row items-center gap-8 justify-between">
                      {/* Metric Dial */}
                      <div className="flex items-center gap-6 shrink-0">
                        {/* Radial Indicator SVG */}
                        <div className="relative w-32 h-32 shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="54"
                              stroke="#1e293b"
                              strokeWidth="10"
                              fill="transparent"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="54"
                              stroke={
                                analysis.healthScore >= 80 ? "#10b981" : 
                                analysis.healthScore >= 60 ? "#f59e0b" : "#f43f5e"
                              }
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={339.2}
                              strokeDashoffset={339.2 - (339.2 * analysis.healthScore) / 100}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-display font-extrabold tracking-tight">
                              {analysis.healthScore}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                              Health Score
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase font-mono font-bold tracking-widest text-indigo-400">
                              Current Profile Summary
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              analysis.healthScore >= 80 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                              analysis.healthScore >= 60 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                              "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {analysis.healthScore >= 80 ? "Premium Grade" : 
                               analysis.healthScore >= 60 ? "Balanced Care" : "High Advisory"}
                            </span>
                          </div>
                          
                          <h2 className="text-xl md:text-2xl font-display font-bold mt-1">
                            Financial Health Score Explanation
                          </h2>
                          <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed mt-2">
                            {analysis.healthScoreExplanation}
                          </p>
                        </div>
                      </div>

                      {/* Action Plan completion banner */}
                      <div className="w-full lg:w-72 bg-slate-800/80 border border-slate-700 p-4 rounded-2xl shrink-0 font-sans">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="font-semibold text-slate-300">Action Plan Completion</span>
                          <span className="font-mono text-indigo-400 font-bold">{actionProgressCount}/3 Steps</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                          <div 
                            className="bg-indigo-500 h-full transition-all duration-300" 
                            style={{ width: `${(actionProgressCount / 3) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Tick off your tailored steps at the bottom of the page to boost your score trajectory!
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* BENTO GRID ANALYSIS RESULTS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* CARD 1: BUDGET OPTIMIZATION & 50/30/20 ANALYSIS */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col" id="budget-analysis-card">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 font-mono">Benchmark Audit</span>
                        <h3 className="text-md font-display font-bold text-slate-900 mt-0.5">
                          Expense Breakdown vs Recommendations
                        </h3>
                        <p className="text-xs text-slate-500">
                          Comparing your current average bills against a customized 50/30/20 allocation rule of thumb.
                        </p>
                      </div>

                      {/* Bar chart comparison */}
                      <BudgetChart data={analysis.budgetBreakdown} />

                      {/* Item lists with advisory text */}
                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
                        {analysis.budgetBreakdown.map((b, idx) => (
                          <div 
                            key={idx} 
                            className="p-3 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-display font-semibold text-slate-800">{b.category}</span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                                  b.status === 'good' ? 'bg-emerald-50 text-emerald-700' : 
                                  b.status === 'warning' ? 'bg-amber-50 text-amber-700' : 
                                  'bg-rose-50 text-rose-700'
                                }`}>
                                  {b.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 italic max-w-sm">
                                {b.advice}
                              </p>
                            </div>

                            <div className="font-mono text-right shrink-0">
                              <div className="text-slate-800 font-bold">Actual: ${b.actualAmount.toLocaleString()}</div>
                              <div className="text-slate-400 text-[10px]">Target: ${b.recommendedAmount.toLocaleString()} ({b.percentageOfIncome}%)</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CARD 2: RISK OVERVIEW & LEAKAGES */}
                    <div className="space-y-8 flex flex-col" id="risk-overspending-card">
                      {/* SUB-CARD A: RISK ASSESSMENT AND SECURITY BUFFER */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex-1">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-rose-600 font-mono">Risk Assessment</span>
                          <h3 className="text-md font-display font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            Financial Security Risks & Vulnerabilities
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {analysis.riskAssessment.map((r, idx) => (
                            <div 
                              key={idx} 
                              className="p-3 border border-slate-100 rounded-2xl flex items-start gap-3 text-xs"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                                r.rating === 'high' ? 'bg-rose-500 animate-pulse' : 
                                r.rating === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <div>
                                <div className="font-display font-bold text-slate-800 flex items-center gap-1.5">
                                  {r.riskType}
                                  <span className={`text-[8px] uppercase font-bold px-1.5 rounded-sm ${
                                    r.rating === 'high' ? 'bg-rose-50 text-rose-700' : 
                                    r.rating === 'moderate' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {r.rating} Risk
                                  </span>
                                </div>
                                <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">
                                  {r.details}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SUB-CARD B: DETECTED OVERSPENDING & SUBSTITUTES */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 font-mono">Leakage Audit</span>
                          <h3 className="text-md font-display font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Primary Areas of Overspending & Substitutes
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {analysis.overspendingAreas.map((o, idx) => (
                            <div 
                              key={idx} 
                              className="p-3 bg-rose-50/20 border border-rose-100/40 rounded-2xl text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="font-display font-bold text-slate-800 flex items-center gap-1.5">
                                  {o.category}
                                  <span className="text-[8px] bg-rose-100 text-rose-700 font-bold uppercase px-1 rounded-sm">
                                    {o.severity} severity
                                  </span>
                                </div>
                                <div className="text-slate-600 text-[11px] leading-relaxed">
                                  <strong className="text-indigo-900 font-medium">Alternative:</strong> {o.practicalAlternative}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-rose-600 font-mono font-bold">-${o.potentialSavings}/mo</div>
                                <div className="text-[9px] text-slate-400 font-medium font-sans">Potential Savings</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE PROJECTION CALCULATOR COMPONENT */}
                  <section>
                    <ProjectionChart 
                      initialSavings={profile.savings}
                      initialMonthlyContribution={profile.income - profile.expenses}
                      defaultAnnualReturn={
                        profile.riskTolerance === "Aggressive" ? 10 :
                        profile.riskTolerance === "Conservative" ? 4.5 : 7
                      }
                    />
                  </section>

                  {/* PORTFOLIO ALLOCATION RECOMMENDATIONS */}
                  <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 font-mono">Monthly Asset Builder</span>
                      <h3 className="text-xl font-display font-bold text-slate-900 mt-0.5">
                        Recommended Investment Portfolio Allocation
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Where to route your monthly cash surplus based on your <strong className="text-indigo-600">{profile.riskTolerance}</strong> risk profile and specific milestone target: <strong>"{profile.goal}"</strong>.
                      </p>
                    </div>

                    <AssetPieChart suggestions={analysis.investmentSuggestions} />
                  </section>

                  {/* CORE ACTION PLAN SECTORS WITH CHECKLISTS */}
                  <section className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="border-b border-slate-800 pb-4 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-md font-mono uppercase tracking-wide">
                          Action Required
                        </span>
                        <span className="text-xs text-slate-400">CFP 3-Step Strategy Protocol</span>
                      </div>
                      <h3 className="text-2xl font-display font-extrabold mt-2">
                        Your Custom 3-Step Wealth Action Plan
                      </h3>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                        Complete these exact steps sequentially over the next month to secure your financial foundation and launch compound wealth acceleration.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {analysis.threeStepActionPlan.map((p) => {
                        const isDone = !!completedSteps[p.step];
                        return (
                          <div 
                            key={p.step}
                            onClick={() => toggleStep(p.step)}
                            className={`p-5 rounded-2xl border transition duration-200 cursor-pointer text-left flex flex-col h-full group select-none relative ${
                              isDone 
                                ? "bg-slate-800/40 border-indigo-500/50 text-slate-300" 
                                : "bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-white hover:border-slate-600"
                            }`}
                          >
                            {/* Checkbox circle indicator */}
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <span className={`font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md ${
                                isDone 
                                  ? "bg-slate-800/80 text-slate-500 border border-slate-700/50" 
                                  : "bg-indigo-600 text-indigo-100"
                              }`}>
                                Step {p.step}
                              </span>

                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isDone 
                                  ? "bg-indigo-600 border-indigo-500 text-white" 
                                  : "border-slate-500 group-hover:border-slate-400"
                              }`}>
                                {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                              </div>
                            </div>

                            <h4 className={`font-display font-bold text-sm ${isDone ? "line-through text-slate-500" : "text-white"}`}>
                              {p.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed mt-2 flex-1">
                              {p.description}
                            </p>

                            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                              <span>Target Timeline</span>
                              <span className={`font-semibold font-mono ${isDone ? "text-slate-500" : "text-indigo-400"}`}>
                                {p.timeline}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
