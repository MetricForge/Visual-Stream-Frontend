// components/AWSessionLengthDistr.tsx
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
    fill: string;
  }>;
  label?: string;
}

const mergeConsecutiveSessions = (data: AWData[]): AWData[] => {
  if (data.length === 0) return [];
  
  const sorted = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const merged: AWData[] = [];
  
  let currentSession = { ...sorted[0] };
  
  for (let i = 1; i < sorted.length; i++) {
    const entry = sorted[i];
    
    // If same app, merge duration
    if (entry.appName === currentSession.appName) {
      currentSession.duration += entry.duration;
    } else {
      // Different app, save current and start new
      merged.push(currentSession);
      currentSession = { ...entry };
    }
  }
  
  merged.push(currentSession);
  
  return merged;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const total = payload
      .filter(entry => entry.value > 0)
      .reduce((sum, entry) => sum + entry.value, 0);

    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '8px 12px' }}>
        <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{label}</p>
        {payload
          .filter(entry => entry.value > 0)  // ← Only show non-zero
          .map((entry, index) => (
            <p key={index} style={{ color: entry.fill, fontSize: '12px', margin: '2px 0' }}>
              {entry.name}: {entry.value.toLocaleString()} sessions/day
            </p>
          ))}
        <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #374151' }}>
          Total: {total.toLocaleString()} sessions/day
        </p>
      </div>
    );
  }
  return null;
};

