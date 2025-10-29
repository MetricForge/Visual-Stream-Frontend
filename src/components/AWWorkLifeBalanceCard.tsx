// AWTimeDistributionCard.tsx
import { useState } from 'react';
import { categorizeActivity } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}


export default function AWTimeDistributionCard({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Filter focused data
  const focusedData = data.filter(d => d.duration > 0);
  
  // Calculate productive vs leisure time
  let productiveTime = 0;
  let leisureTime = 0;
  
  focusedData.forEach(item => {
      const activityType = categorizeActivity(item.appName);
      if (activityType === 'productive') {
        productiveTime += item.duration;
      } else {
        leisureTime += item.duration;
      }
    });

  const totalTime = productiveTime + leisureTime;
  const productivePercentage = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
  const leisurePercentage = totalTime > 0 ? Math.round((leisureTime / totalTime) * 100) : 0;
  
  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-blue-600/30">
        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white">Time Distribution</h3>
    </div>
    
    {/* Tooltip Badge */}
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-blue-300 text-xs font-semibold bg-blue-900/30 px-2 py-1 rounded border border-blue-700/30 hover:bg-blue-900/50 transition-colors cursor-pointer"
      >
        BALANCE
      </button>
      
      {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
          <div className="text-xs text-gray-300 space-y-2">
            <p className="font-semibold text-white mb-1">Time Distribution</p>
            <p>
              Shows how your active time splits between productive activities (coding, tools, communication) and leisure (gaming, entertainment).
            </p>
            <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-700 italic">
              Categories are automatically detected from app usage.
            </p>
          </div>
          <div className="absolute -top-2 right-4 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
        </div>
      )}
    </div>
  </div>



      {/* Main Split Display */}
      <div className="flex items-center justify-center gap-6 my-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-400">{productivePercentage}%</div>
          <div className="text-sm text-gray-400 mt-1">Productive</div>
        </div>
        
        <div className="text-3xl text-gray-600 font-light">/</div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-400">{leisurePercentage}%</div>
          <div className="text-sm text-gray-400 mt-1">Leisure</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 float-left" 
            style={{ width: `${productivePercentage}%` }}
          />
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 float-left" 
            style={{ width: `${leisurePercentage}%` }}
          />
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
          <div className="text-xs text-blue-300/70 mb-1">Productive</div>
          <div className="text-lg font-semibold text-blue-300">{formatTime(productiveTime)}</div>
        </div>
        
        <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3">
          <div className="text-xs text-purple-300/70 mb-1">Leisure</div>
          <div className="text-lg font-semibold text-purple-300">{formatTime(leisureTime)}</div>
        </div>
      </div>
    </div>
  );
}
