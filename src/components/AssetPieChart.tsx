import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { InvestmentSuggestion } from "../types";

interface AssetPieChartProps {
  suggestions: InvestmentSuggestion[];
}

const COLORS = ["#6366f1", "#10b981", "#8b5cf6", "#f59e0b", "#3b82f6", "#ec4899"];

export default function AssetPieChart({ suggestions }: AssetPieChartProps) {
  const chartData = suggestions.map(s => ({
    name: s.assetClass,
    value: s.suggestedAllocationPercentage
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg border border-slate-700 text-xs font-mono">
          <p className="font-sans font-bold text-slate-100">{payload[0].name}</p>
          <p className="text-indigo-300 mt-0.5">Allocation: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6" id="asset-pie-chart">
      {/* Pie Donut Canvas */}
      <div className="w-48 h-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Structured Key Details */}
      <div className="flex-1 space-y-3 w-full">
        {suggestions.map((s, idx) => {
          const color = COLORS[idx % COLORS.length];
          return (
            <div 
              key={idx} 
              className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition duration-150"
            >
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: color }} 
                />
                <span className="font-display font-semibold text-xs text-slate-800 flex-1">
                  {s.assetClass}
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs shrink-0">
                  {s.suggestedAllocationPercentage}%
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 pl-5">
                <span className="font-semibold text-slate-700">Yield: {s.expectedReturnRange}</span> — {s.whyItFits}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
