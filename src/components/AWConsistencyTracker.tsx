// components/AWConsistencyTracker.tsx
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

interface DayActivity {
  date: Date;
  hasActivity: boolean;
  isProductive: boolean;
  isToday: boolean;
  dayLabel: string;
}

interface CategoryConsistency {
  category: AppCategory;
  daysActive: number;
  totalDays: number;
  percentage: number;
}

// helper function for emoji based on streak length
const getStreakEmoji = (streak: number): string => {
  if (streak === 0) return '💤'; // Sleeping/inactive
  if (streak === 1) return '🌱'; // Just starting/seedling
  if (streak >= 2 && streak <= 3) return '✨'; // Sparkling/building
  if (streak >= 4 && streak <= 6) return '⚡'; // Lightning/momentum
  if (streak >= 7 && streak <= 13) return '🔥'; // Fire/strong
  if (streak >= 14 && streak <= 29) return '💪'; // Strong/consistent
  return '🏆'; // Trophy/champion (30+ days)
};


const PRODUCTIVE_CATEGORIES: AppCategory[] = ['Development', 'Testing & QA', 'Operations', 'Tools'];
const PRODUCTIVE_THRESHOLD_HOURS = 4;

export default function AWConsistencyTracker({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { productiveStreak, weeklyStats, consistencyScore, calendar, categoryConsistency, insight } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Group by date
    const dailyData = new Map<string, { categories: Map<AppCategory, number>; total: number }>();
    
    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toDateString();
      
      if (date.getTime() === today.getTime()) {
        return;
      }
      
      const category = categorizeApp(entry.appName);
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, { categories: new Map(), total: 0 });
      }
      
      const dayData = dailyData.get(dateKey)!;
      dayData.categories.set(category, (dayData.categories.get(category) || 0) + entry.duration);
      dayData.total += entry.duration;
    });
    
    // Determine productive days
    const productiveDays = new Set<string>();
    
    dailyData.forEach((dayData, dateKey) => {
      let productiveHours = 0;
      PRODUCTIVE_CATEGORIES.forEach(cat => {
        productiveHours += (dayData.categories.get(cat) || 0) / 3600;
      });
      
      if (productiveHours >= PRODUCTIVE_THRESHOLD_HOURS) {
        productiveDays.add(dateKey);
      }
    });
    
    // Calculate productive streak
    let streak = 0;
    let checkDate = new Date(yesterday);
    
    while (productiveDays.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Create last 14 days calendar
    const calendarDays: DayActivity[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();
      
      calendarDays.push({
        date,
        hasActivity: dailyData.has(dateKey),
        isProductive: productiveDays.has(dateKey),
        isToday: i === 0,
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)
      });
    }
    
    // Weekly stats
    const lastWeek = calendarDays.slice(-8, -1);
    const weeklyProductiveDays = lastWeek.filter(d => d.isProductive).length;
    
    // Overall consistency
    const daysWithActivity = calendarDays.filter(d => !d.isToday && d.hasActivity).length;
    const consistency = Math.round((daysWithActivity / 14) * 100);
    
    // Category consistency
    const categoryStats: CategoryConsistency[] = [];
    const allCategories = new Set<AppCategory>();
    
    dailyData.forEach(dayData => {
      dayData.categories.forEach((_, cat) => allCategories.add(cat));
    });
    
    allCategories.forEach(category => {
      let activeDays = 0;
      
      calendarDays.forEach(day => {
        if (day.isToday) return;
        
        const dayData = dailyData.get(day.date.toDateString());
        if (dayData && dayData.categories.has(category)) {
          activeDays++;
        }
      });
      
      categoryStats.push({
        category,
        daysActive: activeDays,
        totalDays: 14,
        percentage: Math.round((activeDays / 14) * 100)
      });
    });
    
    const topCategories = categoryStats
      .sort((a, b) => b.daysActive - a.daysActive)
      .slice(0, 3);
    
    // Generate neutral, professional insight
    const generateInsight = (): string => {
      if (streak >= 7) {
        return `💡 ${streak} consecutive productive days recorded, representing sustained engagement with technical activities exceeding ${PRODUCTIVE_THRESHOLD_HOURS}h daily threshold.`;
      } else if (streak >= 3) {
        return `💡 Current ${streak}-day productive streak indicates consistent engagement. ${weeklyProductiveDays} of last 7 days met productivity threshold.`;
      } else if (weeklyProductiveDays >= 5) {
        return `💡 ${weeklyProductiveDays} productive days achieved this week (${Math.round((weeklyProductiveDays / 7) * 100)}% weekly engagement rate) with ${PRODUCTIVE_THRESHOLD_HOURS}h+ daily activity in technical categories.`;
      } else if (consistency < 30) {
        return `💡 Activity recorded on ${consistency}% of tracked days. ${topCategories[0]?.category || 'Development'} represents primary engagement category at ${topCategories[0]?.percentage || 0}% consistency.`;
      } else {
        return `${weeklyProductiveDays} of 7 days this week met productivity criteria. Overall consistency at ${consistency}% across ${topCategories.length} active categories.`;
      }
    };
    
    return {
      productiveStreak: streak,
      weeklyStats: { productive: weeklyProductiveDays, total: 7 },
      consistencyScore: consistency,
      calendar: calendarDays,
      categoryConsistency: topCategories,
      insight: generateInsight()
    };
  }, [data]);

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-600/30">
            <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Consistency Tracker</h2>
        </div>
        
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-green-300 text-xs font-semibold bg-green-900/30 px-2 py-1 rounded border border-green-700/30 hover:bg-green-900/50 transition-colors cursor-pointer"
          >
            CONSISTENCY
          </button>
          
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-[100] w-80">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Activity Consistency Tracking</p>
                
                <p>
                  Measures consistency in maintaining productive habits. Tracks consecutive "productive days" defined as {PRODUCTIVE_THRESHOLD_HOURS}+ hours in Development, Testing, or Tools categories.
                </p>

                <div className="space-y-1 pt-2">
                  <p><strong className="text-green-400">Productive Streak:</strong> Consecutive days meeting threshold</p>
                  <p><strong className="text-blue-400">Weekly Score:</strong> Productive days in last 7 days</p>
                  <p><strong className="text-purple-400">Category Consistency:</strong> Frequency of engagement per category</p>
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <p className="text-gray-400 italic">
                    Maintaining consistency builds sustainable habits and indicates disciplined engagement patterns.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Section: Streak + Calendar Side by Side */}
      <div className="flex flex-col lg:flex-row gap-6 mb-4">
        {/* Left: Productive Streak */}
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">{getStreakEmoji(productiveStreak)}</span>
            <div>
                <p className="text-5xl font-bold text-white">{productiveStreak}</p>
                <p className="text-gray-400 text-xs">productive day{productiveStreak !== 1 ? 's' : ''}</p>
            </div>
            </div>
            <p className="text-gray-500 text-[10px] text-center max-w-[200px]">
            ({PRODUCTIVE_THRESHOLD_HOURS}+ hours in Development/Testing/Tools)
            </p>
        </div>
        {/* Right: 14-Day Calendar - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-gray-400 text-xs font-semibold mb-2">Last 14 Days</p>
          <div className="flex gap-1 items-end justify-center">
            {calendar.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-4 h-4 rounded transition-colors ${
                    day.isToday
                      ? 'border-2 border-blue-400 bg-gray-700'
                      : day.isProductive
                      ? 'bg-green-500'
                      : day.hasActivity
                      ? 'bg-yellow-600'
                      : 'bg-gray-700'
                  }`}
                  title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${
                    day.isProductive ? ' - Productive' : day.hasActivity ? ' - Active' : ' - Inactive'
                  }`}
                />
                <span className="text-[8px] text-gray-500">{day.dayLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">This Week</p>
          <p className="text-blue-300 text-xl font-bold">
            {weeklyStats.productive}/{weeklyStats.total}
            <span className="text-sm text-gray-400 ml-1">days</span>
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Overall</p>
          <p className="text-cyan-300 text-xl font-bold">
            {consistencyScore}
            <span className="text-sm text-gray-400 ml-1">%</span>
          </p>
        </div>
      </div>

      {/* Category Consistency */}
      <div className="mb-4">
        <p className="text-gray-400 text-xs font-semibold mb-2">Category Consistency</p>
        <div className="space-y-2">
          {categoryConsistency.map((cat, idx) => (
            <div key={idx} className="bg-gray-900/50 rounded-lg p-2 border border-gray-700/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[cat.category] }} />
                  <span className="text-gray-300 text-xs">{cat.category}</span>
                </div>
                <span className="text-white text-sm font-bold">{cat.percentage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${cat.percentage}%`, backgroundColor: COLORS[cat.category] }}
                  />
                </div>
                <span className="text-gray-500 text-[10px] whitespace-nowrap">{cat.daysActive}/14</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Neutral Insight */}
      <div className="mt-auto pt-3 border-t border-gray-700/50">
        <p className="text-gray-400 text-xs leading-relaxed">
          {insight}
        </p>
      </div>
    </div>
  );
}
