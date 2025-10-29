// AWContextSwitchCard.tsx

import { useState } from 'react';


interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

export default function AWContextSwitchCard({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [filterThreshold, setFilterThreshold] = useState(3); // Default 3 seconds

  if (data.length < 2) {
    return null;
  }

  // Group data by date
  const dataByDate = new Map<string, AWData[]>();
  
  data.forEach(item => {
    const dateStr = item.timestamp.toISOString().split('T')[0];
    if (!dataByDate.has(dateStr)) {
      dataByDate.set(dateStr, []);
    }
    dataByDate.get(dateStr)!.push(item);
  });

  const totalDays = dataByDate.size;

  // Calculate switches per day average (filter out sessions below threshold)
  const switchesPerDay = Array.from(dataByDate.values()).map(dayData => {
    // Filter sessions by threshold first
    const filteredSessions = dayData.filter(d => d.duration > filterThreshold);
    // Count transitions = filtered records - 1
    return Math.max(0, filteredSessions.length - 1);
  });
  const avgSwitchesPerDay = Math.round(
    switchesPerDay.reduce((sum, count) => sum + count, 0) / totalDays
  );

  // Calculate average session length (use selected filter threshold)
  const meaningfulSessions = data.filter(d => d.duration > filterThreshold);
  const totalSeconds = meaningfulSessions.reduce((sum, d) => sum + d.duration, 0);
  const avgTimePerApp = meaningfulSessions.length > 0 
    ? Math.round(totalSeconds / meaningfulSessions.length) 
    : 0;

  // Calculate unique apps per day average (filter by threshold)
  const uniqueAppsPerDay = Array.from(dataByDate.values()).map(dayData => {
    const filteredSessions = dayData.filter(d => d.duration > filterThreshold);
    return new Set(filteredSessions.map(d => d.appName)).size;
  });
  const avgUniqueApps = Math.round(
    uniqueAppsPerDay.reduce((sum, count) => sum + count, 0) / totalDays
  );

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-600/30">
            <svg 
              className="w-5 h-5 text-orange-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Context Switching</h3>
        </div>
        
        {/* Tooltip Badge */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-orange-300 text-xs font-semibold bg-orange-900/30 px-2 py-1 rounded border border-orange-700/30 hover:bg-orange-900/50 transition-colors cursor-pointer"
          >
            WORKFLOW
          </button>
          
          {/* Tooltip */}
          {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Multitasking Activity</p>
                <p>
                  Tracks how often you switch between different applications during work.
                </p>
                <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-700">
                  <strong>High switching:</strong> Working across multiple tools (normal for developers)<br/>
                  <strong>Low switching:</strong> Deep focus on single applications
                </p>
              </div>
              {/* Arrow pointer */}
              <div className="absolute -top-2 right-4 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Main content flex container */}
      <div className="flex items-start gap-6">
        {/* Left side - Main metrics */}
        <div className="flex-1">
          {/* Main Value */}
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">
                {avgSwitchesPerDay.toLocaleString()}
              </span>
              <span className="text-xl font-semibold text-orange-300">
                per day
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">App Transitions</p>
          </div>

          {/* Stats Grid */}
          <div className="mt-4 pt-4 border-t border-orange-700/30">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400 mb-1">Avg. Session</p>
                <p className="text-lg font-bold text-orange-300">
                 {Math.round(avgTimePerApp).toLocaleString()}s
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Unique Apps</p>
                <p className="text-lg font-bold text-orange-300">
                  {Math.round(avgUniqueApps).toLocaleString()}
                </p>
              </div>
            </div>
        {/* Bottom Summary */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="text-xs text-gray-400">
          💡 Average:{' '}
          <span className="text-white font-semibold">{avgSwitchesPerDay.toLocaleString()} switches/day</span>
          {' '}|{' '}
          <span className="text-orange-400 font-semibold">{meaningfulSessions.length.toLocaleString()} sessions</span>
          {' '}tracked
        </div>
        </div>
          </div>
        </div>

                {/* Right side - Filter buttons */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-gray-400 mb-1">Filter Sessions</p>
          <button
            onClick={() => setFilterThreshold(0)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filterThreshold === 0
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterThreshold(3)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filterThreshold === 3
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            &gt; 3s
          </button>
          <button
            onClick={() => setFilterThreshold(5)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filterThreshold === 5
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            &gt; 5s
          </button>
          <button
            onClick={() => setFilterThreshold(10)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filterThreshold === 10
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            &gt; 10s
          </button>
          <button
            onClick={() => setFilterThreshold(30)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filterThreshold === 30
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            &gt; 30s
          </button>
        </div>
      </div>
    </div>
  );
}
