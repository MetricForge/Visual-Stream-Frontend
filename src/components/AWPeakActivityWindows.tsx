// components/AWPeakActivityWindows.tsx

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { categorizeApp, COLORS, type AppCategory } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

interface ActivityBlock {
  start: Date;
  end: Date;
  duration: number; // minutes
  dominantCategory: AppCategory;
  categoryBreakdown: Map<AppCategory, number>;
  eventCount: number;
}

// Helper to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

const processBlock = (block: { start: Date; end: Date; events: AWData[] }): ActivityBlock => {
  const categoryDurations = new Map<AppCategory, number>();
  block.events.forEach((event) => {
    const category = categorizeApp(event.appName);
    const current = categoryDurations.get(category) || 0;
    categoryDurations.set(category, current + event.duration / 60);
  });

  // Find dominant category
  let dominantCategory: AppCategory = 'Other';
  let maxDuration = 0;
  categoryDurations.forEach((duration, category) => {
    if (duration > maxDuration) {
      maxDuration = duration;
      dominantCategory = category;
    }
  });

  const totalDuration = (block.end.getTime() - block.start.getTime()) / (1000 * 60);
  return {
    start: block.start,
    end: block.end,
    duration: totalDuration,
    dominantCategory,
    categoryBreakdown: categoryDurations,
    eventCount: block.events.length,
  };
};