export default function AWSessionLengthDistr({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [excludeShortSessions, setExcludeShortSessions] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const mergedData = useMemo(() => mergeConsecutiveSessions(data), [data]);
  const validData = excludeShortSessions 
    ? mergedData.filter(d => d.duration >= 3)
    : mergedData.filter(d => d.duration > 0);

  const bucketDuration = (seconds: number): string => {
    if (seconds < 10) return '0-10s';
    if (seconds < 30) return '10-30s';
    if (seconds < 60) return '30-60s';
    if (seconds < 180) return '1-3min';
    if (seconds < 300) return '3-5min';
    if (seconds < 600) return '5-10min';
    if (seconds < 1800) return '10-30min';
    return '30min+';
  };

  const bucketOrder = ['0-10s', '10-30s', '30-60s', '1-3min', '3-5min', '5-10min', '10-30min', '30min+'];
  
  const distribution: Record<string, Record<string, number>> = {};
  
  // helper function to determine the color based on duration
    const getDurationColor = (seconds: number) => {
      if (seconds < 3) return 'text-red-400'; // Noise (misclicks, alt-tab, accidental)
      if (seconds < 10) return 'text-yellow-400'; // Very short (rapid switching)
      if (seconds < 30) return 'text-green-400'; // Short
      if (seconds < 180) return 'text-blue-400'; // Medium (30s-3min)
      return 'text-purple-400'; // Long (3min+)
    };

    bucketOrder.forEach(bucket => {
      distribution[bucket] = {};
      CATEGORY_ORDER.forEach(category => {
        distribution[bucket][category] = 0;
      });
    });


    validData.forEach(item => {
      const bucket = bucketDuration(item.duration);
      const category = categorizeApp(item.appName);
      distribution[bucket][category]++;
    });

      const uniqueDays = new Set(
        validData.map(d => d.timestamp.toISOString().split('T')[0])
      ).size;

    // show average per day
    const chartData = bucketOrder.map(bucket => {
      const normalizedBucket: Record<string, any> = { name: bucket };
      CATEGORY_ORDER.forEach(category => {
        normalizedBucket[category] = uniqueDays > 0 
          ? Math.round(distribution[bucket][category] / uniqueDays)
          : distribution[bucket][category];
      });
      return normalizedBucket;
    });


  const totalSessions = validData.length;
  const avgSessionsPerDay = uniqueDays > 0 ? Math.round(totalSessions / uniqueDays) : 0;
  const avgDuration = totalSessions > 0 
    ? validData.reduce((sum, d) => sum + d.duration, 0) / totalSessions 
    : 0;
  const medianDuration = [...validData].sort((a, b) => a.duration - b.duration)[Math.floor(totalSessions / 2)]?.duration || 0;



  // Handle legend click
const handleLegendClick = (category: string) => {
  // If clicking the already selected category, deselect it (show all)
  if (selectedCategory === category) {
    setSelectedCategory(null);
  } else {
    // Otherwise, select only this category
    setSelectedCategory(category);
  }
};

  // Custom Legend with click functionality
const CustomLegend = ({ payload }: any) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
      {payload.map((entry: any, index: number) => {
        const isSelected = selectedCategory === entry.value;
        const isActive = !selectedCategory || isSelected; // Show if no filter OR if this is selected
        
        return (
          <div
            key={`legend-${index}`}
            onClick={() => handleLegendClick(entry.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              opacity: isActive ? 1 : 0.3,
              transition: 'all 0.2s',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(55, 65, 81, 0.3)',
              border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
              transform: isSelected ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: isActive ? entry.color : 'transparent',
                border: !isActive ? `2px solid ${entry.color}` : 'none',
                opacity: isActive ? 1 : 0.5
              }}
            />
            <span 
              style={{ 
                fontSize: '12px', 
                color: !isActive ? '#6b7280' : (isSelected ? '#60a5fa' : '#d1d5db'),
                fontWeight: isSelected ? 600 : 400,
                textDecoration: !isActive ? 'line-through' : 'none'
              }}
            >
              {entry.value}
            </span>
          </div>
        );
      })}
      
      {/* Clear Filter Button - only show when filtering */}
      {selectedCategory && (
        <div
          onClick={() => setSelectedCategory(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '2px solid #ef4444',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 600 }}>
            Show All
          </span>
        </div>
      )}
    </div>
  );
};

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-600/30">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Session Length Distribution</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setExcludeShortSessions(!excludeShortSessions)}
            className={`text-xs font-semibold px-3 py-1.5 rounded border transition-all ${
              excludeShortSessions
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            {excludeShortSessions ? '≥3s Only' : 'All Sessions'}
          </button>

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
              <>
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                  <div className="text-xs text-gray-300 space-y-2">
                    <p className="font-semibold text-white mb-1">Session Length Breakdown</p>
        
                    <p>
                      Shows how long you stay in each app before switching, broken down by category. Reveals focus quality and context switching patterns.
                    </p>

                    <div className="space-y-1 pt-2">
                      <p><strong className="text-red-400">Noise (0-3s):</strong> Misclicks, alt-tab cycles, accidental switches</p>
                      <p><strong className="text-yellow-400">Very short (3-10s):</strong> Rapid app switching, fragmented attention</p>
                      <p><strong className="text-green-400">Short (10-30s):</strong> Quick tasks, normal multi-tasking</p>
                      <p><strong className="text-blue-400">Medium (30s-3min):</strong> Normal task switching, decent engagement</p>
                      <p><strong className="text-purple-400">Long (3min+):</strong> Deep focus, sustained work periods</p>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-700 italic">
                      Click legend items to show/hide categories. Use the "≥3s Only" toggle to filter out noise.
                    </p>
                  </div>

                  <div className="absolute -top-2 right-4 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        How long you stay focused before switching {excludeShortSessions && '(excluding <3s sessions)'}
      </p>

      {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Avg Sessions/Day</p>
            <p className="text-xl font-bold text-blue-400">{avgSessionsPerDay.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Avg Length</p>
            <p className={`text-xl font-bold ${getDurationColor(avgDuration)}`}>
              {avgDuration.toFixed(1)}s
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Median Length</p>
            <p className={`text-xl font-bold ${getDurationColor(medianDuration)}`}>
              {medianDuration.toFixed(1)}s
            </p>
          </div>
        </div>


      {/* Chart with Transparent Background */}
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer>
          <BarChart 
            data={chartData} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />}
            cursor={{ fill: 'transparent' }} />
            <Legend content={<CustomLegend />} />
            {/* Render bars conditionally based on hiddenCategories */}
            {CATEGORY_ORDER.map((category) => {
              const shouldShow = !selectedCategory || selectedCategory === category;
              return shouldShow ? (
                <Bar 
                  key={category}
                  dataKey={category} 
                  stackId="a" 
                  fill={COLORS[category as keyof typeof COLORS]} 
                />
              ) : null;
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight */}
<div className="mt-4 bg-blue-900/20 border border-blue-800 rounded-lg p-3">
    <p className="text-xs text-blue-300">
      💡 {totalSessions > 0 
        ? (() => {
            const under10s = distribution['0-10s'] || {};
            const total = Object.values(under10s).reduce((sum, val) => sum + (Number(val) || 0), 0);
            const percentage = (total / totalSessions) * 100;
            return isNaN(percentage) ? '0' : percentage.toFixed(0);
          })()
        : '0'}% of sessions are under 10 seconds, indicating frequent rapid context switches.
    </p>
</div>

    </div>
  );
}
