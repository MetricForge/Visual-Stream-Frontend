// AWTotalTimeCard.tsx
import { useState } from 'react';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

export default function AWTotalTimeCard({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Calculate total focused time
  const focusedRecords = data.filter(d => d.duration > 0);
  const totalSeconds = focusedRecords.reduce((sum, d) => sum + d.duration, 0);
  
// Get today in LOCAL time
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// Split by weekday vs weekend
let weekdaySeconds = 0;
let weekendSeconds = 0;
let todaySeconds = 0;
const weekdayDates = new Set<string>();
const weekendDates = new Set<string>();

focusedRecords.forEach(item => {
  const date = new Date(item.timestamp); // Auto-converts UTC to local
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if today
  if (dateStr === todayStr) {
    todaySeconds += item.duration;
  }
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    weekendSeconds += item.duration;
    weekendDates.add(dateStr);
  } else {
    weekdaySeconds += item.duration;
    weekdayDates.add(dateStr);
  }
  });

  
  const weekdayCount = weekdayDates.size;
  const weekendCount = weekendDates.size;
  
  // Calculate averages
  const avgWeekdayMinutes = weekdayCount > 0 ? Math.round(weekdaySeconds / 60 / weekdayCount) : 0;
  const avgWeekendMinutes = weekendCount > 0 ? Math.round(weekendSeconds / 60 / weekendCount) : 0;
  
  const weekdayHours = Math.floor(avgWeekdayMinutes / 60);
  const weekdayMins = avgWeekdayMinutes % 60;
  
  const weekendHours = Math.floor(avgWeekendMinutes / 60);
  const weekendMins = avgWeekendMinutes % 60;
  
  // Overall average for comparison
  const totalDays = weekdayCount + weekendCount;
  const overallAvgMinutes = totalDays > 0 ? Math.round(totalSeconds / 60 / totalDays) : 0;
  
  // Today's stats
  const todayMinutes = Math.round(todaySeconds / 60);
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;
  const todayPercent = overallAvgMinutes > 0 ? Math.round((todayMinutes / overallAvgMinutes) * 100) : 0;
  const todayProgressWidth = Math.min(todayPercent, 200); // Cap at 200% for visual
  

  // Date range
const firstDate = new Date(Math.min(...focusedRecords.map(r => r.timestamp.getTime())));
const lastDate = new Date(Math.max(...focusedRecords.map(r => r.timestamp.getTime())));
const dateRange = `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

// Average hours per day
const avgHoursPerDay = (totalSeconds / 3600 / totalDays).toFixed(1);

  return (
<div className="relative bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-blue-600/30">
        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white">Avg Daily Active Time</h3>
    </div>
    
    {/* Tooltip Badge */}
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-blue-300 text-xs font-semibold bg-blue-900/30 px-2 py-1 rounded border border-blue-700/30 hover:bg-blue-900/50 transition-colors cursor-pointer"
      >
        DAILY AVERAGE
      </button>
      
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
          <div className="text-xs text-gray-300 space-y-2">
            <p className="font-semibold text-white mb-1">Daily Active Time</p>
            <p>
              Average time spent actively using applications, split by weekday vs weekend.
            </p>
            <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-700 italic">
              {weekdayCount} weekday{weekdayCount !== 1 ? 's' : ''}, {weekendCount} weekend day{weekendCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="absolute -top-2 right-4 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
        </div>
      )}
    </div>
  </div>



    {/* Weekday / Weekend Split - Larger */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Weekday */}
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Weekday</div>
            <div className="flex items-baseline gap-1 justify-center">
            <span className="text-4xl font-bold text-white">{weekdayHours}</span>
            <span className="text-xl text-gray-400">h</span>
            <span className="text-4xl font-bold text-white">{weekdayMins.toString().padStart(2, '0')}</span>
            <span className="text-xl text-gray-400">m</span>
          </div>
        </div>
        
    {/* Weekend */}
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Weekend</div>
            <div className="flex items-baseline gap-1 justify-center">
            <span className="text-4xl font-bold text-white">{weekendHours}</span>
            <span className="text-xl text-gray-400">h</span>
            <span className="text-4xl font-bold text-white">{weekendMins.toString().padStart(2, '0')}</span>
            <span className="text-xl text-gray-400">m</span>
          </div>
        </div>
      </div>

      {/* Today vs Average */}
      <div className="mb-3">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm text-gray-300">
            Today: <span className="text-white font-semibold">{todayHours}h {todayMins}m</span>
          </span>
          <span className="text-xs text-gray-400">{todayPercent}% of avg</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-blue-950/50 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              todayPercent >= 100 ? 'bg-green-500' : 'bg-blue-400'
            }`}
            style={{ width: `${todayProgressWidth}%` }}
          ></div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-blue-700/30 my-3"></div>

        {/* Bottom Summary */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-400">
            Data Range:{' '}
            <span className="text-white font-semibold">{dateRange}</span>
            {' '}|{' '}
            <span className="text-blue-400 font-semibold">{avgHoursPerDay}h/day</span>
            {' '}average
          </div>
        </div>
        </div>
  );
}
