import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { calculateProjection, ProjectionData } from "../utils/finance";
import { Info, HelpCircle } from "lucide-react";

interface ProjectionChartProps {
  initialSavings: number;
  initialMonthlyContribution: number;
  defaultAnnualReturn: number; // e.g. 5, 7, 10
}

export default function ProjectionChart({ 
  initialSavings, 
  initialMonthlyContribution,
  defaultAnnualReturn 
}: ProjectionChartProps) {
  const [monthlyContribution, setMonthlyContribution] = useState<number>(
    Math.max(0, initialMonthlyContribution)
  );
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(defaultAnnualReturn);
  const [years, setYears] = useState<number>(15);
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);

  // Keep state in sync if initial values update from parents
  useEffect(() => {
    setMonthlyContribution(Math.max(0, initialMonthlyContribution));
  }, [initialMonthlyContribution]);

  useEffect(() => {
    setAnnualReturnRate(defaultAnnualReturn);
  }, [defaultAnnualReturn]);

  useEffect(() => {
    const data = calculateProjection(initialSavings, monthlyContribution, annualReturnRate, years);
    setProjectionData(data);
  }, [initialSavings, monthlyContribution, annualReturnRate, years]);

  const finalValue = projectionData[projectionData.length - 1]?.totalSavings || 0;
  const totalContributions = projectionData[projectionData.length - 1]?.contributions || 0;
  const totalInterest = Math.max(0, finalValue - totalContributions);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono">
          <p className="font-sans font-bold text-slate-100 mb-1">Year {payload[0].payload.year}</p>
          <p className="text-indigo-300">Total Portfolio: ${payload[1].value.toLocaleString()}</p>
          <p className="text-slate-400">Your Deposits: ${payload[0].value.toLocaleString()}</p>
          <p className="text-emerald-400">Interest Earned: ${(payload[1].value - payload[0].value).toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6" id="projection-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
        <div>
          <h3 className="text-md font-display font-bold text-slate-900">
            Compound Growth Calculator
          </h3>
          <p className="text-xs text-slate-500">
            See how your monthly investment allocations grow over time through compound interest.
          </p>
        </div>
        
        {/* Highlight stats */}
        <div className="flex gap-4 font-mono">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Contributions</div>
            <div className="text-sm font-semibold text-slate-800">${totalContributions.toLocaleString()}</div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Interest Accrued</div>
            <div className="text-sm font-semibold text-emerald-600">+${totalInterest.toLocaleString()}</div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Future Balance</div>
            <div className="text-base font-bold text-indigo-600">${finalValue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Controls Panel */}
        <div className="space-y-5 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
            Adjust Growth Drivers
          </h4>

          {/* Monthly contribution slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Monthly Allocation</span>
              <span className="font-mono text-slate-900 font-bold">${monthlyContribution.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(5000, initialMonthlyContribution * 5)}
              step="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[9px] text-slate-400 block leading-normal">
              Based on your monthly surplus. Up this to accelerate your targets.
            </span>
          </div>

          {/* Interest Rate APY Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Expected Return (APY)</span>
              <span className="font-mono text-indigo-600 font-bold">{annualReturnRate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[9px] text-slate-400 block leading-normal">
              Bonds yield ~4%, HYSAs 4-5%, S&P 500 historically averages 8-10%.
            </span>
          </div>

          {/* Projection Duration Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Horizon Duration</span>
              <span className="font-mono text-slate-900 font-bold">{years} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-[10px] text-indigo-950 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              At <strong className="font-mono">{annualReturnRate}% APY</strong>, compound interest will account for <strong>{finalValue > 0 ? Math.round((totalInterest / finalValue) * 100) : 0}%</strong> of your total future net worth.
            </div>
          </div>
        </div>

        {/* Compound Line/Area Chart */}
        <div className="lg:col-span-2 h-[260px] md:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projectionData}
              margin={{
                top: 5,
                right: 5,
                left: -15,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="year" 
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tickFormatter={(val) => `Yr ${val}`}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tickFormatter={(val) => val >= 1000000 ? `$${(val/1000000).toFixed(1)}M` : val >= 1000 ? `$${val/1000}k` : `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="line" />
              <Area 
                type="monotone" 
                name="Total Portfolio Value"
                dataKey="totalSavings" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSavings)" 
              />
              <Line 
                type="monotone" 
                name="Accumulated Deposits"
                dataKey="contributions" 
                stroke="#94a3b8" 
                strokeWidth={1.5} 
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
