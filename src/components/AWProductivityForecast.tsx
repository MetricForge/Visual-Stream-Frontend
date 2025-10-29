// components/AWProductivityForecast.tsx
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { categorizeApp, COLORS, CATEGORY_ORDER, type AppCategory } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

interface ForecastDay {
  day: string;
  fullDay: string;
  date: string;
  total: number;
  [key: string]: string | number;
}

interface DayData {
  date: Date;
  dayName: string;
  isWeekday: boolean;
  categories: Map<AppCategory, number>;
  total: number;
}

// Format duration intelligently: H M, M, or S
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

// Apply recency weighting to historical data
function applyRecencyWeighting(sortedData: number[]): number {
  if (sortedData.length === 0) return 0;
  if (sortedData.length === 1) return sortedData[0];
  
  const recent = sortedData.slice(-2); // Last 2 occurrences
  const older = sortedData.slice(0, -2); // Everything before
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.length > 0 
    ? older.reduce((sum, val) => sum + val, 0) / older.length 
    : recentAvg;
  
  // 70% weight on recent, 30% on older
  return (recentAvg * 0.7) + (olderAvg * 0.3);
}

export default function AWProductivityForecast({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { forecastData, activeCategories, tomorrowProductivity, totalWeeklyHours } = useMemo(() => {
    // Parse and structure all historical data
    const historicalDays: DayData[] = [];
    const dayMap = new Map<string, Map<AppCategory, number>>();
    
    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toDateString();
      const category = categorizeApp(entry.appName);
      
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, new Map());
      }
      
      const categoryMap = dayMap.get(dateKey)!;
      categoryMap.set(category, (categoryMap.get(category) || 0) + entry.duration);
    });
    
    // Convert to structured array
    dayMap.forEach((categories, dateKey) => {
      const date = new Date(dateKey);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const isWeekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(dayName);
      const total = Array.from(categories.values()).reduce((sum, dur) => sum + dur, 0);
      
      historicalDays.push({ date, dayName, isWeekday, categories, total });
    });
    
    // Sort by date
    historicalDays.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Track all categories seen
    const categoriesSet = new Set<AppCategory>();
    historicalDays.forEach(day => {
      day.categories.forEach((_, category) => categoriesSet.add(category));
    });

    // Prediction function using Hybrid Approach (Context + Day-Specific + Recency)
    const predictDay = (dayName: string, isWeekday: boolean): Map<AppCategory, number> => {
      // 1. Get context baseline (weekday or weekend pattern)
      const contextDays = historicalDays.filter(d => d.isWeekday === isWeekday);
      //const contextTotals = contextDays.map(d => d.total / 3600).sort((a, b) => a - b);
      //const contextAvg = applyRecencyWeighting(contextTotals) * 3600;
      
      // 2. Get day-specific pattern
      const daySpecificData = historicalDays.filter(d => d.dayName === dayName);
      
      // 3. Predict each category
      const prediction = new Map<AppCategory, number>();
      
      categoriesSet.forEach(category => {
        // Get historical data for this category on this day
        const categoryOnDay = daySpecificData
          .map(d => d.categories.get(category) || 0)
          .filter(val => val > 0)
          .sort((a, b) => a - b);
        
        // Get historical data for this category in the context (weekday/weekend)
        const categoryInContext = contextDays
          .map(d => d.categories.get(category) || 0)
          .filter(val => val > 0)
          .sort((a, b) => a - b);
        
        if (categoryOnDay.length > 0) {
          const daySpecificAvg = applyRecencyWeighting(categoryOnDay);
          const contextCategoryAvg = categoryInContext.length > 0 
            ? applyRecencyWeighting(categoryInContext) 
            : 0;
          
          // 70% day-specific, 30% context
          prediction.set(category, (daySpecificAvg * 0.7) + (contextCategoryAvg * 0.3));
        } else if (categoryInContext.length > 0) {
          // No day-specific data, fall back to context
          prediction.set(category, applyRecencyWeighting(categoryInContext));
        }
      });
      
      return prediction;
    };

    // Get next 7 days starting from tomorrow
    const today = new Date();
    const next7Days = [];
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      next7Days.push(futureDate);
    }

    // Create forecast for the next 7 days
    let weeklyTotal = 0;
    const chartData = next7Days.map((date) => {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const isWeekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(dayName);
      const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const prediction = predictDay(dayName, isWeekday);
      
      const dayData: ForecastDay = {
        day: `${dayShort}\n(${dateStr})`,
        fullDay: dayName,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: 0
      };
      
      // Add predicted categories
      prediction.forEach((duration, category) => {
        const hours = parseFloat((duration / 3600).toFixed(2));
        dayData[category] = hours;
        dayData.total += hours;
      });
      
      weeklyTotal += dayData.total;
      return dayData;
    });

    // Calculate tomorrow's productivity rate (compared to weekly average)
    const weeklyAvg = weeklyTotal / 7;
    const tomorrowTotal = chartData[0].total;
    const productivityRate = weeklyAvg > 0 ? Math.round((tomorrowTotal / weeklyAvg) * 100) : 0;

    // Filter CATEGORY_ORDER to only include categories present in data
    const orderedCategories = CATEGORY_ORDER.filter(cat => categoriesSet.has(cat as AppCategory));
    
    return { 
      forecastData: chartData,
      activeCategories: orderedCategories as AppCategory[],
      tomorrowProductivity: productivityRate,
      totalWeeklyHours: weeklyTotal
    };
  }, [data]);

  // Calculate metrics
  const dailyAvgHours = totalWeeklyHours / 7;
  const tomorrowData = forecastData[0];
  
  // Calculate consistency (variance across the week)
  const variance = forecastData.reduce((sum, d) => sum + Math.pow(d.total - dailyAvgHours, 2), 0) / 7;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev / dailyAvgHours * 100)));

  // Weekend variance
  const weekdayData = forecastData.filter((_d, i) => i < 5);
  const weekendData = forecastData.filter((_d, i) => i >= 5);
  const weekdayAvg = weekdayData.reduce((sum, d) => sum + d.total, 0) / weekdayData.length;
  const weekendAvg = weekendData.reduce((sum, d) => sum + d.total, 0) / weekendData.length;
  const weekendVariance = weekdayAvg > 0 ? ((weekendAvg - weekdayAvg) / weekdayAvg * 100) : 0;

  // Generate insight
  const getInsight = (): string => {
    if (Math.abs(weekendVariance) > 150) {
      return `Hybrid prediction model detects ${weekendVariance > 0 ? 'elevated' : 'reduced'} weekend activity (${weekendVariance > 0 ? '+' : ''}${weekendVariance.toFixed(0)}%), weighted by recent behavior patterns and day-specific context.`;
    } else if (consistencyScore > 80) {
      return `High consistency score (${consistencyScore.toFixed(0)}%) with recent-weighted predictions showing stable activity patterns. Day-specific and contextual factors align closely.`;
    } else if (tomorrowData.total > dailyAvgHours * 1.5) {
      return `Tomorrow's prediction (${formatDuration(tomorrowData.total * 3600)}) uses 70% day-specific and 30% weekday-context weighting, indicating above-average activity ahead.`;
    } else {
      return `Predictions blend recent behavior (70% weight) with historical patterns (30%), incorporating both day-specific and weekday/weekend contextual factors.`;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const fullDay = payload[0].payload.fullDay;
      const dateStr = payload[0].payload.date;
      const totalSeconds = payload[0].payload.total * 3600;
      const dayIndex = forecastData.findIndex(d => d.fullDay === fullDay);
      const isDayOne = dayIndex === 0;
      const isWeekend = dayIndex >= 5;
      
      // Filter out categories with 0 hours and sort by CATEGORY_ORDER
      const categories = payload
        .filter((item: any) => item.value > 0)
        .sort((a: any, b: any) => {
          const aIndex = CATEGORY_ORDER.indexOf(a.name);
          const bIndex = CATEGORY_ORDER.indexOf(b.name);
          return aIndex - bIndex;
        });
      
      // Generate day-specific insight
      const getDayInsight = (): string => {
        const dayTotal = payload[0].payload.total;
        const comparisonToAvg = ((dayTotal / dailyAvgHours - 1) * 100);
        
        if (isDayOne) {
          return `Tomorrow's prediction uses recent ${fullDay} patterns with 70% recency weighting. Expected productivity rate: ${tomorrowProductivity}% of weekly average.`;
        } else if (isWeekend) {
          const weekendDiff = ((dayTotal / weekdayAvg - 1) * 100);
          return `${fullDay} forecast shows ${weekendDiff > 0 ? '+' : ''}${weekendDiff.toFixed(0)}% variance from weekday average, consistent with weekend activity patterns.`;
        } else if (Math.abs(comparisonToAvg) > 25) {
          return `This ${fullDay} is predicted to be ${comparisonToAvg > 0 ? 'above' : 'below'} average (${comparisonToAvg > 0 ? '+' : ''}${comparisonToAvg.toFixed(0)}%), based on historical ${fullDay} patterns and weekday context.`;
        } else {
          return `${fullDay} forecast aligns closely with weekly average, combining day-specific patterns with weekday contextual baseline.`;
        }
      };
      
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl max-w-sm z-50">
          <p className="text-white font-semibold mb-1">{fullDay}</p>
          <p className="text-gray-400 text-xs mb-2">{dateStr}</p>
          <p className="text-blue-300 text-sm mb-1">Predicted: {formatDuration(totalSeconds)}</p>
          
          {/* Day-specific insight */}
          <div className="mt-2 mb-2">
            <p className="text-gray-400 text-xs italic leading-relaxed">
              {getDayInsight()}
            </p>
          </div>
          
          {categories.length > 0 && (
            <>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <p className="text-gray-400 text-xs font-semibold mb-1.5">Category Breakdown:</p>
                <div className="space-y-1.5">
                  {categories.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-blue-300 font-mono ml-2">
                        {formatDuration(item.value * 3600)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-600/30">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Next 7-Day Forecast</h2>
        </div>
        
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-blue-300 text-xs font-semibold bg-blue-900/30 px-2 py-1 rounded border border-blue-700/30 hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            FORECAST
          </button>
          
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-[100] w-80">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Hybrid Prediction Model</p>
                
                <p>
                  Forecasts the next 7 days using a hybrid approach that combines recent behavior weighting (70% last 2 occurrences) with contextual patterns (30% weekday/weekend baseline).
                </p>

                <div className="space-y-1 pt-2">
                  <p><strong className="text-blue-400">Recent Focus:</strong> Last 2 weeks weighted at 70%</p>
                  <p><strong className="text-purple-400">Context Aware:</strong> Weekday vs weekend patterns</p>
                  <p><strong className="text-green-400">Day-Specific:</strong> Individual day characteristics preserved</p>
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <p className="text-gray-400 italic">
                    {getInsight()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats - 5 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
          <p className="text-gray-400 text-xs mb-1">Daily Avg</p>
          <p className="text-white text-xl font-bold">
            {formatDuration(dailyAvgHours * 3600)}
            <span className="text-sm text-gray-400 ml-1">/day</span>
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
          <p className="text-gray-400 text-xs mb-1">Forecast Total</p>
          <p className="text-blue-300 text-xl font-bold">
            {formatDuration(totalWeeklyHours * 3600)}
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
          <p className="text-gray-400 text-xs mb-1">Tomorrow</p>
          <p className="text-green-300 text-xl font-bold">
            {tomorrowProductivity}
            <span className="text-sm text-gray-400 ml-1">%</span>
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
          <p className="text-gray-400 text-xs mb-1">Weekend Var</p>
          <p className={`text-xl font-bold ${weekendVariance > 0 ? 'text-orange-300' : 'text-purple-300'}`}>
            {weekendVariance > 0 ? '+' : ''}{weekendVariance.toFixed(0)}
            <span className="text-sm text-gray-400 ml-1">%</span>
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
          <p className="text-gray-400 text-xs mb-1">Consistency</p>
          <p className="text-cyan-300 text-xl font-bold">
            {consistencyScore.toFixed(0)}
            <span className="text-sm text-gray-400 ml-1">%</span>
          </p>
        </div>
      </div>

      {/* Chart with Legend */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* Custom Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-2 mb-3 justify-center md:flex-col md:justify-start md:w-32 md:mb-0 md:mr-4">
          {activeCategories.map(category => (
            <div key={category} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: COLORS[category] }}
              />
              <span className="text-xs text-gray-300">{category}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[250px] md:min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                interval={0}
                angle={0}
                textAnchor="middle"
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: '12px' } }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} wrapperStyle={{ zIndex: 100 }} />
              <ReferenceLine y={dailyAvgHours} stroke="#6b7280" strokeDasharray="3 3" label={{ value: 'Avg', fill: '#9ca3af', fontSize: '10px' }} />
              
              {/* Stacked bars for each category */}
              {activeCategories.map(category => (
                <Bar 
                  key={category}
                  dataKey={category}
                  stackId="a"
                  fill={COLORS[category]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
