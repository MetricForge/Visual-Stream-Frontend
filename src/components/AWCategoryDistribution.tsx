// components/AWCategoryDistribution.tsx

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { categorizeApp, COLORS, CATEGORY_ORDER, type AppCategory } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

export default function AWCategoryDistribution({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Process data into hourly category breakdowns
  const chartData = useMemo(() => {
    const hourlyData = new Map<number, Map<AppCategory, number>>();
    const daysTracked = new Set<string>(); // Track unique days

    data.forEach((row) => {
      const timestamp = new Date(row.timestamp);
      const date = timestamp.toISOString().split('T')[0];
      const hour = timestamp.getHours();
      const category = categorizeApp(row.appName);

      daysTracked.add(date); // Track which days have data

      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, new Map());
      }

      const categoryMap = hourlyData.get(hour)!;
      const currentDuration = categoryMap.get(category) || 0;
      categoryMap.set(category, currentDuration + row.duration / 60);
    });

    const totalDays = daysTracked.size || 1; // Prevent division by zero

    const chartArray = Array.from({ length: 24 }, (_, hour) => {
      const categoryMap = hourlyData.get(hour) || new Map();
      const dataPoint: any = {
        hour: hour.toString().padStart(2, '0') + ':00',
        hourNum: hour,
      };

      CATEGORY_ORDER.forEach((category) => {
        const totalMinutes = categoryMap.get(category as AppCategory) || 0;
        dataPoint[category] = totalMinutes / totalDays; //avg
      });

      return dataPoint;
    });

    return chartArray;
  }, [data]);

  // Calculate total time per category for legend
  const categoryTotals = useMemo(() => {
    const totals = new Map<AppCategory, number>();
    data.forEach((row) => {
      const category = categorizeApp(row.appName);
      const current = totals.get(category) || 0;
      totals.set(category, current + row.duration / 60);
    });
    return totals;
  }, [data]);

  // Format duration helper
  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const hour = payload[0].payload.hourNum;
    const totalMinutes = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <div className="text-sm font-semibold text-slate-200 mb-2">
          {hour.toString().padStart(2, '0')}:00 - {((hour + 1) % 24).toString().padStart(2, '0')}:00
        </div>
        <div className="space-y-1">
          {payload
            .filter((entry: any) => entry.value > 0)
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any) => (
              <div key={entry.dataKey} className="flex justify-between text-xs">
                <span style={{ color: entry.color }}>{entry.dataKey}</span>
                <span className="text-slate-400">
                  {formatDuration(entry.value)} ({((entry.value / totalMinutes) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
        </div>
        <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700">
          Total: {formatDuration(totalMinutes)}
        </div>
      </div>
    );
  };

  // Custom legend
  const CustomLegend = () => (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {CATEGORY_ORDER.map((category) => {
        const total = categoryTotals.get(category as AppCategory) || 0;
        if (total === 0) return null;

        return (
          <div key={category} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS[category as AppCategory] }}
            />
            <span className="text-xs text-slate-300">
              {category}
              <span className="text-slate-500 ml-1">({formatDuration(total)})</span>
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-100">
              Activity Mix by Hour
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Average category distribution per day
          </p>
        </div>

        {/* Tooltip Badge */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-cyan-300 text-xs font-semibold bg-cyan-900/30 px-2 py-1 rounded border border-cyan-700/30 hover:bg-cyan-900/50 transition-colors cursor-pointer"
          >
            AREA CHART
          </button>

          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Hourly Category Distribution</h4>
              <p className="text-xs text-slate-400 mb-2">
                Stacked area chart showing average time spent in each category per hour
                across all tracked days. The height of each colored area represents typical duration.
              </p>

              {/* Divider + Insights */}
              <div className="border-t border-slate-700 pt-2 mt-2 text-xs text-slate-300 space-y-1">
                {(() => {
                  // Find peak hour
                  const hourTotals = chartData.map((hour, index) => {
                    const total = CATEGORY_ORDER.reduce((sum, cat) => sum + (hour[cat] || 0), 0);
                    return { hour: index, total };
                  });

                  const peakHour = hourTotals.reduce((max, curr) =>
                    curr.total > max.total ? curr : max, hourTotals[0]
                  );

                  // Most dominant category
                  const categoryTotals = new Map<AppCategory, number>();
                  chartData.forEach(hour => {
                    CATEGORY_ORDER.forEach(cat => {
                      const current = categoryTotals.get(cat as AppCategory) || 0;
                      categoryTotals.set(cat as AppCategory, current + (hour[cat] || 0));
                    });
                  });

                  const sorted = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);
                  const topCategory = sorted[0];
                  const totalTime = sorted.reduce((sum, [_, val]) => sum + val, 0);

                  return (
                    <>
                      <div>Peak hour: {peakHour.hour.toString().padStart(2, '0')}:00 ({formatDuration(peakHour.total)} avg)</div>
                      <div>Dominant: {topCategory[0]} ({((topCategory[1] / totalTime) * 100).toFixed(0)}%)</div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
  <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="hour"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            tickFormatter={(value) => `${Math.round(value)}m`}
          />
          <Tooltip content={<CustomTooltip />} />
          {[...CATEGORY_ORDER].reverse().map((category) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId="1"
              stroke={COLORS[category as AppCategory]}
              fill={COLORS[category as AppCategory]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      </div>
      {/* Legend with totals (formatted time) */}
      <CustomLegend />
    </div>
  );
}
