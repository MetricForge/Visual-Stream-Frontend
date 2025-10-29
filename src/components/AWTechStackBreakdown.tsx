// components/AWTechStackBreakdown.tsx
import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  LANGUAGE_COLORS, 
  getLanguageFromActivity,
  formatDuration,
  formatPercentage,
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
  daysToShow?: number; // Default to 30 days
}

interface LanguageData {
  language: string;
  hours: number;
  percentage: number;
  color: string;
  prevHours: number;
  changePercent: number;
  daysActive: number;
  avgSessionLength: number;
}

export default function AWTechStackBreakdown({ data, daysToShow = 30 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { languageData, totalHours, detectionRate, prevTotalHours } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Current period
    const currentCutoffDate = new Date(today);
    currentCutoffDate.setDate(currentCutoffDate.getDate() - daysToShow);
    
    // Previous period (for comparison)
    const prevCutoffDate = new Date(currentCutoffDate);
    prevCutoffDate.setDate(prevCutoffDate.getDate() - daysToShow);

    // Filter for dev tool entries in current date range
    const currentVscodeData = data.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= currentCutoffDate && isDevApp(entry.appName);
    });


    // Filter for dev tool entries in previous date range
    const prevVscodeData = data.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= prevCutoffDate && 
                entryDate < currentCutoffDate && 
                isDevApp(entry.appName);
    });


    // Helper to process language data with session tracking
    const processLanguageData = (entries: AWData[]) => {
      const languageTotals = new Map<string, number>();
      const languageDays = new Map<string, Set<string>>();
      const languageSessions = new Map<string, number[]>();
      let totalDetected = 0;
      let totalDuration = 0;

      // Sort entries by timestamp for session detection
      const sortedEntries = [...entries].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      let currentLanguage: string | null = null;
      let currentSessionStart: Date | null = null;
      let currentSessionDuration = 0;
      const SESSION_GAP_THRESHOLD = 10 * 60; // 10 minutes in seconds

      sortedEntries.forEach(entry => {
        totalDuration += entry.duration;
  
          // Ensure title is a string
          if (!entry.title || typeof entry.title !== 'string') {
            return;
          }
          const language = getLanguageFromActivity(entry.title, entry.appName);

          if (language) {  // check if language exists, include 'Other'
            const entryDate = new Date(entry.timestamp);
            const dateKey = entryDate.toISOString().split('T')[0];
    
            // Track total duration
            languageTotals.set(language, (languageTotals.get(language) || 0) + entry.duration);
            totalDetected += entry.duration;

          
          // Track unique days
          if (!languageDays.has(language)) {
            languageDays.set(language, new Set());
          }
          languageDays.get(language)!.add(dateKey);
          
          // Track sessions (consecutive entries within SESSION_GAP_THRESHOLD)
          if (currentLanguage === language && currentSessionStart) {
            const timeSinceLastEntry = (entryDate.getTime() - currentSessionStart.getTime()) / 1000;
            
            if (timeSinceLastEntry <= SESSION_GAP_THRESHOLD) {
              // Continue current session
              currentSessionDuration += entry.duration;
            } else {
              // End previous session and start new one
              if (currentSessionDuration > 0) {
                if (!languageSessions.has(language)) {
                  languageSessions.set(language, []);
                }
                languageSessions.get(language)!.push(currentSessionDuration);
              }
              currentSessionDuration = entry.duration;
            }
          } else {
            // Save previous session if exists
            if (currentLanguage && currentSessionDuration > 0) {
              if (!languageSessions.has(currentLanguage)) {
                languageSessions.set(currentLanguage, []);
              }
              languageSessions.get(currentLanguage)!.push(currentSessionDuration);
            }
            // Start new session
            currentSessionDuration = entry.duration;
          }
          
          currentLanguage = language;
          currentSessionStart = entryDate;
        }
      });
      
      // Save final session
      if (currentLanguage && currentSessionDuration > 0) {
        if (!languageSessions.has(currentLanguage)) {
          languageSessions.set(currentLanguage, []);
        }
        languageSessions.get(currentLanguage)!.push(currentSessionDuration);
      }

      return { languageTotals, totalDetected, totalDuration, languageDays, languageSessions };
    };

    // Process current period
    const current = processLanguageData(currentVscodeData);
    
    // Process previous period
    const prev = processLanguageData(prevVscodeData);

    //const total = current.totalDuration / 3600;
    const detected = current.totalDetected / 3600;
    const rate = current.totalDuration > 0 ? (current.totalDetected / current.totalDuration) * 100 : 0;
    const prevDetected = prev.totalDetected / 3600;

    // Convert to array and calculate changes
    const langData: LanguageData[] = Array.from(current.languageTotals.entries())
      .map(([language, duration]) => {
        const hours = duration / 3600;
        const prevHours = (prev.languageTotals.get(language) || 0) / 3600;
        const changePercent = prevHours > 0 
          ? ((hours - prevHours) / prevHours) * 100 
          : (hours > 0 ? 100 : 0);
        
        // Calculate days active
        const daysActive = current.languageDays.get(language)?.size || 0;
        
        // Calculate average session length
        const sessions = current.languageSessions.get(language) || [];
        const avgSessionDuration = sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s, 0) / sessions.length / 3600
          : 0;

        return {
          language,
          hours,
          percentage: (duration / current.totalDetected) * 100,
          color: LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Other'],
          prevHours,
          changePercent,
          daysActive,
          avgSessionLength: avgSessionDuration
        };
      })
      .sort((a, b) => b.hours - a.hours);

    return {
      languageData: langData,
      totalHours: detected,
      detectionRate: rate,
      prevTotalHours: prevDetected
    };
  }, [data, daysToShow]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold text-sm">{data.language}</p>
          <p className="text-gray-300 text-xs">
            {formatDuration(data.hours)} ({data.percentage.toFixed(1)}%)
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Active {data.daysActive}/{daysToShow} days • Avg {formatDuration(data.avgSessionLength)}/session
          </p>
          {data.prevHours > 0 && (
            <p className={`text-xs mt-1 ${data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.changePercent >= 0 ? '+' : ''}{formatPercentage(data.changePercent)}% vs prev period
            </p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Tech Stack Breakdown</h2>
            <p className="text-xs text-gray-400">Last {daysToShow.toLocaleString('en-US')} days</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-blue-300 text-xs font-semibold bg-blue-900/30 px-2 py-1 rounded border border-blue-700/30 hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            TECH STACK
          </button>
          
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-[100] w-80">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Language Detection</p>
                <p>
                  Analyzes VS Code window titles to detect file extensions and map them to programming languages and frameworks.
                </p>
                <p>
                  Detection rate: {formatPercentage(detectionRate)}% of development time has identifiable file extensions.
                </p>
                <p>
                  Tracks usage patterns including days active and average session lengths (sessions = continuous work within 10min gaps).
                </p>
                <p>
                  Compares current {daysToShow.toLocaleString('en-US')}-day period vs previous {daysToShow.toLocaleString('en-US')} days to show usage trends.
                </p>
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-gray-400 italic">
                    Provides insight into current technical focus and skill stack utilization.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {languageData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="p-4 rounded-full bg-gray-700/30 mb-3">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-semibold mb-1">No Development Activity</p>
          <p className="text-gray-500 text-xs">
            No code files detected in the last {daysToShow.toLocaleString('en-US')} days
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Pie Chart */}
          <div className="lg:flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ language, percentage }) => 
                    percentage > 5 ? `${language.split('/')[0]}\n${formatPercentage(percentage)}%` : ''
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="lg:flex-1">
            <div className="bg-gray-900/50 rounded-lg border-2 border-gray-600/50 overflow-hidden">
                <div className="overflow-y-auto max-h-[280px]">
                  <table className="w-full">
                    <thead className="bg-gray-800 sticky top-0">
                  <tr>
                    <th className="text-center text-xs font-semibold text-gray-400 px-3 py-2">Language</th>
                    <th className="text-center text-xs font-semibold text-gray-400 px-3 py-2">Hours</th>
                    <th className="text-center text-xs font-semibold text-gray-400 px-3 py-2">%</th>
                    <th className="text-center text-xs font-semibold text-gray-400 px-3 py-2">Days</th>
                    <th className="text-center text-xs font-semibold text-gray-400 px-3 py-2">Avg Session</th>
                    <th className="text-center text-xs font-semibold text-gray-400 px-3 py-2">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {languageData.map((lang, idx) => (
                    <tr key={idx} className="border-t border-gray-700/30 hover:bg-gray-800/30 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: lang.color }}
                          />
                          <span className="text-sm text-gray-300">{lang.language}</span>
                        </div>
                      </td>
                      <td className="text-center text-sm text-white px-3 py-2 font-mono">
                        {formatDuration(lang.hours)}
                      </td>
                      <td className="text-center text-sm text-gray-400 px-3 py-2">
                        {lang.percentage.toFixed(1)}%
                      </td>
                      <td className="text-center text-sm text-gray-300 px-3 py-2">
                        {lang.daysActive.toLocaleString('en-US')}
                      </td>
                      <td className="text-center text-sm text-gray-300 px-3 py-2 font-mono">
                        {formatDuration(lang.avgSessionLength)}
                      </td>
                      <td className="text-center text-sm px-3 py-2 font-mono">
                        {lang.prevHours === 0 ? (
                          <span className="text-blue-400">NEW</span>
                        ) : (
                          <span className={lang.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {lang.changePercent >= 0 ? '+' : ''}{formatPercentage(lang.changePercent)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-800/50 border-t-2 border-gray-600">
                  <tr>
                    <td className="text-center text-xs font-semibold text-gray-300 px-3 py-2">Total</td>
                    <td className="text-center text-sm font-semibold text-white px-3 py-2 font-mono">
                      {formatDuration(totalHours)}
                    </td>
                    <td className="text-center text-sm font-semibold text-gray-300 px-3 py-2">
                      100%
                    </td>
                    <td className="text-center text-sm font-semibold text-gray-300 px-3 py-2">
                      —
                    </td>
                    <td className="text-center text-sm font-semibold text-gray-300 px-3 py-2">
                      —
                    </td>
                    <td className="text-center text-sm px-3 py-2 font-mono">
                      {prevTotalHours > 0 ? (
                        <span className={((totalHours - prevTotalHours) / prevTotalHours) >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {((totalHours - prevTotalHours) / prevTotalHours) >= 0 ? '+' : ''}
                          {formatPercentage(((totalHours - prevTotalHours) / prevTotalHours) * 100)}%
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
                </table>
              </div>
            </div>

            {/* Detection Rate Info */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                {formatPercentage(detectionRate)}% detection rate • {languageData.length.toLocaleString('en-US')} language{languageData.length !== 1 ? 's' : ''} detected
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
