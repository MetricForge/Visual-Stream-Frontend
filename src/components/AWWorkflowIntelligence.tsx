// components/AWWorkflowIntelligence.tsx
import { useMemo, useState } from 'react';
import { categorizeApp, type AppCategory } from '../utils/appCategories';

interface AWData {
  timestamp: Date;
  duration: number;
  appName: string;
}

interface Props {
  data: AWData[];
}

interface Insight {
  id: string;
  type: 'optimization' | 'balance' | 'habit' | 'insight' | 'workflow' | 'health';
  icon: string;
  title: string;
  description: string;
  priority: number;
}

export default function AWWorkflowIntelligence({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const insights = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Initialize analysis structures
    const dailyData = new Map<string, Map<AppCategory, number>>();
    const hourlyData = new Map<number, number>();
    const weekdayData: number[] = [];
    const weekendData: number[] = [];
    const categoryTotals = new Map<AppCategory, number>();
    const appSequences: Array<{ from: string; to: string; time: Date }> = [];
    const dailyEndTimes = new Map<string, number>();
    const dailyStartTimes = new Map<string, number>();
    const activityGaps: number[] = [];
    
    // Process data
    sortedData.forEach((entry, idx) => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toDateString();
      const hour = new Date(entry.timestamp).getHours();
      const dayOfWeek = new Date(entry.timestamp).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const category = categorizeApp(entry.appName);
      
      if (date.getTime() === today.getTime()) return;
      
      // Daily data
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, new Map());
      }
      const dayCategories = dailyData.get(dateKey)!;
      dayCategories.set(category, (dayCategories.get(category) || 0) + entry.duration);
      
      // Category totals
      categoryTotals.set(category, (categoryTotals.get(category) || 0) + entry.duration);
      
      // Hourly data
      hourlyData.set(hour, (hourlyData.get(hour) || 0) + entry.duration);
      
      // Track daily start/end times
      const entryHour = new Date(entry.timestamp).getHours() + new Date(entry.timestamp).getMinutes() / 60;
      if (!dailyStartTimes.has(dateKey) || entryHour < dailyStartTimes.get(dateKey)!) {
        dailyStartTimes.set(dateKey, entryHour);
      }
      if (!dailyEndTimes.has(dateKey) || entryHour > dailyEndTimes.get(dateKey)!) {
        dailyEndTimes.set(dateKey, entryHour);
      }
      
      // Weekday vs weekend
      if (isWeekend) {
        weekendData.push(entry.duration);
      } else {
        weekdayData.push(entry.duration);
      }
      
      // Detect sequences and gaps
      if (idx > 0) {
        const prevEntry = sortedData[idx - 1];
        const timeDiff = (entry.timestamp.getTime() - prevEntry.timestamp.getTime()) / 1000 / 60;
        
        // App transitions (within 5 minutes)
        if (timeDiff <= 5 && prevEntry.appName !== entry.appName) {
          appSequences.push({ from: prevEntry.appName, to: entry.appName, time: entry.timestamp });
        }
        
        // Activity gaps (breaks between 5min and 2 hours)
        if (timeDiff >= 5 && timeDiff <= 120) {
          activityGaps.push(timeDiff);
        }
      }
    });
    
    const insightsList: Insight[] = [];
    
    // Calculate common metrics
    const devHours = (categoryTotals.get('Development') || 0) / 3600;
    const testHours = (categoryTotals.get('Testing & QA') || 0) / 3600;
    const opsHours = (categoryTotals.get('Operations') || 0) / 3600;
    const totalTrackedHours = Array.from(categoryTotals.values()).reduce((sum, d) => sum + d, 0) / 3600;
    
    // ========== WORKFLOW INTELLIGENCE ==========
    
    // 1. Dev/Test Ratio
    if (devHours > 0 && testHours > 0) {
      const devTestRatio = devHours / testHours;
      if (devTestRatio > 5) {
        insightsList.push({
          id: 'dev-test-high',
          type: 'insight',
          icon: '🔧',
          title: 'Development-Testing Balance',
          description: `Development at ${devHours.toFixed(1)}h vs Testing at ${testHours.toFixed(1)}h (${devTestRatio.toFixed(1)}:1 ratio). Industry standard is approximately 3:1 - current pattern suggests heavy development focus with lighter test coverage.`,
          priority: 1
        });
      } else if (devTestRatio >= 2 && devTestRatio <= 4) {
        insightsList.push({
          id: 'dev-test-balanced',
          type: 'insight',
          icon: '✅',
          title: 'Healthy Dev-Test Balance',
          description: `Development-to-Testing ratio of ${devTestRatio.toFixed(1)}:1 aligns with industry best practices, indicating balanced approach to building and validating features.`,
          priority: 4
        });
      }
    }
    
    // 2. Operations Overhead
    if (devHours > 0) {
      const opsRatio = (opsHours / devHours) * 100;
      if (opsRatio > 30) {
        insightsList.push({
          id: 'high-ops',
          type: 'insight',
          icon: '🚨',
          title: 'Elevated Operations Activity',
          description: `Operations at ${opsHours.toFixed(1)}h (${opsRatio.toFixed(0)}% of development time). High maintenance overhead may indicate technical debt, infrastructure issues, or production incidents requiring attention.`,
          priority: 1
        });
      } else if (opsRatio < 5 && opsHours > 0) {
        insightsList.push({
          id: 'low-ops',
          type: 'insight',
          icon: '💚',
          title: 'Low Operations Overhead',
          description: `Operations at ${opsHours.toFixed(1)}h (<${opsRatio.toFixed(0)}% of development time). Minimal operational issues suggest stable codebase and infrastructure.`,
          priority: 4
        });
      }
    }
    
    // 3. Email → Browser Engagement
    const emailToBrowserTransitions = appSequences.filter(
      seq => seq.from === 'Email' && (seq.to === 'Microsoft Edge' || seq.to === 'Google Chrome')
    ).length;
    
    if (emailToBrowserTransitions >= 3) {
      insightsList.push({
        id: 'email-engagement',
        type: 'workflow',
        icon: '📧',
        title: 'Active Email Engagement Pattern',
        description: `Detected ${emailToBrowserTransitions} Email → Browser transitions, indicating consistent engagement with email links, external resources, and communication follow-through.`,
        priority: 3
      });
    }
    
    // 4. Development → Testing Workflow
    const devToTestTransitions = appSequences.filter(
      seq => categorizeApp(seq.from) === 'Development' && categorizeApp(seq.to) === 'Testing & QA'
    ).length;
    
    if (devToTestTransitions >= 5) {
      insightsList.push({
        id: 'dev-test-workflow',
        type: 'workflow',
        icon: '🔗',
        title: 'Efficient Dev-Test Workflow',
        description: `Development → Testing transitions detected ${devToTestTransitions} times. Rapid iteration cycle suggests agile development methodology and strong TDD practices.`,
        priority: 3
      });
    }
    
    // 5. Browser → Development (Research Pattern)
    const browserToDevTransitions = appSequences.filter(
      seq => (seq.from === 'Microsoft Edge' || seq.from === 'Google Chrome') && 
             categorizeApp(seq.to) === 'Development'
    ).length;
    
    if (browserToDevTransitions >= 5) {
      insightsList.push({
        id: 'research-pattern',
        type: 'workflow',
        icon: '📝',
        title: 'Active Research Integration',
        description: `Browser → Development pattern detected ${browserToDevTransitions} times. Frequent documentation/research usage during coding indicates continuous learning approach.`,
        priority: 3
      });
    }
    
    // ========== TIME PATTERN INSIGHTS ==========
    
    // 6. Peak Hours Analysis
    if (hourlyData.size > 0) {
      const sortedHours = Array.from(hourlyData.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      const peakHours = sortedHours.map(([hour]) => hour);
      const peakStart = Math.min(...peakHours);
      const peakEnd = Math.max(...peakHours);
      
      if (peakStart >= 20 || peakEnd >= 22) {
        insightsList.push({
          id: 'late-night-pattern',
          type: 'balance',
          icon: '🌙',
          title: 'Evening Activity Pattern',
          description: `Peak activity occurs ${peakStart}:00-${peakEnd}:00. Late evening work may indicate uninterrupted focus time or potential work-life balance considerations.`,
          priority: 2
        });
      } else if (peakStart <= 9) {
        insightsList.push({
          id: 'early-bird',
          type: 'health',
          icon: '🌅',
          title: 'Early Morning Productivity',
          description: `Peak activity ${peakStart}:00-${peakEnd}:00. Morning hours show highest concentration - early bird pattern aligns with natural circadian rhythms for many individuals.`,
          priority: 3
        });
      } else {
        insightsList.push({
          id: 'peak-hours',
          type: 'optimization',
          icon: '⚡',
          title: 'Optimize Peak Hours',
          description: `Highest activity concentration: ${peakStart}:00-${peakEnd}:00. Schedule critical technical tasks during these high-energy windows for maximum efficiency.`,
          priority: 2
        });
      }
    }
    
    // 7. Weekend Productivity Pattern
    if (weekdayData.length > 0 && weekendData.length > 0) {
      const weekdayAvg = weekdayData.reduce((sum, d) => sum + d, 0) / weekdayData.length / 3600;
      const weekendAvg = weekendData.reduce((sum, d) => sum + d, 0) / weekendData.length / 3600;
      const difference = ((weekendAvg / weekdayAvg - 1) * 100);
      
      if (difference > 50) {
        insightsList.push({
          id: 'weekend-productivity',
          type: 'insight',
          icon: '📅',
          title: 'Weekend Productivity Spike',
          description: `Weekend activity ${difference.toFixed(0)}% higher than weekdays. Pattern suggests uninterrupted time drives productivity - consider replicating these conditions on weekdays where feasible.`,
          priority: 2
        });
      } else if (difference < -30) {
        insightsList.push({
          id: 'weekday-focus',
          type: 'balance',
          icon: '💼',
          title: 'Strong Weekday Focus',
          description: `Weekday activity ${Math.abs(difference).toFixed(0)}% higher than weekends. Clear work-life boundary maintained with reduced weekend engagement.`,
          priority: 3
        });
      }
    }
    
    // 8. Start Time Consistency
    if (dailyStartTimes.size >= 3) {
      const startTimes = Array.from(dailyStartTimes.values());
      const avgStart = startTimes.reduce((sum, t) => sum + t, 0) / startTimes.length;
      const startVariance = Math.sqrt(startTimes.reduce((sum, t) => sum + Math.pow(t - avgStart, 2), 0) / startTimes.length);
      
      if (startVariance < 0.5) {
        const startHour = Math.floor(avgStart);
        const startMin = Math.round((avgStart % 1) * 60);
        insightsList.push({
          id: 'consistent-start',
          type: 'health',
          icon: '🕐',
          title: 'Consistent Start Time',
          description: `Activity begins ${startHour}:${startMin.toString().padStart(2, '0')} ±20min consistently. Regular morning routine supports circadian alignment and habit formation.`,
          priority: 3
        });
      }
    }
    
    // ========== HEALTH & SUSTAINABILITY ==========
    
    // 9. Micro-Break Pattern
    if (activityGaps.length >= 5) {
      const avgGap = activityGaps.reduce((sum, g) => sum + g, 0) / activityGaps.length;
      const shortBreaks = activityGaps.filter(g => g >= 5 && g <= 10).length;
      const microBreakFrequency = (shortBreaks / activityGaps.length) * 100;
      
      if (microBreakFrequency >= 30) {
        insightsList.push({
          id: 'good-microbreaks',
          type: 'health',
          icon: '🧘',
          title: 'Healthy Micro-Break Pattern',
          description: `Regular 5-10min breaks detected (${shortBreaks} instances). Pattern aligns with Pomodoro research showing 5-minute breaks every 25-50 minutes optimize sustained focus.`,
          priority: 3
        });
      } else if (avgGap > 90) {
        insightsList.push({
          id: 'need-microbreaks',
          type: 'health',
          icon: '⏸️',
          title: 'Extended Sessions Without Breaks',
          description: `Average ${avgGap.toFixed(0)}min between breaks. Research suggests 5-minute breaks every 50-60 minutes prevent mental fatigue and maintain cognitive performance.`,
          priority: 2
        });
      }
    }
    
    // 10. Sleep Schedule Consistency
    if (dailyEndTimes.size >= 5) {
      const endTimes = Array.from(dailyEndTimes.values());
      const avgEnd = endTimes.reduce((sum, t) => sum + t, 0) / endTimes.length;
      const endVariance = Math.sqrt(endTimes.reduce((sum, t) => sum + Math.pow(t - avgEnd, 2), 0) / endTimes.length);
      
      const endHour = Math.floor(avgEnd);
      const endMin = Math.round((avgEnd % 1) * 60);
      
      if (endVariance < 0.75) {
        if (endHour <= 22) {
          insightsList.push({
            id: 'good-sleep-schedule',
            type: 'health',
            icon: '😴',
            title: 'Healthy Sleep Boundary',
            description: `Activity consistently ends ${endHour}:${endMin.toString().padStart(2, '0')} ±30min. Regular schedule supports circadian rhythm and 7-9h sleep target if waking by 6-7am.`,
            priority: 3
          });
        } else {
          insightsList.push({
            id: 'late-sleep-schedule',
            type: 'health',
            icon: '🌙',
            title: 'Late Evening Activity Pattern',
            description: `Activity consistently ends ${endHour}:${endMin.toString().padStart(2, '0')}. Late-night work may impact sleep duration - consider earlier scheduling where feasible for optimal recovery.`,
            priority: 2
          });
        }
      }
      
      // Week-over-week sleep trend
      if (endTimes.length >= 10) {
        const recentHalf = endTimes.slice(Math.floor(endTimes.length / 2));
        const earlierHalf = endTimes.slice(0, Math.floor(endTimes.length / 2));
        const recentAvg = recentHalf.reduce((sum, t) => sum + t, 0) / recentHalf.length;
        const earlierAvg = earlierHalf.reduce((sum, t) => sum + t, 0) / earlierHalf.length;
        const trend = (recentAvg - earlierAvg) * 60;
        
        if (Math.abs(trend) >= 30) {
          insightsList.push({
            id: 'sleep-trend',
            type: 'health',
            icon: trend > 0 ? '📈' : '📉',
            title: trend > 0 ? 'Sleep Schedule Shifting Later' : 'Sleep Schedule Improving',
            description: trend > 0
              ? `End-of-day activity trending ${Math.abs(trend).toFixed(0)}min later over recent period. Gradual schedule shift may impact morning energy and sleep quality.`
              : `End-of-day activity trending ${Math.abs(trend).toFixed(0)}min earlier over recent period. Positive schedule improvement supports better sleep hygiene.`,
            priority: 2
          });
        }
      }
    }
    
    // 11. Deep Work Sessions
    if (devHours > 0) {
      const devDays = Array.from(dailyData.values()).filter(dayMap => 
        (dayMap.get('Development') || 0) > 0
      ).length;
      const avgSessionLength = devHours / devDays;
      
      if (avgSessionLength < 2) {
        insightsList.push({
          id: 'short-sessions',
          type: 'optimization',
          icon: '⏰',
          title: 'Deep Work Opportunity',
          description: `Average development session: ${avgSessionLength.toFixed(1)}h. Research suggests 3-4h uninterrupted blocks optimize flow state and complex problem-solving capacity.`,
          priority: 2
        });
      } else if (avgSessionLength >= 3) {
        insightsList.push({
          id: 'deep-work-strong',
          type: 'optimization',
          icon: '🎯',
          title: 'Strong Deep Work Sessions',
          description: `Average development session: ${avgSessionLength.toFixed(1)}h. Extended focus blocks align with flow state research and indicate strong concentration capacity.`,
          priority: 4
        });
      }
    }
    
    // 12. Energy Management
    const longSessions = activityGaps.filter(g => g >= 180).length;
    if (longSessions >= 3) {
      insightsList.push({
        id: 'ultradian-rhythm',
        type: 'health',
        icon: '⚡',
        title: 'Ultradian Rhythm Alignment',
        description: `${longSessions} sessions exceeding 3h detected. Pattern suggests strong capacity for extended focus, though research indicates 90-120min cycles with breaks optimize sustained performance.`,
        priority: 3
      });
    }
    
    // ========== CONSISTENCY & HABITS ==========
    
    // 13. Consistency Pattern
    const productiveCategories: AppCategory[] = ['Development', 'Testing & QA', 'Operations', 'Tools'];
    const productiveDays = Array.from(dailyData.values()).filter(dayMap => {
      let productiveHours = 0;
      productiveCategories.forEach(cat => {
        productiveHours += (dayMap.get(cat) || 0) / 3600;
      });
      return productiveHours >= 4;
    }).length;
    
    const totalDays = dailyData.size;
    const consistencyRate = totalDays > 0 ? (productiveDays / totalDays) * 100 : 0;
    
    if (consistencyRate >= 70 && productiveDays >= 3) {
      insightsList.push({
        id: 'strong-consistency',
        type: 'habit',
        icon: '🔥',
        title: 'Strong Consistency Pattern',
        description: `${productiveDays} of ${totalDays} days meet 4+ hour productivity threshold (${consistencyRate.toFixed(0)}%). Maintaining this cadence builds sustainable technical engagement habits.`,
        priority: 3
      });
    } else if (consistencyRate < 70 && totalDays >= 3) {
      insightsList.push({
        id: 'build-consistency',
        type: 'habit',
        icon: '🔄',
        title: 'Consistency Opportunity',
        description: `${productiveDays} of ${totalDays} days meet productivity threshold (${consistencyRate.toFixed(0)}%). Focus on daily 4+ hour technical engagement to strengthen habit formation.`,
        priority: 2
      });
    }
    
    // ========== FOCUS & EFFICIENCY ==========
    
    // 14. Context Switching
    const uniqueApps = new Set(data.map(d => d.appName)).size;
    if (uniqueApps >= 15) {
      insightsList.push({
        id: 'context-switching',
        type: 'optimization',
        icon: '🔄',
        title: 'Application Diversity',
        description: `${uniqueApps} different applications tracked. High diversity may indicate context switching - consider batching similar tasks to maintain focus depth.`,
        priority: 3
      });
    } else if (uniqueApps <= 8) {
      insightsList.push({
        id: 'focused-toolset',
        type: 'optimization',
        icon: '🎯',
        title: 'Focused Tool Usage',
        description: `${uniqueApps} core applications tracked. Limited tool diversity suggests focused workflow with minimal context switching overhead.`,
        priority: 4
      });
    }
    
    // 15. Category Distribution
    const sortedCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1]);
    
    if (sortedCategories.length >= 2) {
      const topCategory = sortedCategories[0];
      const topPercentage = (topCategory[1] / 3600 / totalTrackedHours) * 100;
      
      if (topPercentage >= 40 && topPercentage <= 60 && topCategory[0] === 'Development') {
        insightsList.push({
          id: 'focused-allocation',
          type: 'insight',
          icon: '🎯',
          title: 'Well-Focused Time Allocation',
          description: `${topCategory[0]} at ${(topCategory[1] / 3600).toFixed(1)}h (${topPercentage.toFixed(0)}% of tracked time). Strong focus on primary technical activities while maintaining balanced engagement.`,
          priority: 4
        });
      } else if (topPercentage > 70) {
        const secondCategory = sortedCategories[1];
        insightsList.push({
          id: 'category-dominance',
          type: 'insight',
          icon: '📊',
          title: 'Single Category Dominance',
          description: `${topCategory[0]} represents ${topPercentage.toFixed(0)}% of tracked time. Heavy concentration in one category - consider if diversification across ${secondCategory[0]} or other areas would be beneficial.`,
          priority: 3
        });
      }
    }
    
    // 16. Recovery Time Balance
    const entertainmentHours = (categoryTotals.get('Entertainment') || 0) / 3600;
    const otherHours = (categoryTotals.get('Other') || 0) / 3600;
    const leisureHours = entertainmentHours + otherHours;
    const entertainmentPct = (leisureHours / totalTrackedHours) * 100;

    if (leisureHours > 2 && entertainmentPct >= 15 && entertainmentPct <= 35) {
      insightsList.push({
        id: 'balanced-recovery',
        type: 'health',
        icon: '🎮',
        title: 'Balanced Recovery Time',
        description: `Entertainment & leisure activities at ${leisureHours.toFixed(1)}h (${entertainmentPct.toFixed(0)}% of total). Balanced leisure engagement supports sustainable productivity and cognitive recovery.`,
        priority: 4
      });
    }

    
    // Sort by priority and take top 10
    return insightsList
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 10);
    
  }, [data]);

  const getTypeColor = (type: Insight['type']): { bg: string; border: string; text: string } => {
    switch (type) {
      case 'optimization':
        return { bg: 'bg-purple-900/20', border: 'border-purple-700/50', text: 'text-purple-300' };
      case 'balance':
        return { bg: 'bg-blue-900/20', border: 'border-blue-700/50', text: 'text-blue-300' };
      case 'habit':
        return { bg: 'bg-green-900/20', border: 'border-green-700/50', text: 'text-green-300' };
      case 'insight':
        return { bg: 'bg-yellow-900/20', border: 'border-yellow-700/50', text: 'text-yellow-300' };
      case 'workflow':
        return { bg: 'bg-cyan-900/20', border: 'border-cyan-700/50', text: 'text-cyan-300' };
      case 'health':
        return { bg: 'bg-pink-900/20', border: 'border-pink-700/50', text: 'text-pink-300' };
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-pink-600/30">
            <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Workflow Intelligence</h2>
        </div>
        
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-pink-300 text-xs font-semibold bg-pink-900/30 px-2 py-1 rounded border border-pink-700/30 hover:bg-pink-900/50 transition-colors cursor-pointer"
          >
            INTELLIGENCE
          </button>
          
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-[100] w-80">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Advanced Analytics Pattern Analysis</p>
                
                <p>
                  Analyzes activity patterns to provide contextual insights on workflow health, time management, and sustainable work practices.
                </p>

                <div className="space-y-1 pt-2">
                  <p><strong className="text-purple-400">Optimization:</strong> Performance window identification</p>
                  <p><strong className="text-blue-400">Balance:</strong> Activity distribution analysis</p>
                  <p><strong className="text-green-400">Habits:</strong> Consistency pattern detection</p>
                  <p><strong className="text-yellow-400">Insights:</strong> Workflow ratio analysis</p>
                  <p><strong className="text-cyan-400">Workflow:</strong> Task transition patterns</p>
                  <p><strong className="text-pink-400">Health:</strong> Sustainability indicators</p>
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <p className="text-gray-400 italic">
                    Intelligence prioritizes actionable observations from comprehensive workflow data analysis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="p-4 rounded-full bg-gray-700/30 mb-3">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-semibold mb-1">Analyzing Patterns</p>
            <p className="text-gray-500 text-xs">
              More data needed to generate workflow intelligence.
            </p>
          </div>
        ) : (
          insights.map((insight) => {
            const colors = getTypeColor(insight.type);
            
            return (
              <div
                key={insight.id}
                className={`rounded-lg p-4 border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm mb-1 ${colors.text}`}>
                      {insight.title}
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
