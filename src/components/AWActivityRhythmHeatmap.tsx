// components/AWActivityRhythmHeatmap.tsx
import { useState, useMemo } from 'react';
import { categorizeApp, COLORS, CATEGORY_ORDER, type AppCategory } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

// Add Idle category color
const CATEGORY_COLORS = {
  ...COLORS,
  Idle: '#1f2937',
};

export default function AWActivityRhythmHeatmap({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredBlock, setHoveredBlock] = useState<{
    hour: number;
    minute: number;
    category: AppCategory | 'Idle';
    occurrences: number;
    totalDays: number;
  } | null>(null);

  // Process data into 1-minute blocks, averaged across all days
  const heatmapData = useMemo(() => {
    const minuteBlocks = new Map<string, Map<AppCategory | 'Idle', Set<string>>>();
    const daysTracked = new Set<string>();

    data.forEach((row) => {
      const timestamp = new Date(row.timestamp);
      const date = timestamp.toISOString().split('T')[0];
      const hour = timestamp.getHours();
      const minute = timestamp.getMinutes();
  
      daysTracked.add(date);
  
      const key = `${hour}:${minute}`;
      const category = categorizeApp(row.appName);
  
      if (!minuteBlocks.has(key)) {
        minuteBlocks.set(key, new Map());
      }
  
      const categoryMap = minuteBlocks.get(key)!;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Set());
      }
      categoryMap.get(category)!.add(date); // Track unique dates
    });



    const dominantCategories = new Map<string, AppCategory | 'Idle'>();
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        const key = `${hour}:${minute}`;
        const categoryMap = minuteBlocks.get(key);
        
        if (!categoryMap || categoryMap.size === 0) {
          dominantCategories.set(key, 'Idle');
        } else {
          let maxCategory: AppCategory | 'Idle' = 'Idle';
          let maxCount = 0;
          
          categoryMap.forEach((dateSet, category) => {
              if (dateSet.size > maxCount) {
                maxCount = dateSet.size;
                maxCategory = category;
              }
            });        
          dominantCategories.set(key, maxCategory);
        }
      }
    }

    return {
      dominantCategories,
      minuteBlocks,
      totalDays: daysTracked.size,
    };
  }, [data]);

  const getBlockData = (hour: number, minute: number) => {
      const key = `${hour}:${minute}`;
      const categoryMap = heatmapData.minuteBlocks.get(key);
      const dominantCategory = heatmapData.dominantCategories.get(key) || 'Idle';
  
      return {
        category: dominantCategory,
        occurrences: dominantCategory !== 'Idle' && categoryMap 
          ? categoryMap.get(dominantCategory as AppCategory)?.size || 0  // Get Set.size for unique days
          : 0,
      };
    };


  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-100">
              Daily Activity Rhythm
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Averaged pattern across {heatmapData.totalDays} days • 1-minute resolution
          </p>
        </div>

        {/* Tooltip Badge */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-purple-300 text-xs font-semibold bg-purple-900/30 px-2 py-1 rounded border border-purple-700/30 hover:bg-purple-900/50 transition-colors cursor-pointer"
          >
            HEATMAP
          </button>

            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
            <div className="font-semibold text-gray-100 mb-2">
              Activity Rhythm Heatmap
            </div>
            <div className="text-xs text-gray-400 mb-3">
              Shows your typical activity pattern throughout the day. Each block represents 1 minute, 
              with the color showing the most common category at that time across all tracked days.
              Hover over any block to see how consistently you perform that activity (frequency).
            </div>

    
            {/* Divider */}
            <div className="border-t border-gray-700 pt-2 mb-3">
              <div className="text-xs text-gray-400 italic space-y-1">
                {(() => {
                  // Find longest idle period
                  let longestIdleStart = -1;
                  let longestIdleEnd = -1;
                  let longestIdleDuration = 0;
                  let currentIdleStart = -1;
                  let currentIdleDuration = 0;

                  for (let hour = 0; hour < 24; hour++) {
                    for (let minute = 0; minute < 60; minute++) {
                      const blockData = getBlockData(hour, minute);
              
                      if (blockData.category === 'Idle') {
                        if (currentIdleStart === -1) {
                          currentIdleStart = hour * 60 + minute;
                        }
                        currentIdleDuration++;
                      } else {
                        if (currentIdleDuration > longestIdleDuration) {
                          longestIdleDuration = currentIdleDuration;
                          longestIdleStart = currentIdleStart;
                          longestIdleEnd = currentIdleStart + currentIdleDuration - 1;
                        }
                        currentIdleStart = -1;
                        currentIdleDuration = 0;
                      }
                    }
                  }
          
                  // Check final idle period
                  if (currentIdleDuration > longestIdleDuration) {
                    longestIdleDuration = currentIdleDuration;
                    longestIdleStart = currentIdleStart;
                    longestIdleEnd = currentIdleStart + currentIdleDuration - 1;
                  }

                  const formatMinute = (totalMin: number) => {
                    const h = Math.floor(totalMin / 60);
                    const m = totalMin % 60;
                    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                  };

                  return (
                    <>
                      {longestIdleDuration > 30 && (
                        <div>
                          Sleep window: {formatMinute(longestIdleStart)} - {formatMinute(longestIdleEnd)} ({Math.floor(longestIdleDuration / 60)}h {longestIdleDuration % 60}m)
                        </div>
                      )}
              
                      {/* Find peak activity hour */}
                      {(() => {
                        let peakHour = 0;
                        let peakActivity = 0;
                
                        for (let hour = 0; hour < 24; hour++) {
                          let hourActivity = 0;
                          for (let minute = 0; minute < 60; minute++) {
                            const blockData = getBlockData(hour, minute);
                            if (blockData.category !== 'Idle') {
                              hourActivity += blockData.occurrences;
                            }
                          }
                          if (hourActivity > peakActivity) {
                            peakActivity = hourActivity;
                            peakHour = hour;
                          }
                        }
                
                        return peakActivity > 0 ? (
                          <div>
                            Peak activity: {peakHour.toString().padStart(2, '0')}:00-{((peakHour + 1) % 24).toString().padStart(2, '0')}:00
                          </div>
                        ) : null;
                      })()}

                      {/* Most consistent category */}
                      {(() => {
                        const categoryConsistency = new Map<AppCategory, number>();
                
                        for (let hour = 0; hour < 24; hour++) {
                          for (let minute = 0; minute < 60; minute++) {
                            const blockData = getBlockData(hour, minute);
                            if (blockData.category !== 'Idle' && blockData.occurrences > 0) {
                              const consistency = blockData.occurrences / heatmapData.totalDays;
                              const current = categoryConsistency.get(blockData.category as AppCategory) || 0;
                              categoryConsistency.set(blockData.category as AppCategory, current + consistency);
                            }
                          }
                        }
                
                        let topCategory: AppCategory | null = null;
                        let topScore = 0;
                        categoryConsistency.forEach((score, cat) => {
                          if (score > topScore) {
                            topScore = score;
                            topCategory = cat;
                          }
                        });
                
                        return topCategory ? (
                          <div>
                            Most consistent: {topCategory}
                          </div>
                        ) : null;
                      })()}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Category Legend */}
            <div className="text-xs text-gray-300 font-semibold mb-2">
              Categories:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {CATEGORY_ORDER.map((category) => (
                <div key={category} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: COLORS[category as AppCategory] }}
                  />
                  <span className="text-gray-300 truncate">{category}</span>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-gray-700" />
                <span className="text-gray-300">Idle</span>
              </div>
            </div>
          </div>
        )}

        </div>

      </div>

      {/* Heatmap Container */}
      <div className="flex-1 flex gap-2 overflow-auto">
        {/* Hour labels (Y-axis) */}
        <div className="flex flex-col justify-start text-xs text-gray-400 pr-2 border-r border-gray-700 pt-6">
          {Array.from({ length: 24 }, (_, hour) => (
            <div 
              key={hour} 
              className="h-[20px] flex items-center flex-shrink-0"
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex-1 flex flex-col">
          {/* Minute markers (X-axis) */}
          <div className="flex mb-1 h-5">
            {Array.from({ length: 7 }, (_, i) => (
              <div 
                key={i} 
                className="flex-1 text-xs text-gray-400 text-center"
              >
                {i * 10}
              </div>
            ))}
          </div>

          {/* Hour rows */}
        <div className="space-y-0">
            {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="flex h-[20px]">
                {Array.from({ length: 60 }, (_, minute) => {
                const blockData = getBlockData(hour, minute);
                const color = CATEGORY_COLORS[blockData.category];
        
                return (
                    <div
                    key={`${hour}-${minute}`}
                    className="flex-1 cursor-pointer transition-opacity hover:opacity-80"
                    style={{ 
                        backgroundColor: color,
                        minWidth: '6px',
                    }}
                    onMouseEnter={() => {
                        setHoveredBlock({
                        hour,
                        minute,
                        category: blockData.category,
                        occurrences: blockData.occurrences,
                        totalDays: heatmapData.totalDays,
                        });
                    }}
                    onMouseLeave={() => setHoveredBlock(null)}
                    />
                );
                })}
            </div>
            ))}
        </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredBlock && (
        <div className="absolute bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 pointer-events-none max-w-xs" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="text-sm space-y-1">
            <div className="font-semibold text-gray-100">
              {hoveredBlock.hour.toString().padStart(2, '0')}:
              {hoveredBlock.minute.toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: CATEGORY_COLORS[hoveredBlock.category] }}
              />
              <span className="text-gray-300">{hoveredBlock.category}</span>
            </div>
            <div className="text-xs text-gray-400">
              Occurred: {hoveredBlock.occurrences}x across {hoveredBlock.totalDays} days
            </div>
            <div className="text-xs text-gray-400">
              Frequency: {((hoveredBlock.occurrences / hoveredBlock.totalDays) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
