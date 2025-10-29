// components/AWAppTransitionNetwork.tsx
import { useState, useMemo } from 'react';
import { categorizeApp } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

const COLORS: Record<string, string> = {
  'Coding': '#3b82f6',
  'Tools': '#f59e0b',
  'Communication': '#8b5cf6',
  'Browser': '#10b981',
  'Entertainment': '#ef4444',
  'Other': '#6b7280'
};

interface Sequence {
  apps: string[];
  count: number;
  categories: string[];
  isLoop: boolean;
  pattern: string;
  durations?: number[];
}

export default function AWAppTransitionNetwork({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [minTransitions, setMinTransitions] = useState(10); 
  const [minDuration, setMinDuration] = useState(3); 
  const [sequenceLength, setSequenceLength] = useState<2 | 3 | 4 | 5>(2);
  const [hoveredSequence, setHoveredSequence] = useState<string | null>(null);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null); // For stat tooltips
  const [hoveredSlider, setHoveredSlider] = useState<string | null>(null);

  const sequences = useMemo(() => {
    const validData = data.filter(d => d.duration >= minDuration);
    if (validData.length < sequenceLength) return [];

    const sortedData = [...validData].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

      const sequenceMap = new Map<string, { count: number; durations: number[][] }>();

      for (let i = 0; i <= sortedData.length - sequenceLength; i++) {
        const apps: string[] = [];
        const durations: number[] = [];
    
        for (let j = 0; j < sequenceLength; j++) {
          apps.push(sortedData[i + j].appName);
          durations.push(sortedData[i + j].duration);
        }
     const hasConsecutiveDuplicates = apps.some((app, idx) => 
      idx > 0 && app === apps[idx - 1]
    );
    if (hasConsecutiveDuplicates) continue;

    const key = apps.join(' → ');
    // MERGE BIDIRECTIONAL: Check if reverse already exists for 2-step sequences
    if (sequenceLength === 2) {
      const reverseKey = [apps[1], apps[0]].join(' → ');
      const normalizedKey = sequenceMap.has(reverseKey) ? reverseKey : key;
      
      if (!sequenceMap.has(normalizedKey)) {
        sequenceMap.set(normalizedKey, { count: 0, durations: [] });
      }
      const entry = sequenceMap.get(normalizedKey)!;
      entry.count++;
      entry.durations.push(durations);
    } else {
      // For 3+ step sequences, keep as-is (directional matters)
      if (!sequenceMap.has(key)) {
        sequenceMap.set(key, { count: 0, durations: [] });
      }
      const entry = sequenceMap.get(key)!;
      entry.count++;
      entry.durations.push(durations);
    }
  }

  const sequenceArray: Sequence[] = Array.from(sequenceMap.entries())
    .map(([key, { count, durations }]) => {
      const apps = key.split(' → ');
      const categories = apps.map(app => categorizeApp(app));
      const isLoop = apps[0] === apps[apps.length - 1];
      const allSameCategory = new Set(categories).size === 1;
      
      const avgDurations = durations[0].map((_, idx) => {
        const sum = durations.reduce((acc, dur) => acc + dur[idx], 0);
        return sum / durations.length;
      });
      
      let pattern = 'workflow';
      const hasEntertainment = categories.includes('Entertainment');
      
      if (hasEntertainment && sequenceLength >= 3) {
        const entertainmentIndices = categories
          .map((cat, idx) => cat === 'Entertainment' ? idx : -1)
          .filter(idx => idx > 0 && idx < categories.length - 1);
        
        if (entertainmentIndices.length > 0) {
          const returnsToSameApp = apps[0] === apps[apps.length - 1];
          const entertainmentDuration = entertainmentIndices.reduce((sum, idx) => 
            sum + avgDurations[idx], 0
          );
          
          if (returnsToSameApp && entertainmentDuration <= 300) {
            pattern = 'distraction';
          }
        }
      }
      
      if (pattern !== 'distraction') {
        if (isLoop) {
          pattern = 'loop';
        } else if (allSameCategory) {
          pattern = 'focused';
        } else {
          pattern = 'workflow';
        }
      }

      return {
        apps,
        count,
        categories,
        isLoop,
        pattern,
        durations: avgDurations
      };
    })
    .filter(seq => seq.count >= minTransitions)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return sequenceArray;
}, [data, minTransitions, minDuration, sequenceLength]);

  const totalSequences = sequences.reduce((sum, s) => sum + s.count, 0);
  const uniqueAppsInvolved = new Set(sequences.flatMap(s => s.apps)).size;

  const avgSequenceTime = sequences.length > 0 
    ? sequences.reduce((sum, s) => {
        const totalDuration = (s.durations || []).reduce((a, b) => a + b, 0);
        return sum + totalDuration;
      }, 0) / sequences.length
    : 0;

  const rapidSwitches = sequences.filter(s => {
    const totalDuration = (s.durations || []).reduce((a, b) => a + b, 0);
    return totalDuration < 30;
  }).length;
  
  const flowDisruptionRate = sequences.length > 0 
    ? Math.round((rapidSwitches / sequences.length) * 100)
    : 0;

  const patternCounts = {
    loop: sequences.filter(s => s.pattern === 'loop').length,
    focused: sequences.filter(s => s.pattern === 'focused').length,
    workflow: sequences.filter(s => s.pattern === 'workflow').length,
    distraction: sequences.filter(s => s.pattern === 'distraction').length,
  };

  const totalDistractionTime = sequences
    .filter(s => s.pattern === 'distraction')
    .reduce((sum, s) => {
      const entertainmentIdx = s.categories.findIndex(c => c === 'Entertainment');
      return sum + (s.durations?.[entertainmentIdx] || 0) * s.count;
    }, 0);

  return (
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className="p-2 rounded-lg bg-blue-600/30">

            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">App Transition Patterns</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
            {[2, 3, 4, 5].map((length) => (
              <button
                key={length}
                onClick={() => setSequenceLength(length as 2 | 3 | 4 | 5)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  sequenceLength === length
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {length}-Step
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-blue-300 text-xs font-semibold bg-blue-900/30 px-2 py-1 rounded border border-blue-700/30 hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              PATTERNS
            </button>
            
            {showTooltip && (
              <>
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                  <div className="text-xs text-gray-300 space-y-2">
                    <p className="font-semibold text-white mb-1">Workflow Sequence Patterns</p>
                    
                    <p>
                      Tracks your multi-step workflows to identify productivity patterns and interruptions.
                    </p>

                    <div className="space-y-1 pt-2">
                      <p><strong className="text-blue-400">🔄 Loops:</strong> Returns to starting app (Test → Code → Test)</p>
                      <p><strong className="text-green-400">🎯 Focused:</strong> Same category, no loop (Code → Terminal → File Explorer)</p>
                      <p><strong className="text-purple-400">⚡ Workflow:</strong> Cross-category sequences (normal work)</p>
                      <p><strong className="text-red-400">⚠️ Distraction:</strong> Entertainment interruption (≤5min) that returns to same app</p>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-700 italic">
                      Use Min Duration filter to remove accidental app switches and noise.
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
  Analyzing {sequenceLength}-step sequences • Filtering sessions ≥{minDuration}s • Min {minTransitions} occurrences
  {patternCounts.distraction > 0 && (
    <span className="ml-2 text-red-400">
      • {Math.round(totalDistractionTime / 60)}min lost to distractions
    </span>
  )}
</p>

              {/*Sliders + Pattern Pills */}
        <div className="mb-4 flex items-center justify-between gap-4">
          {/* Left: Two Sliders */}
          <div className="flex items-center gap-6">
            {/* Min Duration */}
            {/* Min Duration */}
                    <div className="w-full md:w-auto relative flex flex-col md:flex-row items-start md:items-center gap-2">
                        <label
                            className="text-sm text-gray-400 whitespace-nowrap cursor-help"
                            onMouseEnter={() => setHoveredSlider('duration')}
                            onMouseLeave={() => setHoveredSlider(null)}
                        >
                            Min Duration: <span className="text-white font-semibold">{minDuration}s</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={minDuration}
                            onChange={(e) => setMinDuration(Number(e.target.value))}
                            className="w-full md:w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
      
              {hoveredSlider === 'duration' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-50">
                  <div className="text-xs text-gray-300">
                    <p><strong className="text-white">Min Duration Filter:</strong> Excludes app sessions shorter than this value. Use to filter out accidental switches and noise.</p>
                  </div>
                  <div className="absolute bottom-full left-4 -mb-1 w-2 h-2 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
                </div>
              )}
            </div>

            {/* Min Occurrences */}
                               <div className="w-full md:w-auto relative flex flex-col md:flex-row items-start md:items-center gap-2">
                        <label
                            className="text-sm text-gray-400 whitespace-nowrap cursor-help"
                            onMouseEnter={() => setHoveredSlider('occurrences')}
                            onMouseLeave={() => setHoveredSlider(null)}
                        >
                            Min Occurrences: <span className="text-white font-semibold">{minTransitions}</span>
                        </label>
                        <input
                            type="range"
                            min="3"
                            max="20"
                            step="1"
                            value={minTransitions}
                            onChange={(e) => setMinTransitions(Number(e.target.value))}
                            className="w-full md:w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
      
              {hoveredSlider === 'occurrences' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-50">
                  <div className="text-xs text-gray-300">
                    <p><strong className="text-white">Min Occurrences Filter:</strong> Only shows patterns that occurred at least this many times. Higher values reveal your most frequent workflows.</p>
                  </div>
                  <div className="absolute bottom-full left-4 -mb-1 w-2 h-2 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Pattern Pills */}
{/* Right: Pattern Pills */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-cyan-900/30 border border-cyan-800/50 rounded-full px-3 py-1">
                    <span className="text-cyan-400">🔄</span>
                    <span className="text-cyan-300 font-semibold">{patternCounts.loop}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-900/30 border border-green-800/50 rounded-full px-3 py-1">
                    <span className="text-green-400">🎯</span>
                    <span className="text-green-300 font-semibold">{patternCounts.focused}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-purple-900/30 border border-purple-800/50 rounded-full px-3 py-1">
                    <span className="text-purple-400">⚡</span>
                    <span className="text-purple-300 font-semibold">{patternCounts.workflow}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-900/30 border border-red-800/50 rounded-full px-3 py-1">
                    <span className="text-red-400">⚠️</span>
                    <span className="text-red-300 font-semibold">{patternCounts.distraction}</span>
                  </div>
                </div>
        </div>
      {/* Stats Row with Hover Tooltips */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Total Patterns</p>
          <p className="text-xl font-bold text-blue-400">{sequences.length}</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Unique Apps</p>
          <p className="text-xl font-bold text-purple-400">{uniqueAppsInvolved}</p>
        </div>
        
        {/* Avg Sequence Time - WITH TOOLTIP BELOW */}
        <div 
          className="relative bg-gray-800/50 rounded-lg p-3 border border-gray-700 cursor-help"
          onMouseEnter={() => setHoveredStat('avgTime')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <p className="text-xs text-gray-400 mb-1">Avg Sequence Time</p>
          <p className="text-xl font-bold text-green-400">
            {avgSequenceTime < 60 
              ? `${Math.round(avgSequenceTime)}s`
              : `${Math.round(avgSequenceTime / 60)}m`
            }
          </p>
  
        {hoveredStat === 'avgTime' && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-50">
            <div className="text-xs text-gray-300">
              <p><strong className="text-white">Average Sequence Time:</strong> How long it takes to complete a typical workflow pattern. Lower = quick switches, Higher = sustained focus.</p>
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-2 h-2 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
          </div>
        )}
        </div>

        {/* Rapid Switch - WITH TOOLTIP BELOW */}
        <div 
          className="relative bg-gray-800/50 rounded-lg p-3 border border-gray-700 cursor-help"
          onMouseEnter={() => setHoveredStat('rapidSwitch')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <p className="text-xs text-gray-400 mb-1">Rapid Switch</p>
          <p className="text-xl font-bold text-orange-400">{flowDisruptionRate}%</p>
  
        {hoveredStat === 'rapidSwitch' && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-50">
            <div className="text-xs text-gray-300">
              <p><strong className="text-white">Rapid Switch Rate:</strong> Percentage of sequences completed in under 30 seconds. High % indicates fragmented attention and frequent context switching.</p>
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-2 h-2 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
          </div>
        )}
        </div>
      </div>

      {/* Sequences List */}
      {sequences.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {sequences.map((sequence, index) => {
            const key = sequence.apps.join('-');
            const patternEmoji = {
              loop: '🔄',
              focused: '🎯',
              workflow: '⚡',
              distraction: '⚠️'
            }[sequence.pattern];

            const patternColor = {
              loop: 'border-cyan-700 bg-cyan-900/20',
              focused: 'border-green-700 bg-green-900/20',
              workflow: 'border-purple-700 bg-purple-900/20',
              distraction: 'border-red-700 bg-red-900/20'
            }[sequence.pattern];

            return (
              <div
                key={key}
                className={`relative rounded-lg p-4 border-2 transition-all ${
                  hoveredSequence === key
                    ? 'shadow-xl border-opacity-100 z-10'
                    : 'border-opacity-50'
                } ${patternColor}`}
                onMouseEnter={() => setHoveredSequence(key)}
                onMouseLeave={() => setHoveredSequence(null)}
                style={{
                  transform: hoveredSequence === key ? 'translateY(-2px)' : 'none',
                  position: 'relative',
                }}
              >
                <div className="absolute -top-2 -left-2 bg-gray-900 border border-gray-700 rounded-full w-7 h-7 flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                </div>

                <div className="absolute -top-2 -right-2 bg-gray-900 border border-gray-700 rounded-full w-7 h-7 flex items-center justify-center z-10">
                  <span className="text-sm">{patternEmoji}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3 mt-1">
                  {sequence.apps.map((app, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-gray-800/70 rounded-lg px-3 py-1.5 border border-gray-700">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[sequence.categories[idx]] }}
                        />
                        <span className="text-sm font-medium text-white truncate max-w-[150px]">
                          {app}
                        </span>
                      </div>
                      {idx < sequence.apps.length - 1 && (
                        // Show bidirectional arrow for 2-step, directional for 3+
                        sequenceLength === 2 ? (
                          // Bidirectional arrow for 2-step sequences
                          <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        ) : (
                          // Directional arrow for 3+ step sequences
                          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-xs">
                    <span className="text-gray-400">
                      Occurred <strong className="text-white">{sequence.count}</strong> times
                    </span>
                    <span className="text-gray-400 capitalize">
                      Pattern: <strong className="text-white">{sequence.pattern}</strong>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {((sequence.count / totalSequences) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-gray-500">No sequences found with current filter settings</p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}
