// components/AWDevelopmentStats.tsx
import { useMemo, useState } from 'react';
import {
  formatDuration,
  getLanguageFromActivity,
  isDevApp
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

export default function AWDevelopmentStats({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const stats = useMemo(() => {
    const devData = data.filter(entry => isDevApp(entry.appName));
    
    // Language totals
    const languageTotals = new Map<string, number>();
    let totalFiles = 0;
    const uniqueFiles = new Set<string>();

    devData.forEach(entry => {
    const language = getLanguageFromActivity(entry.title, entry.appName);
      
      if (language) {
        languageTotals.set(language, (languageTotals.get(language) || 0) + entry.duration / 3600);
        
        // Track unique files
        const match = entry.title?.match(/([^\\/]+)\.\w+\s*[-*]/);
        if (match) {
          uniqueFiles.add(match[1]);
          totalFiles++;
        }
      }
    });

    const totalHours = Array.from(languageTotals.values()).reduce((sum, h) => sum + h, 0);
    const sortedLanguages = Array.from(languageTotals.entries()).sort((a, b) => b[1] - a[1]);

    // Daily stats
    const dailyHours = new Map<string, number>();
    devData.forEach(entry => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toDateString();
      
      const language = getLanguageFromActivity(entry.title, entry.appName);

      if (language) {
        dailyHours.set(dateKey, (dailyHours.get(dateKey) || 0) + entry.duration / 3600);
      }
    });

    const days = Array.from(dailyHours.values());
    const maxDayHours = Math.max(...days, 0);
    const avgDayHours = days.length > 0 ? days.reduce((sum, h) => sum + h, 0) / days.length : 0;

    // Find longest streak
    const sortedDates = Array.from(dailyHours.keys())
      .map(k => new Date(k))
      .sort((a, b) => a.getTime() - b.getTime());

    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;

    sortedDates.forEach(date => {
      if (prevDate) {
        const dayDiff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      prevDate = date;
    });
    longestStreak = Math.max(longestStreak, currentStreak);

    // First and last activity
    const timestamps = devData.map(e => e.timestamp.getTime());
    const firstActivity = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
    const lastActivity = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;
    
    const daysSinceFirst = firstActivity ? Math.floor((Date.now() - firstActivity.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Dynamic insight
    let insight = 'Your lifetime development statistics';
    const daysPerWeek = dailyHours.size > 0 ? (dailyHours.size / Math.max(daysSinceFirst / 7, 1)).toFixed(1) : '0';
    const hoursPerDay = dailyHours.size > 0 ? (totalHours / dailyHours.size).toFixed(1) : '0';
    
    if (dailyHours.size >= 7) {
      insight = `You code an average of ${daysPerWeek} days/week with ${hoursPerDay}h per active day`;
    } else if (totalHours >= 100) {
      insight = `You've invested ${totalHours.toFixed(0)} hours across ${sortedLanguages.length} languages`;
    } else if (longestStreak > 1) {
      insight = `Your longest coding streak is ${longestStreak} consecutive days`;
    }

    return {
      totalHours,
      languageCount: languageTotals.size,
      topLanguage: sortedLanguages[0] || null,
      uniqueFilesCount: uniqueFiles.size,
      activeDays: dailyHours.size,
      maxDayHours,
      avgDayHours,
      longestStreak,
      firstActivity,
      lastActivity,
      daysSinceFirst,
      languageBreakdown: sortedLanguages.slice(0, 5),
      dynamicInsight: insight
    };
  }, [data]);

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-600/30">
            <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Development Statistics</h2>
            <p className="text-xs text-gray-400">
              All-time records <span className="text-[10px] italic opacity-70">est. Oct 2025</span>
            </p>

          </div>
        </div>
        
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-emerald-300 text-xs font-semibold bg-emerald-900/30 px-2 py-1 rounded border border-emerald-700/30 hover:bg-emerald-900/50 transition-colors cursor-pointer"
          >
            STATS
          </button>
          
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-[100] w-80">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Historical Statistics</p>
                <p>
                  Comprehensive lifetime development metrics including total hours, language breakdown, personal bests, and activity patterns.
                </p>
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-gray-400 italic">
                    {stats.dynamicInsight}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {stats.totalHours === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="p-4 rounded-full bg-gray-700/30 mb-3">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-semibold">No Statistics Available</p>
          <p className="text-gray-500 text-xs">Start coding to generate development stats</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Lifetime Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
              <p className="text-xs text-gray-400 mb-1">Total Development Time</p>
             <p className="text-4xl font-bold text-green-400 font-mono">
                {formatDuration(stats.totalHours)}
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
              <p className="text-xs text-gray-400 mb-1">Languages Used</p>
              <p className="text-2xl font-bold text-white">{stats.languageCount.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 mt-1">{stats.topLanguage?.[0] || 'N/A'} (Primary)</p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
              <p className="text-xs text-gray-400 mb-1">Active Days</p>
              <p className="text-2xl font-bold text-white">{stats.activeDays.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 mt-1">Across {stats.daysSinceFirst.toLocaleString()} days tracked</p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
              <p className="text-xs text-gray-400 mb-1">Unique Files</p>
              <p className="text-2xl font-bold text-white">{stats.uniqueFilesCount.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 mt-1">Distinct code files</p>
            </div>
          </div>

         

          {/* Language Breakdown */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <p className="text-xs font-semibold text-gray-400 mb-3">Lifetime Language Breakdown</p>
            <div className="space-y-2">
              {stats.languageBreakdown.map(([lang, hours], idx) => {
                const percentage = (hours / stats.totalHours) * 100;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-300">{lang}</span>
                      <span className="text-xs text-gray-400 font-mono">{formatDuration(hours)} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
           {/* Personal Bests */}
          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-700/50">
            <p className="text-sm font-semibold text-yellow-300 mb-3 flex items-center gap-2">
              <span>🏆</span> Personal Bests
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Most Productive Day</span>
                <span className="text-sm font-bold text-white font-mono">{formatDuration(stats.maxDayHours)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Longest Streak</span>
                <span className="text-sm font-bold text-white">{stats.longestStreak.toLocaleString()} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Daily Average</span>
                <span className="text-sm font-bold text-white font-mono">{formatDuration(stats.avgDayHours)}</span>
              </div>
            </div>
          </div>
          {/* Timeline */}
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="text-gray-400">First Activity</p>
                <p className="text-white font-semibold mt-0.5">
                  {stats.firstActivity?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex-1 mx-4 h-px bg-gradient-to-r from-gray-700 via-blue-500 to-gray-700" />
              <div className="text-right">
                <p className="text-gray-400">Latest Activity</p>
                <p className="text-white font-semibold mt-0.5">
                  {stats.lastActivity?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-500 mt-2">
              {stats.daysSinceFirst.toLocaleString()} days of tracked development
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
