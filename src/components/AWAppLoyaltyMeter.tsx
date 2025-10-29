// components/AWAppLoyaltyMeter.tsx
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

interface AppLoyalty {
  appName: string;
  category: AppCategory;
  totalTime: number;
  sessionCount: number;
  daysActive: number;
  loyaltyScore: number;
  avgSessionLength: number;
  avgDailyTime: number;
  avgSessionsPerDay: number;
  tier: 'loyal' | 'committed' | 'regular' | 'casual';
  peakDay: string;
  peakDayAvgTime: number;
  leastDay: string;
  leastDayAvgTime: number;
}

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

const formatTimeCompact = (minutes: number): string => {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AWAppLoyaltyMeter({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [minDailyTime, setMinDailyTime] = useState<0 | 30 | 60 | 180>(0);

  const loyaltyData = useMemo(() => {
    const appStats = new Map<string, {
      totalTime: number;
      sessionCount: number;
      daysActive: Set<string>;
      dailyTimeMap: Map<string, number>; // dateKey -> total minutes that day
      dayUsage: Map<number, { time: number; sessions: number }>;
    }>();

    data.forEach((row) => {
      const appName = row.appName;
      const date = new Date(row.timestamp);
      const dateKey = date.toDateString();
      const dayOfWeek = date.getDay();

      if (!appStats.has(appName)) {
        appStats.set(appName, {
          totalTime: 0,
          sessionCount: 0,
          daysActive: new Set(),
          dailyTimeMap: new Map(),
          dayUsage: new Map(),
        });
      }

      const stats = appStats.get(appName)!;
      stats.totalTime += row.duration / 60;
      stats.sessionCount += 1;
      stats.daysActive.add(dateKey);
      
      // Sum time per date
      stats.dailyTimeMap.set(dateKey, (stats.dailyTimeMap.get(dateKey) || 0) + row.duration / 60);

      if (!stats.dayUsage.has(dayOfWeek)) {
        stats.dayUsage.set(dayOfWeek, { time: 0, sessions: 0 });
      }
      const dayStats = stats.dayUsage.get(dayOfWeek)!;
      dayStats.time += row.duration / 60;
      dayStats.sessions += 1;
    });

    const allDays = new Set<string>();
    data.forEach((row) => {
      allDays.add(new Date(row.timestamp).toDateString());
    });
    const totalDays = allDays.size;

    const dayOfWeekCounts = new Map<number, number>();
    allDays.forEach((dateStr) => {
      const dayOfWeek = new Date(dateStr).getDay();
      dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);
    });

    const apps: AppLoyalty[] = Array.from(appStats.entries()).map(([appName, stats]) => {
      const daysActive = stats.daysActive.size;
      const avgSessionLength = stats.totalTime / stats.sessionCount;
      
      // CORRECT: Sum all daily totals, then divide by number of active days
      const totalDailyTime = Array.from(stats.dailyTimeMap.values()).reduce((sum, val) => sum + val, 0);
      const avgDailyTime = totalDailyTime / daysActive;
      
      const avgSessionsPerDay = stats.sessionCount / totalDays;
      
      const consistencyScore = (daysActive / totalDays) * 100;
      const engagementScore = Math.min((stats.sessionCount / totalDays) * 10, 100);
      const commitmentScore = Math.min((stats.totalTime / totalDays) * 2, 100);
      
      const loyaltyScore = (consistencyScore * 0.5) + (engagementScore * 0.3) + (commitmentScore * 0.2);

      let tier: 'loyal' | 'committed' | 'regular' | 'casual';
      if (loyaltyScore >= 75) tier = 'loyal';
      else if (loyaltyScore >= 50) tier = 'committed';
      else if (loyaltyScore >= 25) tier = 'regular';
      else tier = 'casual';

      let peakDay = 'N/A';
      let peakDayAvgTime = 0;
      let leastDay = 'N/A';
      let leastDayAvgTime = 0;
      let maxAvgTime = 0;
      let minAvgTime = Infinity;

      stats.dayUsage.forEach((dayStats, day) => {
        const dayCount = dayOfWeekCounts.get(day) || 1;
        const avgTimeForDay = dayStats.time / dayCount;
        
        if (avgTimeForDay > maxAvgTime) {
          maxAvgTime = avgTimeForDay;
          peakDay = DAYS[day];
          peakDayAvgTime = avgTimeForDay;
        }
        if (avgTimeForDay < minAvgTime) {
          minAvgTime = avgTimeForDay;
          leastDay = DAYS[day];
          leastDayAvgTime = avgTimeForDay;
        }
      });

      if (stats.dayUsage.size < 7) {
        const unusedDays = DAYS.filter((_, idx) => !stats.dayUsage.has(idx));
        if (unusedDays.length > 0) {
          leastDay = unusedDays[0];
          leastDayAvgTime = 0;
        }
      }

      return {
        appName,
        category: categorizeApp(appName),
        totalTime: stats.totalTime,
        sessionCount: stats.sessionCount,
        daysActive,
        loyaltyScore,
        avgSessionLength,
        avgDailyTime,
        avgSessionsPerDay,
        tier,
        peakDay,
        peakDayAvgTime,
        leastDay,
        leastDayAvgTime,
      };
    });

    return apps
      .filter(app => app.avgDailyTime >= minDailyTime)
      .sort((a, b) => b.loyaltyScore - a.loyaltyScore)
      .slice(0, 15);
  }, [data, minDailyTime]);

  const tierCounts = {
    'loyal': loyaltyData.filter(a => a.tier === 'loyal').length,
    'committed': loyaltyData.filter(a => a.tier === 'committed').length,
    'regular': loyaltyData.filter(a => a.tier === 'regular').length,
    'casual': loyaltyData.filter(a => a.tier === 'casual').length,
  };

  const getTierColor = (tier: string) => {
    const colors = {
      'loyal': 'border-yellow-600 bg-yellow-900/20',
      'committed': 'border-purple-600 bg-purple-900/20',
      'regular': 'border-blue-600 bg-blue-900/20',
      'casual': 'border-gray-600 bg-gray-900/20',
    };
    return colors[tier as keyof typeof colors];
  };

  const getTierEmoji = (tier: string) => {
    const emojis = {
      'loyal': '👑',
      'committed': '💎',
      'regular': '⭐',
      'casual': '🌙',
    };
    return emojis[tier as keyof typeof emojis];
  };

    return (
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            {/* Header with filter and badge */}
            <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                        {/* (SVG Icon) */}
                        <h3 className="text-lg font-semibold text-gray-100">App Loyalty Meter</h3>
                    </div>
                    <p className="text-xs text-gray-400">Your most consistent and engaged apps (top 15)</p>
                </div>

                {/* Wrapper for Filter & Badge */}
                <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                    
                    {/* Filter Toggle Buttons */}
                    <div className="order-2 flex grow rounded-lg border border-gray-700 bg-gray-900 p-1 sm:order-1">
                        {[
                            { value: 0, label: 'All' },
                            { value: 30, label: '>30min' },
                            { value: 60, label: '>1hr' },
                            { value: 180, label: '>3hr' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setMinDailyTime(option.value as 0 | 30 | 60 | 180)}
                                className={`w-full px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    minDailyTime === option.value
                                        ? 'bg-yellow-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Badge */}
                    <div className="relative order-1 sm:order-2">
                        <button
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            onClick={() => setShowTooltip(!showTooltip)}
                            className="w-full text-yellow-300 text-xs font-semibold bg-yellow-900/30 px-2 py-1 rounded border border-yellow-700/30 hover:bg-yellow-900/50 transition-colors cursor-pointer sm:w-auto"
                        >
                            LOYALTY
                        </button>

            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                <div className="font-semibold text-gray-100 mb-2">
                  Loyalty Score Formula
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  Measures how consistently you return to apps based on: daily usage frequency (50%), sessions per day (30%), and total time commitment (20%).
                </div>

                <div className="text-xs text-gray-400 mb-3 pb-3 border-b border-gray-700">
                  <strong className="text-gray-300">Filter:</strong> Shows only apps with average daily usage greater than the selected threshold (All, &gt;30min, &gt;1hr, &gt;3hr).
                </div>
                
                <div className="space-y-1 text-xs">
                  <div><span className="text-yellow-400">👑 Loyal:</span> 75%+ loyalty</div>
                  <div><span className="text-purple-400">💎 Committed:</span> 50-75% loyalty</div>
                  <div><span className="text-blue-400">⭐ Regular:</span> 25-50% loyalty</div>
                  <div><span className="text-gray-400">🌙 Casual:</span> &lt;25% loyalty</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded p-2">
          <div className="text-xs text-yellow-400 mb-1">👑 Loyal</div>
          <div className="text-xl font-bold text-yellow-300">{tierCounts['loyal']}</div>
        </div>
        <div className="bg-purple-900/20 border border-purple-800/50 rounded p-2">
          <div className="text-xs text-purple-400 mb-1">💎 Committed</div>
          <div className="text-xl font-bold text-purple-300">{tierCounts['committed']}</div>
        </div>
        <div className="bg-blue-900/20 border border-blue-800/50 rounded p-2">
          <div className="text-xs text-blue-400 mb-1">⭐ Regular</div>
          <div className="text-xl font-bold text-blue-300">{tierCounts['regular']}</div>
        </div>
        <div className="bg-gray-900/20 border border-gray-800/50 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">🌙 Casual</div>
          <div className="text-xl font-bold text-gray-300">{tierCounts['casual']}</div>
        </div>
      </div>

      {/* Apps List */}
      <div className="space-y-2 max-h-[330px] overflow-y-auto">
        {loyaltyData.length > 0 ? (
          loyaltyData.map((app) => (
            <div
              key={app.appName}
              className={`rounded-lg p-3 border-2 ${getTierColor(app.tier)} transition-all hover:shadow-xl hover:border-opacity-100`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0">{getTierEmoji(app.tier)}</span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[app.category] }} />
                    <span className="text-sm font-semibold text-gray-100 truncate">{app.appName}</span>
                    <span className="text-gray-600 flex-shrink-0">•</span>
                    <span className="text-xs text-gray-400 capitalize flex-shrink-0">{app.category}</span>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-full px-3 py-1 border border-gray-700 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-100">{Math.round(app.loyaltyScore)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="bg-gray-900/30 rounded p-2">
                  <div className="text-gray-500 mb-0.5">Avg Min/Day</div>
                  <div className="text-gray-200 font-semibold">{formatTimeCompact(app.avgDailyTime)}</div>
                </div>
                <div className="bg-gray-900/30 rounded p-2">
                  <div className="text-gray-500 mb-0.5">Avg Sessions/Day</div>
                  <div className="text-gray-200 font-semibold">{formatNumber(app.avgSessionsPerDay)}</div>
                </div>
                <div className="bg-gray-900/30 rounded p-2">
                  <div className="text-gray-500 mb-0.5">Peak Day</div>
                  <div className="text-green-400 font-semibold">
                    {app.peakDay}
                    <span className="text-gray-500 text-[10px] ml-1">({formatTimeCompact(app.peakDayAvgTime)})</span>
                  </div>
                </div>
                <div className="bg-gray-900/30 rounded p-2">
                  <div className="text-gray-500 mb-0.5">Least Day</div>
                  <div className="text-red-400 font-semibold">
                    {app.leastDay}
                    <span className="text-gray-500 text-[10px] ml-1">({formatTimeCompact(app.leastDayAvgTime)})</span>
                  </div>
                </div>
                <div className="bg-gray-900/30 rounded p-2">
                  <div className="text-gray-500 mb-0.5">Active Days</div>
                  <div className="text-gray-200 font-semibold">{app.daysActive}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">No apps match the current filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
