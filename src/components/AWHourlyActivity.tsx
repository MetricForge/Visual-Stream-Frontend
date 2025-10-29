// AWHourlyActivity.tsx
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { categorizeActivity } from '../utils/appCategories';

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
    fill: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    return (
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '8px 12px',
        }}
      >
        <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.fill, fontSize: '12px', margin: '2px 0' }}>
            {entry.name}: {entry.value} min
          </p>
        ))}
        <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #374151' }}>
          Total: {total} min
        </p>
      </div>
    );
  }
  return null;
};

export default function AWHourlyActivity({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Filter focused data
  const focusedData = data.filter(d => d.duration > 0);
  
  // Count unique days in the dataset
  const uniqueDays = new Set(
    focusedData.map(item => 
      item.timestamp.toISOString().split('T')[0]
    )
  ).size;
  
  // Calculate hourly totals split by productive/leisure
  const hourlyData: Record<number, { productive: number; leisure: number }> = {};
  
  focusedData.forEach(item => {
    const hour = item.timestamp.getHours();
    const activityType = categorizeActivity(item.appName);
    
    if (!hourlyData[hour]) {
      hourlyData[hour] = { productive: 0, leisure: 0 };
    }
    
    if (activityType === 'productive') {
      hourlyData[hour].productive += item.duration;
    } else {
      hourlyData[hour].leisure += item.duration;
    }
  });
  
  // Convert to chart data with averages
  const chartData = Object.entries(hourlyData)
    .map(([hour, data]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      hourNum: parseInt(hour),
      productive: Math.round((data.productive / 60) / uniqueDays), // Average per day
      leisure: Math.round((data.leisure / 60) / uniqueDays), // Average per day
      total: Math.round(((data.productive + data.leisure) / 60) / uniqueDays)
    }))
    .sort((a, b) => a.hourNum - b.hourNum);
  
    if (!chartData || chartData.length === 0) {
      return (
        <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-purple-600/30">
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Hourly Activity</h2>
          </div>
          <p className="text-gray-400 text-center py-8">No data available for hourly breakdown</p>
        </div>
      );
    }

    // Then update peakHour calculation:
    const peakHour = chartData.length > 0 
      ? chartData.reduce((max, item) => item.total > max.total ? item : max, chartData[0])
      : null;
  
  // Calculate peak productive percentage
  const peakProductivePercent = peakHour 
    ? Math.round((peakHour.productive / (peakHour.productive + peakHour.leisure)) * 100)
    : 0;

  // Format hour for display (12-hour format)
  const formatHour = (hour: string) => {
    const hourNum = parseInt(hour.split(':')[0]);
    if (hourNum === 0) return '12:00 AM';
    if (hourNum === 12) return '12:00 PM';
    if (hourNum > 12) return `${hourNum - 12}:00 PM`;
    return `${hourNum}:00 AM`;
  };

  return (
<div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-orange-600/30">
        <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white">Hourly Activity</h3>
    </div>
    
    {/* Tooltip Badge */}
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-orange-300 text-xs font-semibold bg-orange-900/30 px-2 py-1 rounded border border-orange-700/30 hover:bg-orange-900/50 transition-colors cursor-pointer"
      >
        BY HOUR
      </button>
      
      {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
          <div className="text-xs text-gray-300 space-y-2">
            <p className="font-semibold text-white mb-1">Hourly Breakdown</p>
            <p>
              Shows productive vs leisure time for each hour of the day. Bars are stacked and show average daily activity.
            </p>
            <div className="flex gap-3 text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-700">
            <span className="italic"><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Productive</span>
            <span className="italic"><span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1"></span>Leisure</span>
            </div>
          </div>
          <div className="absolute -top-2 right-4 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
        </div>
      )}
    </div>
  </div>



      {/* Stacked Bar Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="hour" 
              stroke="#9ca3af" 
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="productive" 
              stackId="time"
              fill="#059669" 
              radius={[0, 0, 0, 0]}
              name="Productive"
            />
            <Bar 
              dataKey="leisure" 
              stackId="time"
              fill="#6366f1" 
              radius={[4, 4, 0, 0]}
              name="Leisure"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

           {/* Bottom Summary */}
      {peakHour && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-400">
           💡 Peak activity at{' '}
            <span className="text-white font-semibold">
              {formatHour(peakHour.hour)}
            </span>
            {' '}with{' '}
            <span className="text-blue-400 font-semibold">{peakHour.total} min/day</span>
            {' '}({peakProductivePercent}% productive)
          </div>
        </div>
      )}
    </div>
  );
}
