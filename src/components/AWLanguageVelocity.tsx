// components/AWLanguageVelocity.tsx
import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
}

type TopNOption = 3 | 5 | 10 | 'all';

interface DayData {
  date: string;
  dateLabel: string;
  [key: string]: string | number;
}

interface LanguageTrend {
  language: string;
  totalHours: number;
  weekOverWeekChange: number;
  momentum: 'growing' | 'declining' | 'steady';
  consecutiveDays: number;
}

export default function AWLanguageVelocity({ data }: Props) {
  const [topN, setTopN] = useState<TopNOption>(3);
  const [showTooltip, setShowTooltip] = useState(false);

  const { chartData, topLanguages, insights } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create 30 days of data points
    const days: DayData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    // Filter dev app data
    const devData = data.filter(entry => isDevApp(entry.appName));

    // Aggregate hours per language per day
    const languageTotals = new Map<string, number>();
    
    devData.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      const dateKey = entryDate.toISOString().split('T')[0];
      
      const dayData = days.find(d => d.date === dateKey);
      if (!dayData) return;

      const language = getLanguageFromActivity(entry.title, entry.appName);

      if (language) {
        const currentHours = (dayData[language] as number) || 0;
        dayData[language] = currentHours + (entry.duration / 3600);
        languageTotals.set(language, (languageTotals.get(language) || 0) + (entry.duration / 3600));
      }
    });

    // Sort languages by total hours
    const sortedLanguages = Array.from(languageTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    // Apply topN filter
    const displayLanguages = topN === 'all' 
      ? sortedLanguages 
      : sortedLanguages.slice(0, topN);

    // Calculate trends for insights
    const trends: LanguageTrend[] = sortedLanguages.slice(0, 5).map(language => {
      const lastWeekData = days.slice(-7);
      const prevWeekData = days.slice(-14, -7);
      
      const lastWeekHours = lastWeekData.reduce((sum, day) => sum + ((day[language] as number) || 0), 0);
      const prevWeekHours = prevWeekData.reduce((sum, day) => sum + ((day[language] as number) || 0), 0);
      
      const change = prevWeekHours > 0 
        ? ((lastWeekHours - prevWeekHours) / prevWeekHours) * 100 
        : (lastWeekHours > 0 ? 100 : 0);

      let consecutive = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if ((days[i][language] as number) > 0) {
          consecutive++;
        } else {
          break;
        }
      }

      return {
        language,
        totalHours: languageTotals.get(language) || 0,
        weekOverWeekChange: change,
        momentum: change > 10 ? 'growing' : change < -10 ? 'declining' : 'steady',
        consecutiveDays: consecutive
      };
    });

    // Generate insights
    const generatedInsights: string[] = [];
    
    // Biggest growth
    const growing = trends.filter(t => t.momentum === 'growing')
      .sort((a, b) => b.weekOverWeekChange - a.weekOverWeekChange)[0];
    if (growing) {
      generatedInsights.push(`🚀 ${growing.language} momentum: +${Math.round(growing.weekOverWeekChange)}% vs last week`);
    }
    
    // Declining language
    const declining = trends.find(t => t.momentum === 'declining');
    if (declining) {
      generatedInsights.push(`📉 ${declining.language}: ${Math.round(declining.weekOverWeekChange)}% vs last week`);
    }
    
    // Learning focus (consecutive days)
    const focused = trends.filter(t => t.consecutiveDays >= 3)
      .sort((a, b) => b.consecutiveDays - a.consecutiveDays)[0];
    if (focused) {
      generatedInsights.push(`🎯 Learning focus: ${focused.language} (${focused.consecutiveDays} consecutive days)`);
    }

    // Steady performer
    const steady = trends.find(t => t.momentum === 'steady' && t.totalHours > 1);
    if (steady && generatedInsights.length < 3) {
      generatedInsights.push(`⚖️ ${steady.language}: Steady usage (${Math.round(steady.weekOverWeekChange)}% change)`);
    }

    return {
      chartData: days,
      topLanguages: displayLanguages,
      insights: generatedInsights
    };
  }, [data, topN]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-white mb-2">{label}</p>
        {payload
          .sort((a: any, b: any) => b.value - a.value)
          .map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300">{entry.name}</span>
              </div>
              <span className="text-white font-mono font-semibold">
                {formatDuration(entry.value)}
              </span>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start justify-between mb-4">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-600/30">
                <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Language Velocity</h2>
                <p className="text-xs text-gray-400">Last 30 days</p>
              </div>
            </div>
        
            {/* Toggle Buttons + Badge */}
            <div className="flex items-center gap-3">
              {/* Toggle Buttons */}
              <div className="flex grow rounded-lg border border-gray-700 bg-gray-900 p-1">
                {([3, 5, 10, 'all'] as TopNOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => setTopN(option)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      topN === option
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {option === 'all' ? 'All' : `Top ${option}`}
                  </button>
                ))}
              </div>

              {/* Badge */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-orange-300 text-xs font-semibold bg-orange-900/30 px-2 py-1 rounded border border-orange-700/30 hover:bg-orange-900/50 transition-colors cursor-pointer"
                >
                  TRENDS
                </button>
            
                {showTooltip && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-[100] w-80">
                    <div className="text-xs text-gray-300 space-y-2">
                      <p className="font-semibold text-white mb-1">Language Velocity Analysis</p>
                      <p>
                        Tracks daily coding time per language over the last 30 days to reveal growth patterns and focus shifts.
                      </p>
                      <p>
                        Shows which languages are gaining momentum, declining, or maintaining steady usage.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="dateLabel" 
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
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                  formatter={(value) => <span className="text-sm text-gray-300">{value}</span>}
                />
                {topLanguages.map((language) => (
                  <Line
                    key={language}
                    type="monotone"
                    dataKey={language}
                    stroke={LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Other']}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="space-y-1.5">
            {insights.map((insight, idx) => (
              <p key={idx} className="text-xs text-gray-300">
                • {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
