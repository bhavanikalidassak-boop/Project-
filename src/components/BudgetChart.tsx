import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { BudgetBreakdownItem } from "../types";

interface BudgetChartProps {
  data: BudgetBreakdownItem[];
}

export default function BudgetChart({ data }: BudgetChartProps) {
  // Format data for Recharts
  const chartData = data.map(item => ({
    name: item.category,
    Actual: item.actualAmount,
    Recommended: item.recommendedAmount
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono">
          <p className="font-sans font-bold text-slate-100 mb-1">{label}</p>
          <p className="text-rose-400">Actual: ${payload[0].value.toLocaleString()}</p>
          <p className="text-emerald-400">Recommended: ${payload[1].value.toLocaleString()}</p>
          <p className="text-slate-400 text-[10px] mt-1 font-sans">
            Difference: ${(payload[0].value - payload[1].value) > 0 ? "+" : ""}{(payload[0].value - payload[1].value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]" id="budget-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 5,
            left: -15,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Legend 
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Bar dataKey="Actual" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
          <Bar dataKey="Recommended" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
