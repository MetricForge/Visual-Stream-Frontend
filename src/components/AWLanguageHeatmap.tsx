// components/AWDevelopmentIntelligence.tsx
import { useState, useMemo } from 'react';
import {
  LANGUAGE_COLORS,
  isDevApp,
  sortLanguagesByPriority,
  getLanguageFromActivity,
  formatDuration
} from '../utils/languageConfig';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
  title: string;
}

interface Props {
  data: AWData[];
}

export default function AWDevelopmentIntelligence({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeRange, setTimeRange] = useState<30 | 90 | 365 | 'all'>(30); //Time range state
  const [hoveredBlock, setHoveredBlock] = useState<{
    hour: number;
    minute: number;
    language: string;
    occurrences: number;
    totalDays: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  // Filter data by selected time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    
    return data.filter(entry => entry.timestamp >= cutoffDate);
  }, [data, timeRange]);

  const devData = useMemo(() => {
    return filteredData
      .filter(entry => isDevApp(entry.appName))
      .map(entry => {
        const language = getLanguageFromActivity(entry.title, entry.appName);

        return {
          ...entry,
          language: language || 'Other'
        };
      })
      .filter(entry => entry.language && entry.language !== 'Other');
  }, [filteredData]);

  const heatmapData = useMemo(() => {
    const minuteBlocks = new Map<string, Map<string, Set<string>>>();
    const daysTracked = new Set<string>();

    devData.forEach((row) => {
      const timestamp = new Date(row.timestamp);
      const date = timestamp.toISOString().split('T')[0];
      const hour = timestamp.getHours();
      const minute = timestamp.getMinutes();

      daysTracked.add(date);

      const key = `${hour}:${minute}`;
      const language = row.language;

      if (!minuteBlocks.has(key)) {
        minuteBlocks.set(key, new Map());
      }

      const languageMap = minuteBlocks.get(key)!;
      if (!languageMap.has(language)) {
        languageMap.set(language, new Set());
      }

      languageMap.get(language)!.add(date);
    });

    const dominantLanguages = new Map<string, string>();

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        const key = `${hour}:${minute}`;
        const languageMap = minuteBlocks.get(key);

        if (!languageMap || languageMap.size === 0) {
          dominantLanguages.set(key, 'Idle');
        } else {
          let maxLanguage: string = 'Idle';
          let maxCount = 0;

          languageMap.forEach((dateSet, language) => {
            if (dateSet.size > maxCount) {
              maxCount = dateSet.size;
              maxLanguage = language;
            }
          });

          dominantLanguages.set(key, maxLanguage);
        }
      }
    }

    return {
      dominantLanguages,
      minuteBlocks,
      totalDays: daysTracked.size,
    };
  }, [devData]);

  const getBlockData = (hour: number, minute: number) => {
    const key = `${hour}:${minute}`;
    const languageMap = heatmapData.minuteBlocks.get(key);
    const dominantLanguage = heatmapData.dominantLanguages.get(key) || 'Idle';

    return {
      language: dominantLanguage,
      occurrences: dominantLanguage !== 'Idle' && languageMap
        ? languageMap.get(dominantLanguage)?.size || 0
        : 0,
    };
  };

  const insights = useMemo(() => {
    let peakHour = 0;
    let peakActivity = 0;

    for (let hour = 0; hour < 24; hour++) {
      let hourActivity = 0;
      for (let minute = 0; minute < 60; minute++) {
        const blockData = getBlockData(hour, minute);
        if (blockData.language !== 'Idle') {
          hourActivity += blockData.occurrences;
        }
      }

      if (hourActivity > peakActivity) {
        peakActivity = hourActivity;
        peakHour = hour;
      }
    }

    const languageConsistency = new Map<string, number>();
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        const blockData = getBlockData(hour, minute);
        if (blockData.language !== 'Idle' && blockData.occurrences > 0) {
          const consistency = blockData.occurrences / heatmapData.totalDays;
          const current = languageConsistency.get(blockData.language) || 0;
          languageConsistency.set(blockData.language, current + consistency);
        }
      }
    }

    let topLanguage: string | null = null;
    let topScore = 0;
    languageConsistency.forEach((score, lang) => {
      if (score > topScore) {
        topScore = score;
        topLanguage = lang;
      }
    });

    let totalActiveMinutes = 0;
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute++) {
      const blockData = getBlockData(hour, minute);
      if (blockData.language !== 'Idle' && blockData.occurrences > 0) {
        totalActiveMinutes++;
      }
    }
  }

  return {
    peakHour,
    topLanguage,
    avgHoursPerDay: totalActiveMinutes / heatmapData.totalDays / 60, //  Convert to hours
  };
}, [heatmapData]);


  const usedLanguages = useMemo(() => {
    const langs = new Set<string>();
    devData.forEach(entry => {
      if (entry.language && entry.language !== 'Idle') {
        langs.add(entry.language);
      }
    });
    return sortLanguagesByPriority(Array.from(langs));
  }, [devData]);

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Development Activity Pattern</h3>
          <p className="text-sm text-gray-400">
            Hour-by-hour coding activity across {heatmapData.totalDays} days • Development tools only
          </p>
        </div>

        {/* Toggle Buttons + Badge */}
        <div className="flex items-center gap-3">
          {/* Time Range Toggle Buttons */}
          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
            {([30, 90, 365, 'all'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setTimeRange(option)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  timeRange === option
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {option === 'all' ? 'All' : option === 30 ? '30d' : option === 90 ? '90d' : '1yr'}
              </button>
            ))}
          </div>

          {/* Heatmap Badge */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-purple-300 text-xs font-semibold bg-purple-900/30 px-2 py-1 rounded border border-purple-700/30 hover:bg-purple-900/50 transition-colors cursor-pointer"
            >
              HEATMAP
            </button>

            {/* Tooltip position */}
            {showTooltip && (
              <div className="absolute right-0 top-full mt-2 bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 w-96 shadow-xl z-10">
                <p className="font-semibold text-white mb-2">Development Heatmap</p>
                <p>
                  Shows coding activity patterns throughout the day. Each block represents 1 minute,
                  colored by the dominant programming language at that time.
                </p>
                <p className="mt-2">
                  Hover over blocks to see language frequency across tracked days. Use the time range buttons to focus on recent or historical patterns.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="bg-gray-900/50 p-3 rounded border border-gray-700/30">
          <div className="text-gray-400 text-xs mb-1">Peak Coding Window</div>
          <div className="text-white font-semibold">
            {insights.peakHour.toString().padStart(2, '0')}:00-
            {((insights.peakHour + 1) % 24).toString().padStart(2, '0')}:00
          </div>
        </div>

        <div className="bg-gray-900/50 p-3 rounded border border-gray-700/30">
          <div className="text-gray-400 text-xs mb-1">Primary Language</div>
          <div className="text-white font-semibold">{insights.topLanguage || 'N/A'}</div>
        </div>

        <div className="bg-gray-900/50 p-3 rounded border border-gray-700/30">
          <div className="text-gray-400 text-xs mb-1">Typical Session Length</div>
          <div className="text-white font-semibold">~{formatDuration(insights.avgHoursPerDay)} min/day</div>
        </div>
      </div>

      {/* Language Legend */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <span className="text-gray-400">Languages:</span>
        {usedLanguages.map((language) => (
          <div key={language} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Other'] }}
            />
            <span className="text-gray-300">{language}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-800" />
          <span className="text-gray-300">Idle</span>
        </div>
      </div>

      {/* Responsive Heatmap Grid */}
      <div className="relative overflow-hidden">
        {/* Hour labels */}
        <div className="absolute left-0 top-5 flex flex-col text-xs text-gray-500 pointer-events-none">
          {Array.from({ length: 24 }, (_, hour) => (
            <div 
              key={hour} 
              className="
                h-[14px] lg:h-[16.5px] xl:h-[19px] 2xl:h-[21px]
                leading-[14px] lg:leading-[16.5px] xl:leading-[19px] 2xl:leading-[21px]
              "
            >
              {hour % 3 === 0 ? hour.toString().padStart(2, '0') : ''}
            </div>
          ))}
        </div>

        {/* Heatmap Container */}
        <div className="ml-10 lg:ml-12">
          {/* Minute markers */}
          <div className="flex text-xs text-gray-500 mb-1">
            {[0, 10, 20, 30, 40, 50, 60].map((minute) => (
              <div 
                key={minute}
                className="text-left"
                style={{
                  width: minute === 60 ? '0px' : 'calc(10 * (7px + 1px))',
                }}
              >
                {minute}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          <div className="flex flex-col gap-[1px] lg:gap-[1.5px] xl:gap-[2px]">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="flex gap-[1px] lg:gap-[1.5px] xl:gap-[2px]">
                {Array.from({ length: 60 }, (_, minute) => {
                  const blockData = getBlockData(hour, minute);
                  const color = LANGUAGE_COLORS[blockData.language] || '#1f2937';
                  const opacity = blockData.occurrences > 0 
                    ? 0.3 + (blockData.occurrences / heatmapData.totalDays) * 0.7
                    : 0.2;

                  return (
                    <div
                      key={minute}
                      className="
                        w-[7px] h-[13px]
                        lg:w-[8px] lg:h-[15px]
                        xl:w-[9px] xl:h-[17px]
                        2xl:w-[10px] 2xl:h-[19px]
                        cursor-pointer rounded-sm
                      "
                      style={{
                        backgroundColor: color,
                        opacity: opacity,
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredBlock({
                          hour,
                          minute,
                          language: blockData.language,
                          occurrences: blockData.occurrences,
                          totalDays: heatmapData.totalDays,
                          mouseX: rect.left + rect.width / 2,
                          mouseY: rect.top + rect.height / 2,
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

        {/* Smart Tooltip */}
        {hoveredBlock && (
          <div 
            className="fixed bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white whitespace-nowrap shadow-xl z-50 pointer-events-none"
            style={{
              left: `${hoveredBlock.mouseX}px`,
              top: `${hoveredBlock.mouseY}px`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-8px'
            }}
          >
            <div className="font-semibold mb-1">
              {hoveredBlock.hour.toString().padStart(2, '0')}:
              {hoveredBlock.minute.toString().padStart(2, '0')}
            </div>
            <div className="text-gray-300">{hoveredBlock.language}</div>
            <div className="text-gray-400 text-xs mt-1">
              {hoveredBlock.occurrences > 0 ? (
                <>
                  Occurred: {hoveredBlock.occurrences}x across {hoveredBlock.totalDays} days<br />
                  Frequency: {((hoveredBlock.occurrences / hoveredBlock.totalDays) * 100).toFixed(0)}%
                </>
              ) : (
                'No activity'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
