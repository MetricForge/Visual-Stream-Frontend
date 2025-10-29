// components/AWContextSwitchAnalysis.tsx
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { categorizeApp, CATEGORY_ORDER, COLORS, type AppCategory } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

interface SwitchApp {
  appName: string;
  switchCount: number;
  avgGap: number;
  minGap: number;
  maxGap: number;
  totalTimeInApp: number;
}

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${mins}m ${secs}s`;
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '10px 14px' }}>
        <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
          {data.appName}
        </p>
        <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.6' }}>
          <p><strong style={{ color: '#60a5fa' }}>Switches:</strong> {data.switchCount}x</p>
          <p><strong style={{ color: '#f59e0b' }}>Avg Gap:</strong> {formatTime(data.avgGap)}</p>
          <p><strong style={{ color: '#10b981' }}>Min:</strong> {formatTime(data.minGap)} • <strong style={{ color: '#ef4444' }}>Max:</strong> {formatTime(data.maxGap)}</p>
          <p><strong style={{ color: '#8b5cf6' }}>Time Spent:</strong> {Math.round(data.totalTimeInApp / 60)}min</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AWContextSwitchAnalysis({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [fromCategory, setFromCategory] = useState<AppCategory>('Development');
  const [toCategory, setToCategory] = useState<AppCategory>('Operations');
  const [displayCount, setDisplayCount] = useState<'top5' | 'top10' | 'bottom5' | 'bottom10' | 'all'>('top5');

  const availableToCategories = CATEGORY_ORDER.filter(cat => cat !== fromCategory) as AppCategory[];


  const switchData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const appStats = new Map<string, { gaps: number[], switchCount: number, totalTime: number }>();
    
    for (let i = 0; i < sortedData.length - 1; i++) {
      const current = sortedData[i];
      const next = sortedData[i + 1];
      
      const currentCat = categorizeApp(current.appName);
      const nextCat = categorizeApp(next.appName);
      
      if (currentCat === fromCategory && nextCat === toCategory) {
        const gap = (next.timestamp.getTime() - current.timestamp.getTime()) / 1000 - current.duration;
        
        if (!appStats.has(next.appName)) {
          appStats.set(next.appName, { gaps: [], switchCount: 0, totalTime: 0 });
        }
        
        const stats = appStats.get(next.appName)!;
        stats.gaps.push(Math.max(0, gap));
        stats.switchCount++;
        stats.totalTime += next.duration;
      }
    }
    
    const results: SwitchApp[] = [];
    
    appStats.forEach((stats, appName) => {
      if (stats.gaps.length > 0) {
        const avgGap = stats.gaps.reduce((sum, g) => sum + g, 0) / stats.gaps.length;
        const minGap = Math.min(...stats.gaps);
        const maxGap = Math.max(...stats.gaps);
        
        results.push({
          appName,
          switchCount: stats.switchCount,
          avgGap,
          minGap,
          maxGap,
          totalTimeInApp: stats.totalTime
        });
      }
    });
    
    const allResults = results.sort((a, b) => b.switchCount - a.switchCount);
    
    switch (displayCount) {
      case 'top5':
        return allResults.slice(0, 5);
      case 'top10':
        return allResults.slice(0, 10);
      case 'bottom5':
        return allResults.slice(-5).reverse();
      case 'bottom10':
        return allResults.slice(-10).reverse();
      case 'all':
        return allResults;
      default:
        return allResults.slice(0, 10);
    }
  }, [data, fromCategory, toCategory, displayCount]);

  const totalSwitches = switchData.reduce((sum, d) => sum + d.switchCount, 0);
  const avgGapOverall = switchData.length > 0
    ? switchData.reduce((sum, d) => sum + d.avgGap * d.switchCount, 0) / totalSwitches
    : 0;

  const absoluteMinGap = switchData.length > 0 
    ? Math.min(...switchData.map(d => d.minGap))
    : 0;
  const absoluteMaxGap = switchData.length > 0 
    ? Math.max(...switchData.map(d => d.maxGap))
    : 0;

  const getGapLevel = (avgGap: number) => {
    if (avgGap < 5) return { level: 'Quick', color: '#10b981' };
    if (avgGap < 15) return { level: 'Moderate', color: '#f59e0b' };
    return { level: 'Extended', color: '#f97316' };
  };

  const generateInsight = () => {
    if (totalSwitches === 0) return null;
    
    const fromCat = fromCategory.toLowerCase();
    const toCat = toCategory.toLowerCase();
    const avgGap = avgGapOverall;
    
    if (toCategory === 'Entertainment' || toCategory === 'Other') {
      if (avgGap > 60) {
        return `Extended ${formatTime(avgGap)} gap to ${toCat} suggests intentional breaks or context switching between work sessions.`;
      } else if (avgGap > 15) {
        return `Moderate ${formatTime(avgGap)} gap to ${toCat} indicates deliberate transitions to non-work activities.`;
      } else {
        return `Quick ${formatTime(avgGap)} transitions to ${toCat} may indicate impulsive context switching patterns. Batching breaks could improve focus.`;
      }
    }
    
    if (toCategory === 'Communication') {
      if (avgGap < 5) {
        return `⚡ ${formatTime(avgGap)} average gap indicates rapid notification assessment. This pattern prevents larger interruptions by addressing time-sensitive items immediately.`;
      } else if (avgGap < 15) {
        return `${formatTime(avgGap)} gap to ${toCat} suggests prompt awareness of notifications with efficient importance evaluation.`;
      } else if (avgGap < 60) {
        return `Moderate ${formatTime(avgGap)} delay to ${toCat}. Some messages may benefit from quicker attention to prevent escalation.`;
      } else {
        return `Extended ${formatTime(avgGap)} gap to ${toCat}. Time-sensitive communications may be delayed. Notification settings optimization could reduce response lag.`;
      }
    }
    
    if (toCategory === 'Tools' || toCategory === 'Browser' || toCategory === 'Development' || toCategory === 'Testing & QA' || toCategory === 'Operations') {
      if (avgGap < 5) {
        return `${formatTime(avgGap)} gap indicates seamless workflow integration between ${fromCat} and ${toCat}. Well-optimized tool transitions.`;
      } else if (avgGap < 15) {
        return `${formatTime(avgGap)} gap between ${fromCat} and ${toCat} falls within normal context switching ranges.`;
      } else if (avgGap < 60) {
        return `${formatTime(avgGap)} gap suggests cognitive switching overhead. Tool placement optimization or keyboard shortcuts may reduce friction.`;
      } else {
        return `${formatTime(avgGap)} gap indicates significant switching friction. Workflow streamlining opportunities exist for this transition pattern.`;
      }
    }
    
    return `${totalSwitches} switches observed from ${fromCat} to ${toCat} with ${formatTime(avgGap)} average gap.`;
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-600/30">
            <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Context Switch Analysis</h2>
        </div>

        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-orange-300 text-xs font-semibold bg-orange-900/30 px-2 py-1 rounded border border-orange-700/30 hover:bg-orange-900/50 transition-colors cursor-pointer"
          >
            WORKFLOW
          </button>
          
          {showTooltip && (
            <>
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-1">Context Switch Pattern Analysis</p>
                  
                  <p>
                    Tracks transitions between any two app categories. Shows which apps you switch to and the time gap between switching.
                  </p>

                  <div className="space-y-1 pt-2">
                    <p><strong className="text-green-400">Quick (&lt;5s):</strong> Immediate, likely urgent or pre-planned</p>
                    <p><strong className="text-yellow-400">Moderate (5-15s):</strong> Brief pause, could be batched</p>
                    <p><strong className="text-orange-400">Extended (&gt;15s):</strong> Significant context switch</p>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-700 italic">
                    Use this to analyze any workflow transition and optimize when you switch contexts.
                  </p>
                </div>

                <div className="absolute -top-2 right-4 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <p className="text-sm text-gray-400">Switches from</p>
        
       <select 
          value={fromCategory} 
          onChange={(e) => {
            const newFrom = e.target.value as AppCategory;
            setFromCategory(newFrom);
            if (newFrom === toCategory) {
              const firstAvailable = CATEGORY_ORDER.find(cat => cat !== newFrom) as AppCategory;
              setToCategory(firstAvailable);
            }
          }}
          className="text-sm font-semibold px-3 py-1.5 rounded border bg-gray-800 border-gray-700 text-white cursor-pointer hover:bg-gray-700 transition-colors"
          style={{ color: COLORS[fromCategory] }}
        >
          {CATEGORY_ORDER.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>


        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>

        <select
          value={toCategory}
          onChange={(e) => setToCategory(e.target.value as AppCategory)}
          className="text-sm font-semibold px-3 py-1.5 rounded border bg-gray-800 border-gray-700 text-white cursor-pointer hover:bg-gray-700 transition-colors"
          style={{ color: COLORS[toCategory] }}
        >
          {availableToCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <p className="text-sm text-gray-400">Show:</p>
          <select
            value={displayCount}
            onChange={(e) => setDisplayCount(e.target.value as typeof displayCount)}
            className="text-sm font-semibold px-3 py-1.5 rounded border bg-gray-800 border-gray-700 text-white cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <option value="all">All</option>
            <option value="top5">Top 5</option>
            <option value="top10">Top 10</option>
            <option value="bottom5">Bottom 5</option>
            <option value="bottom10">Bottom 10</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Total Switches</p>
          <p className="text-xl font-bold text-orange-400">{totalSwitches.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Avg Gap</p>
          <p className={`text-xl font-bold`} style={{ color: getGapLevel(avgGapOverall).color }}>
            {formatTime(avgGapOverall)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Min Gap</p>
          <p className="text-xl font-bold text-green-400">
            {formatTime(absoluteMinGap)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Max Gap</p>
          <p className="text-xl font-bold text-red-400">
            {formatTime(absoluteMaxGap)}
          </p>
        </div>
      </div>

      {switchData.length > 0 ? (
        <div style={{ width: '100%', height: '320px' }}>
          <ResponsiveContainer>
            <BarChart 
              data={switchData} 
              layout="vertical" 
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis 
                type="category" 
                dataKey="appName" 
                stroke="#9ca3af" 
                style={{ fontSize: '11px' }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="switchCount" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-500 text-sm">
          No switches found from {fromCategory} to {toCategory}
        </div>
      )}

      {switchData.length > 0 && (
        <div className="mt-4 bg-orange-900/20 border border-orange-800 rounded-lg p-3">
          <p className="text-xs text-orange-300">
            💡 {generateInsight()}
          </p>
        </div>
      )}
    </div>
  );
}