export default function AWPeakActivityWindows({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // Detect continuous activity blocks (gaps < 10 minutes)
  const activityBlocks = useMemo(() => {
    if (data.length === 0) return [];

    const sortedData = [...data].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const blocks: ActivityBlock[] = [];
    let currentBlock: {
      start: Date;
      end: Date;
      events: AWData[];
    } | null = null;

    const GAP_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds

    sortedData.forEach((row, index) => {
      const timestamp = new Date(row.timestamp);
      const endTime = new Date(timestamp.getTime() + row.duration * 1000);

      if (!currentBlock) {
        // Start new block
        currentBlock = {
          start: timestamp,
          end: endTime,
          events: [row],
        };
      } else {
        const timeSinceLastEvent = timestamp.getTime() - currentBlock.end.getTime();

        if (timeSinceLastEvent <= GAP_THRESHOLD) {
          // Continue current block
          currentBlock.end = endTime;
          currentBlock.events.push(row);
        } else {
          // Save current block and start new one
          if (currentBlock.events.length > 0) {
            blocks.push(processBlock(currentBlock));
          }

          currentBlock = {
            start: timestamp,
            end: endTime,
            events: [row],
          };
        }
      }

      // Save last block
      if (index === sortedData.length - 1 && currentBlock) {
        blocks.push(processBlock(currentBlock));
      }
    });

    return blocks.sort((a, b) => b.duration - a.duration); // Sort by duration descending
  }, [data]);

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

    // Format duration
    const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      const secs = Math.round((minutes % 1) * 60);
  
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      if (mins > 0) {
        return `${mins}m`;
      }
      // Only show seconds when less than 1 minute
      return `${secs}s`;
    };

    const avgBlocksPerWeek = useMemo(() => {
  if (activityBlocks.length === 0 || data.length === 0) return 0;
  
  // Get date range
  const dates = data.map(d => new Date(d.timestamp).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  
  // Calculate number of weeks
  const daysSpanned = (maxDate - minDate) / (1000 * 60 * 60 * 24);
  const weeksSpanned = Math.max(daysSpanned / 7, 1); // At least 1 week
  
  return activityBlocks.length / weeksSpanned;
}, [activityBlocks, data]);

return (
  <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
    {/* Header with icon and badge */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
    {/* Timeline Icon */}
    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l6-7 5 5 5-6M15 14a1 1 0 11-2 0 1 1 0 012 0zM10 9a1 1 0 11-2 0 1 1 0 012 0zM4 16a1 1 0 11-2 0 1 1 0 012 0zM20 8a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>

        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-1">Work Sessions</h3>
          <p className="text-xs text-slate-400">Continuous activity blocks (gaps &lt; 10 min)</p>
        </div>
      </div>

      {/* Badge */}
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-blue-300 text-xs font-semibold bg-blue-900/30 px-2 py-1 rounded border border-blue-700/30 hover:bg-blue-900/50 transition-colors cursor-pointer"
        >
          TIMELINE
        </button>

            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
    <h4 className="text-sm font-semibold text-slate-200 mb-2">Deep Work Sessions</h4>
    <p className="text-xs text-slate-400 mb-2">
      Tracks uninterrupted focus blocks where you worked continuously for 10+ minutes. Helps identify your flow state patterns.
    </p>
    <div className="text-xs text-slate-300 space-y-1">
      <div>Avg session: {activityBlocks.length > 0 ? formatDuration(activityBlocks.reduce((sum, b) => sum + b.duration, 0) / activityBlocks.length) : '0m'}</div>
      <div>Longest streak: {activityBlocks.length > 0 ? formatDuration(activityBlocks[0].duration) : '0m'}</div>
    </div>
  </div>
)}

      </div>
    </div>

{/* Stats */}
<div className="grid grid-cols-3 gap-4 mb-6">
  <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/40 border border-amber-700/30 rounded-lg p-4">
    <div className="text-xs text-amber-400/70 mb-1">Avg Blocks/Week</div>
    <div className="text-3xl font-bold text-amber-400">{avgBlocksPerWeek.toFixed(1)}</div>
  </div>
  <div className="bg-gradient-to-br from-blue-900/20 to-blue-950/40 border border-blue-700/30 rounded-lg p-4">
    <div className="text-xs text-blue-400/70 mb-1">Longest</div>
    <div className="text-3xl font-bold text-blue-400">
      {activityBlocks.length > 0 ? formatDuration(activityBlocks[0].duration) : '0m'}
    </div>
  </div>
  <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/40 border border-purple-700/30 rounded-lg p-4">
    <div className="text-xs text-purple-400/70 mb-1">Avg Duration</div>
    <div className="text-3xl font-bold text-purple-400">
      {activityBlocks.length > 0
        ? formatDuration(activityBlocks.reduce((sum, b) => sum + b.duration, 0) / activityBlocks.length)
        : '0m'}
    </div>
  </div>
</div>


      {/* Timeline Bars */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {activityBlocks.slice(0, 20).map((block, index) => {
          const categoryPercentages = new Map<AppCategory, number>();
          const totalCategoryTime = Array.from(block.categoryBreakdown.values()).reduce(
            (sum, val) => sum + val,
            0
          );

          block.categoryBreakdown.forEach((duration, category) => {
            categoryPercentages.set(category, (duration / totalCategoryTime) * 100);
          });

          return (
            <div key={index}>
              {/* Time and Duration */}
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>
                  {formatTime(block.start)} - {formatTime(block.end)}
                </span>
                <span>
                  {formatDuration(block.duration)} • {formatNumber(block.eventCount)} events
                </span>
              </div>

              {/* Multi-segment bar */}
              <div
                className="relative w-full mb-2"
                onMouseEnter={(e) => {
                  setHoveredBlock(index);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => {
                  setHoveredBlock(null);
                  setTooltipPosition(null);
                }}
              >
                {/* Bar container with overflow-hidden */}
                <div className="relative w-full h-8 bg-slate-800/30 rounded overflow-hidden">
                  {(() => {
                    let currentOffset = 0;
                    return Array.from(categoryPercentages.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, percentage]) => {
                        const segment = (
                          <div
                            key={category}
                            className="absolute top-0 h-full transition-all"
                            style={{
                              left: `${currentOffset}%`,
                              width: `${percentage}%`,
                              backgroundColor: COLORS[category],
                            }}
                          />
                        );
                        currentOffset += percentage;
                        return segment;
                      });
                  })()}
                </div>

                {/* Portal tooltip */}
                {hoveredBlock === index && tooltipPosition && createPortal(
                  <div 
                    className="fixed bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 shadow-xl z-50 min-w-[200px] pointer-events-none"
                    style={{
                      left: `${tooltipPosition.x}px`,
                      top: `${tooltipPosition.y - 10}px`,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    <div className="text-xs text-slate-300 mb-2">
                      {formatTime(block.start)} - {formatTime(block.end)}
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      Duration: {formatDuration(block.duration)} • {formatNumber(block.eventCount)} events
                    </div>
                    <div className="space-y-1">
                      {Array.from(block.categoryBreakdown.entries())
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, duration]) => (
                          <div key={category} className="flex justify-between text-xs">
                            <span style={{ color: COLORS[category] }}>{category}</span>
                            <span className="text-slate-400">{formatDuration(duration)}</span>
                          </div>
                        ))}
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900/95" />
                  </div>,
                  document.body
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
