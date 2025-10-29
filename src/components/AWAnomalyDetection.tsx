// components/AWAnomalyDetection.tsx
import { useMemo, useState } from 'react';
import { categorizeApp, COLORS, type AppCategory } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

interface Anomaly {
  date: Date;
  dateStr: string;
  dayName: string;
  totalHours: number;
  deviation: number;
  type: 'high' | 'low';
  topCategories: Array<{ category: AppCategory; hours: number }>;
  insight: string;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

function getAnomalyInsight(
  type: 'high' | 'low',
  deviation: number,
  topCategory: AppCategory,
  topCategoryHours: number,
  totalHours: number
): string {
  const absDeviation = Math.abs(deviation);
  const categoryPercentage = (topCategoryHours / totalHours) * 100;
  
  if (type === 'high') {
    // Single category dominance (>70%)
    if (categoryPercentage > 70) {
      return `Concentrated activity in ${topCategory} (${formatDuration(topCategoryHours * 3600)}) drove ${absDeviation.toFixed(0)}% increase above baseline.`;
    }
    // Extreme deviation
    if (absDeviation > 70) {
      return `Significant deviation detected (${absDeviation.toFixed(0)}% above typical), suggesting schedule variation or special event.`;
    }
    // Default high
    return `Activity exceeded baseline by ${absDeviation.toFixed(0)}%, representing elevated engagement for this period.`;
  } else {
    // Low anomaly - extreme
    if (absDeviation > 70) {
      return `Minimal activity detected (${absDeviation.toFixed(0)}% below typical), possibly indicating downtime or schedule gap.`;
    }
    // Default low
    return `Activity registered ${absDeviation.toFixed(0)}% below baseline, indicating reduced engagement for this period.`;
  }
}

export default function AWAnomalyDetection({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const anomalies = useMemo(() => {
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toDateString();
    
    // Group by date and calculate daily totals
    const dailyData = new Map<string, { date: Date; categories: Map<AppCategory, number>; total: number }>();
    
    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toDateString();
      
      // Skip today's data (incomplete)
      if (dateKey === todayStr) {
        return;
      }
      
      const category = categorizeApp(entry.appName);
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date,
          categories: new Map(),
          total: 0
        });
      }
      
      const dayData = dailyData.get(dateKey)!;
      dayData.categories.set(category, (dayData.categories.get(category) || 0) + entry.duration);
      dayData.total += entry.duration;
    });
    
    // Calculate mean and standard deviation (excluding today)
    const totals = Array.from(dailyData.values()).map(d => d.total / 3600);
    
    // Need at least 2 days of data for comparison
    if (totals.length < 2) {
      return [];
    }
    
    const mean = totals.reduce((sum, val) => sum + val, 0) / totals.length;
    const variance = totals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / totals.length;
    const stdDev = Math.sqrt(variance);
    
    // Adaptive threshold based on sample size
    let threshold: number;
    if (totals.length < 7) {
      threshold = 1.0;
    } else if (totals.length < 14) {
      threshold = 1.25;
    } else {
      threshold = 1.5;
    }
    
    // Find anomalies
    const anomalyList: Anomaly[] = [];
    
    dailyData.forEach((dayData) => {
      const hours = dayData.total / 3600;
      const deviation = ((hours - mean) / mean) * 100;
      
      // Check if it's an anomaly using adaptive threshold
      if (Math.abs(hours - mean) > threshold * stdDev) {
        // Get top 3 categories for this day
        const topCategories = Array.from(dayData.categories.entries())
          .map(([category, duration]) => ({
            category,
            hours: duration / 3600
          }))
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 3);
        
        const type = hours > mean ? 'high' : 'low';
        
        // Generate context-aware insight
        const insight = topCategories.length > 0
          ? getAnomalyInsight(
              type,
              deviation,
              topCategories[0].category,
              topCategories[0].hours,
              hours
            )
          : type === 'high'
            ? `Activity exceeded baseline by ${Math.abs(deviation).toFixed(0)}%, representing elevated engagement for this period.`
            : `Activity registered ${Math.abs(deviation).toFixed(0)}% below baseline, indicating reduced engagement for this period.`;
        
        anomalyList.push({
          date: dayData.date,
          dateStr: dayData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dayName: dayData.date.toLocaleDateString('en-US', { weekday: 'long' }),
          totalHours: hours,
          deviation,
          type,
          topCategories,
          insight
        });
      }
    });
    
    // Sort by date (most recent first) and take top 3
    return anomalyList
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3);
    
  }, [data]);

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-600/30">
            <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Anomaly Detection</h2>
        </div>
        
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-orange-300 text-xs font-semibold bg-orange-900/30 px-2 py-1 rounded border border-orange-700/30 hover:bg-orange-900/50 transition-colors cursor-pointer"
          >
            ANOMALIES
          </button>
          
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-[100] w-72">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Unusual Activity Patterns</p>
                
                <p>
                  Detects completed days with activity significantly different from your baseline using adaptive statistical thresholds.
                </p>

                <div className="space-y-1 pt-2">
                  <p><strong className="text-orange-400">High Anomalies:</strong> Unusually high activity days</p>
                  <p><strong className="text-red-400">Low Anomalies:</strong> Unusually low activity days</p>
                  <p><strong className="text-blue-400">Adaptive:</strong> Threshold adjusts based on data availability</p>
                  <p><strong className="text-gray-400">Exclusions:</strong> Today excluded (incomplete data)</p>
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <p className="text-gray-400 italic">
                    Detection sensitivity increases with more historical data for accurate baseline patterns.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Anomaly Cards */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="p-4 rounded-full bg-green-900/20 mb-3">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-semibold mb-1">No Anomalies Detected</p>
            <p className="text-gray-500 text-xs">
              Your activity patterns are consistent with your baseline behavior.
            </p>
          </div>
        ) : (
          anomalies.map((anomaly, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-4 border ${
                anomaly.type === 'high'
                  ? 'bg-orange-900/20 border-orange-700/50'
                  : 'bg-red-900/20 border-red-700/50'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${
                    anomaly.type === 'high' ? 'bg-orange-600/30' : 'bg-red-600/30'
                  }`}>
                    {anomaly.type === 'high' ? (
                      <svg className="w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{anomaly.dayName}</p>
                    <p className="text-gray-400 text-xs">{anomaly.dateStr}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    anomaly.type === 'high' ? 'text-orange-300' : 'text-red-300'
                  }`}>
                    {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(0)}%
                  </p>
                  <p className="text-gray-400 text-xs">{formatDuration(anomaly.totalHours * 3600)}</p>
                </div>
              </div>

              {/* Context-Aware Insight */}
              <p className="text-gray-300 text-xs mb-2 leading-relaxed">
                {anomaly.insight}
              </p>

              {/* Top Categories */}
              {anomaly.topCategories.length > 0 && (
                <div className="pt-2 border-t border-gray-700/50">
                  <p className="text-gray-400 text-xs font-semibold mb-1.5">Top Activities:</p>
                  <div className="flex flex-wrap gap-2">
                    {anomaly.topCategories.map((cat, catIdx) => (
                      <div 
                        key={catIdx}
                        className="flex items-center gap-1.5 bg-gray-900/50 rounded px-2 py-1"
                      >
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: COLORS[cat.category] }}
                        />
                        <span className="text-gray-300 text-xs">{cat.category}</span>
                        <span className="text-gray-400 text-xs">·</span>
                        <span className="text-blue-300 text-xs font-mono">
                          {formatDuration(cat.hours * 3600)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
