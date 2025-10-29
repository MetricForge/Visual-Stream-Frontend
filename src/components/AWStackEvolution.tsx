// components/AWStackEvolution.tsx
import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LANGUAGE_COLORS, 
  getLanguageFromActivity, 
  isDevApp,
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
  weeksToShow?: number;
}

export default function AWStackEvolution({ data, weeksToShow = 13 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { chartData, allLanguages, trendAnalysis, dynamicInsight } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create week buckets WITH Map for languages (the working approach)
    const weeks: Array<{ weekStart: Date; weekLabel: string; languages: Map<string, number> }> = [];
    
    for (let i = weeksToShow - 1; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      
      weeks.push({
        weekStart,
        weekLabel: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        languages: new Map()
      });
    }
    
    // Filter dev app data
    const devData = data.filter(entry => isDevApp(entry.appName));
    
    // Aggregate hours per language per week
    devData.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      
      // Find which week this entry belongs to
      const week = weeks.find(w => {
        const weekEnd = new Date(w.weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return entryDate >= w.weekStart && entryDate < weekEnd;
      });
      
      if (!week) return;
      
      const language = getLanguageFromActivity(entry.title, entry.appName);
      
      if (language) {
        week.languages.set(language, (week.languages.get(language) || 0) + entry.duration / 3600);
      }
    });
    
    // Get all unique languages
    const languageSet = new Set<string>();
    weeks.forEach(week => {
      week.languages.forEach((_, lang) => languageSet.add(lang));
    });
    
    // Sort by total usage
    const languageTotals = new Map<string, number>();
    languageSet.forEach(lang => {
      const total = weeks.reduce((sum, week) => sum + (week.languages.get(lang) || 0), 0);
      languageTotals.set(lang, total);
    });
    
    const sortedLanguages = Array.from(languageTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);
    
    // Convert to chart format (this is the key - convert Map to object properties)
    const chart = weeks.map(week => {
      const point: any = { 
        weekLabel: week.weekLabel,
        weekStart: week.weekStart 
      };
      sortedLanguages.forEach(lang => {
        point[lang] = week.languages.get(lang) || 0;
      });
      return point;
    });
    
    // Calculate week-over-week trends
      const trends = new Map<string, number>();
  
      if (weeks.length >= 2) {
        const lastWeek = weeks[weeks.length - 1];
        const previousWeek = weeks[weeks.length - 2];

        sortedLanguages.forEach(language => {
          const lastWeekHours = lastWeek.languages.get(language) || 0;
          const previousWeekHours = previousWeek.languages.get(language) || 0;
      
          let percentChange = 0;
          if (previousWeekHours === 0 && lastWeekHours > 0) {
            percentChange = 100;
          } else if (previousWeekHours > 0) {
            percentChange = ((lastWeekHours - previousWeekHours) / previousWeekHours) * 100;
          }
      
          trends.set(language, Math.round(percentChange));
        });
      }
  
      // Generate dynamic insight
      let insight = 'Tracking your technology stack evolution over time';
  
      if (sortedLanguages.length > 0 && trends.size > 0) {
        const growing = Array.from(trends.entries())
          .filter(([_, change]) => change > 20)
          .sort((a, b) => b[1] - a[1])[0];
    
        const declining = Array.from(trends.entries())
          .filter(([_, change]) => change < -20)
          .sort((a, b) => a[1] - b[1])[0];

        if (growing) {
          insight = `Strongest growth: ${growing[0]} up ${growing[1]}% this week`;
        } else if (declining) {
          insight = `Notable shift: ${declining[0]} down ${Math.abs(declining[1])}% this week`;
        } else {
          insight = `Stack composition is stable with ${sortedLanguages.length} active languages`;
        }
      }
  
      return {
        chartData: chart,
        allLanguages: sortedLanguages,
        trendAnalysis: trends,
        dynamicInsight: insight  
      };
    }, [data, weeksToShow]);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
  
  // Get the week range
  const weekStart = payload[0]?.payload?.weekStart;
  let dateRangeLabel = label;
  
  if (weekStart) {
    const startDate = new Date(weekStart);
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6); // 7 days inclusive
    
    dateRangeLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-white mb-2">{dateRangeLabel}</p>
      <p className="text-xs text-gray-400 mb-2">Total: {formatDuration(total)}</p>
      {payload
        .sort((a: any, b: any) => b.value - a.value)
        .filter((entry: any) => entry.value > 0)
        .map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-gray-300">{entry.name}</span>
            </div>
            <span className="text-white font-mono font-semibold">
              {formatDuration(entry.value)} ({Math.round((entry.value / total) * 100)}%)
            </span>
          </div>
        ))}
    </div>
  );
};

  if (allLanguages.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg h-full flex flex-col items-center justify-center">
        <p className="text-gray-400 text-sm">No Historical Data</p>
        <p className="text-gray-500 text-xs mt-1">Need {weeksToShow}+ weeks of development activity</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-600/30">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Technology Evolution</h2>
            <p className="text-xs text-gray-400">Last {weeksToShow} weeks</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-purple-300 text-xs font-semibold bg-purple-900/30 px-2 py-1 rounded border border-purple-700/30 hover:bg-purple-900/50 transition-colors cursor-pointer"
          >
            EVOLUTION
          </button>
          
          {showTooltip && (
          <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-[100] w-80">
            <div className="text-xs text-gray-300 space-y-2">
              <p className="font-semibold text-white mb-1">Technology Evolution</p>
              <p>
                Visualizes week-over-week changes in programming language usage, revealing skill diversification and project focus shifts over time.
              </p>
              <div className="pt-2 border-t border-gray-700">
                <p className="text-gray-400 italic">
                  {dynamicInsight}
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      {/* Stacked Area Chart */}
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="weekLabel" 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickLine={{ stroke: '#4B5563' }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickLine={{ stroke: '#4B5563' }}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />

            {allLanguages.map((language) => (
              <Area
                key={language}
                type="monotone"
                dataKey={language}
                stackId="1"
                stroke={LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Other']}
                fill={LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Other']}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Summary - Week over Week */}
      {allLanguages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-gray-400">Week-over-Week:</p>
            <div className="flex flex-wrap gap-3">
              {allLanguages.slice(0, 8).map((lang, idx) => {
                const percentChange = trendAnalysis.get(lang) || 0;
                const isPositive = percentChange > 0;
                const isNeutral = percentChange === 0;
                
                return (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: LANGUAGE_COLORS[lang] || LANGUAGE_COLORS['Other'] }}
                    />
                    <span className="text-gray-300">{lang}</span>
                    <span className={`${
                      isNeutral ? 'text-gray-500' : 
                      isPositive ? 'text-green-400' : 
                      'text-orange-400'
                    }`}>
                      {isPositive ? '+' : ''}{percentChange}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
