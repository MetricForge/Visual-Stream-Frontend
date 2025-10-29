// AWTopAppsBar.tsx
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { categorizeApp, COLORS } from '../utils/appCategories';


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
    payload: {
      name: string;
      value: number;
      percentage: number;
    };
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


export default function AWTopAppsBar({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Filter focused data
  const focusedData = data.filter(d => d.duration > 0);
  
// Calculate top apps with daily average
const appTotals: Record<string, number> = {};
const uniqueDays = new Set<string>();

focusedData.forEach(item => {
  const dateKey = item.timestamp.toISOString().split('T')[0];
  uniqueDays.add(dateKey);
  appTotals[item.appName] = (appTotals[item.appName] || 0) + item.duration;
});

const totalDays = uniqueDays.size || 1; // Prevent division by zero

// Sort and get top 6 with daily averages
const topApps = Object.entries(appTotals)
  .map(([name, total]) => ({ 
    name, 
    total: Math.round((total / totalDays) * 10) / 10 // Average per day, rounded to 1 decimal
  }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 6);

  
  // Format data for chart with category
  const totalTime = topApps.reduce((sum, app) => sum + app.total, 0);
  const chartData = topApps.map(app => {
    const category = categorizeApp(app.name);
    return {
      name: app.name,
      value: Math.round(app.total / 60),
      percentage: Math.round((app.total / totalTime) * 100),
      category: category
    };
  });

  return (
<div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-green-600/30">
        <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white">Daily Top Apps</h3>
    </div>
    
    {/* Tooltip Badge */}
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-green-300 text-xs font-semibold bg-green-900/30 px-2 py-1 rounded border border-green-700/30 hover:bg-green-900/50 transition-colors cursor-pointer"
      >
        BY USAGE
      </button>
      
      {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
          <div className="text-xs text-gray-300 space-y-2">
            <p className="font-semibold text-white mb-1">Most Used Apps</p>
            <p>
              Top 5 applications by average daily time. Hover over bars for detailed percentages.
            </p>
            <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-700 italic">
              Only apps with active usage are included.
            </p>
          </div>
          <div className="absolute -top-2 right-4 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
        </div>
      )}
    </div>
  </div>



    {/* Bar Chart - Horizontal */}
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number"
            stroke="#9ca3af" 
            fontSize={12}
            label={{ value: 'Minutes', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            stroke="#9ca3af" 
            fontSize={11}
            width={130}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.category]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>


    {/* Bottom Summary */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="text-xs text-gray-400">
            💡 Most used:{' '}
            <span className="text-white font-semibold">{chartData[0]?.name || 'N/A'}</span>
            {' '}averaging{' '}
            <span className="text-blue-400 font-semibold">{formatTime(chartData[0]?.value || 0)}/day</span>
            {' '}({chartData[0]?.percentage || 0}% of total time)
            </div>
        </div>
    </div>
  );
}
