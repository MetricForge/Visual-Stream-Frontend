// AWCategoryDonut.tsx
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { categorizeApp, CATEGORY_ORDER, COLORS } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number; percentage: number };
  }>;
}

const formatTime = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${Math.round(minutes)}m`;
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '10px' }}>
        <p style={{ color: '#fff', margin: 0, fontWeight: 'bold' }}>{data.name}</p>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>
          {formatTime(data.value)} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function AWCategoryDonut({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Filter and categorize
  const categoryTotals: Record<string, number> = {};
    const uniqueDays = new Set<string>();

    data.forEach(entry => {
      const dateKey = entry.timestamp.toISOString().split('T')[0];
      uniqueDays.add(dateKey);
  
      const category = categorizeApp(entry.appName);
      categoryTotals[category] = (categoryTotals[category] || 0) + entry.duration;
    });

    const totalDays = uniqueDays.size || 1;

    // Convert to daily averages
    Object.keys(categoryTotals).forEach(category => {
      categoryTotals[category] = Math.round((categoryTotals[category] / totalDays) * 10) / 10;
    });

  
  // Calculate total minutes
  const totalSeconds = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  const totalMinutes = totalSeconds / 60;
  
  const chartData = CATEGORY_ORDER
    .map(category => {
      const seconds = categoryTotals[category] || 0;
      const minutes = Math.round(seconds / 60);
      return {
        name: category,
        value: minutes,
        percentage: totalMinutes > 0 
          ? Math.round((minutes / totalMinutes) * 100) 
          : 0
      };
    })
    .filter(item => item.value > 0); // Only show categories with data

return (
  <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-purple-600/30">
          <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Time by Category</h3>
      </div>
      
      {/* Tooltip Badge */}
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-purple-300 text-xs font-semibold bg-purple-900/30 px-2 py-1 rounded border border-purple-700/30 hover:bg-purple-900/50 transition-colors cursor-pointer"
        >
          BREAKDOWN
        </button>
        
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
            <div className="text-xs text-gray-300 space-y-2">
              <p className="font-semibold text-white mb-1">Time by Category</p>
              <p>Shows your average daily time distributed across different application categories.</p>
              <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-700 italic">
                Categories are automatically assigned based on application names.
              </p>
            </div>
            <div className="absolute -top-2 right-4 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
          </div>
        )}
      </div>
    </div>

    {/* Chart + Legend Side by Side */}
<div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
  {/* Spacer to push legend right (only on large screens) */}
  <div className="flex-1 hidden lg:block"></div>
  
  {/* Donut Chart */}
  <div className="flex-shrink-0" style={{ width: '250px', height: '200px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* Legend on Right - Vertical */}
  <div className="flex flex-col gap-2 lg:min-w-[180px]">
    {chartData.map((item) => (
      <div key={item.name} className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded flex-shrink-0"
          style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}
        />
        <span className="text-gray-300 text-sm min-w-[100px]">{item.name}</span>
        <span className="text-gray-400 text-xs">{formatTime(item.value)}</span>
        <span className="text-gray-500 text-xs ml-1">{item.percentage}%</span>
      </div>
    ))}
  </div>
</div>


{/* Bottom Insight */}
<div className="mt-4 pt-4 border-t border-gray-700/50">
  <div className="text-xs text-gray-400 space-y-1">
    {(() => {
      if (chartData.length === 0) return <p><strong>Insight:</strong> No category data available.</p>;
      
      // Sort by percentage to get top and bottom
      const sorted = [...chartData].sort((a, b) => b.percentage - a.percentage);
      const top1 = sorted[0];
      const top2 = sorted[1];
      const least = sorted[sorted.length - 1];
      
      return (
        <>
          <p>
            <strong>Primary Activities:</strong>{' '}
            <span className="text-white font-semibold">{top1.name}</span> leads with{' '}
            <span className="text-blue-400 font-semibold">{formatTime(top1.value)}/day</span>{' '}
            ({top1.percentage}%)
            {top2 && (
              <>
                , followed by{' '}
                <span className="text-white font-semibold">{top2.name}</span> at{' '}
                <span className="text-blue-400 font-semibold">{formatTime(top2.value)}/day</span>{' '}
                ({top2.percentage}%).
              </>
            )}
          </p>
          {least && least !== top1 && (
            <p>
              <strong>Least Used:</strong>{' '}
              <span className="text-white font-semibold">{least.name}</span> accounts for only{' '}
              <span className="text-blue-400 font-semibold">{formatTime(least.value)}/day</span>{' '}
              ({least.percentage}% of time).
            </p>
          )}
        </>
      );
    })()}
  </div>
</div>


  </div>
);
}
