// components/AWProjectTypeClassifier.tsx
import { useMemo, useState } from 'react';
import { 
  formatDuration, 
  formatPercentage,
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
  daysToShow?: number;
}

interface ProjectType {
  name: string;
  description: string;
  icon: string;
  hours: number;
  percentage: number;
  color: string;
  languages: string[];
}



export default function AWProjectTypeClassifier({ data, daysToShow = 7 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { projectTypes, totalHours } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow);



    // Categorize by language
    const languageHours = new Map<string, number>();
    
    const vscodeData = data.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return isDevApp(entry.appName) && entryDate >= cutoffDate;
    });


    vscodeData.forEach(entry => {
        const language = getLanguageFromActivity(entry.title, entry.appName);

        if (language && language !== 'Other') {
        languageHours.set(language, (languageHours.get(language) || 0) + entry.duration / 3600);
      }
    });

    // Calculate project types
    const types: ProjectType[] = [];
    const total = Array.from(languageHours.values()).reduce((sum, h) => sum + h, 0);

    // Web Development (React/TypeScript/JavaScript/HTML/CSS)
    const webLanguages = ['TypeScript', 'JavaScript', 'HTML', 'CSS'];
    const webHours = webLanguages.reduce((sum, lang) => sum + (languageHours.get(lang) || 0), 0);
    if (webHours > 0) {
      types.push({
        name: 'Web Development',
        description: 'Frontend/fullstack web applications with modern frameworks',
        icon: '🌐',
        hours: webHours,
        percentage: (webHours / total) * 100,
        color: '#61DAFB',
        languages: webLanguages.filter(lang => (languageHours.get(lang) || 0) > 0)
      });
    }

    // Python Development (Backend/Automation/Data) & Datahandling)
    const pythonLanguages = ['Python', 'Data'];
    const pythonHours = (languageHours.get('Python') || 0) + (languageHours.get('Data') || 0);
    if (pythonHours > 0) {
      types.push({
        name: 'Python Development',
        description: 'Full-spectrum Python development, from backend services and automation scripts to in-depth data analysis of spreadsheets and other data files.',
        icon: '🐍',
        hours: pythonHours,
        percentage: (pythonHours / total) * 100,
        color: '#3776AB',
        languages: pythonLanguages.filter(lang => (languageHours.get(lang) || 0) > 0)
      });
    }

    // Unity/Game Development
    const unityLanguages = ['C#'];
    const unityHours = languageHours.get('C#') || 0;
    const unityDormant = unityHours === 0;
    if (unityHours > 0) {
      types.push({
        name: 'Game Development',
        description: 'Unity game development with C#',
        icon: '🎮',
        hours: unityHours,
        percentage: (unityHours / total) * 100,
        color: '#239120',
        languages: unityLanguages.filter(lang => (languageHours.get(lang) || 0) > 0)
      });
    }

    // Configuration/DevOps
    const configLanguages = ['Config', 'Shell', 'Other'];
    const configHours = configLanguages.reduce((sum, lang) => sum + (languageHours.get(lang) || 0), 0);
    if (configHours > 0) {
      types.push({
        name: 'Configuration, DevOps',
        description: 'Project setup, CI/CD, infrastructure as code',
        icon: '⚙️',
        hours: configHours,
        percentage: (configHours / total) * 100,
        color: '#6B7280',
        languages: configLanguages.filter(lang => (languageHours.get(lang) || 0) > 0)
      });
    }


    // Documentation
    const docHours = languageHours.get('Docs') || 0;
    if (docHours > 0) {
      types.push({
        name: 'Documentation',
        description: 'Technical documentation, README files, wikis',
        icon: '📝',
        hours: docHours,
        percentage: (docHours / total) * 100,
        color: '#083FA1',
        languages: ['Docs']
      });
    }

    // Database
    const dbLanguages = ['SQL', 'Database'];
    const sqlHours = (languageHours.get('SQL') || 0) + (languageHours.get('Database') || 0);
    if (sqlHours > 0) {
      types.push({
        name: 'Database Work',
        description: 'SQL queries, database design, data management',
        icon: '🗄️',
        hours: sqlHours,
        percentage: (sqlHours / total) * 100,
        color: '#CC2927',
        languages: dbLanguages.filter(lang => (languageHours.get(lang) || 0) > 0)
      });
    }

    return {
      projectTypes: types.sort((a, b) => b.hours - a.hours),
      totalHours: total,
      isDormant: { unity: unityDormant }
    };
  }, [data, daysToShow]);

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-600/30">
            <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Project Type Classification</h2>
            <p className="text-xs text-gray-400">Last {daysToShow.toLocaleString('en-US')} days</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-green-300 text-xs font-semibold bg-green-900/30 px-2 py-1 rounded border border-green-700/30 hover:bg-green-900/50 transition-colors cursor-pointer"
          >
            PROJECTS
          </button>
          
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-[100] w-80">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Project Type Analysis</p>
                <p>
                  Automatically classifies development work into project categories based on file types and language patterns.
                </p>
                <p>
                  Reveals full-stack capabilities and multi-disciplinary technical breadth across web, backend, game development, and more.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Types */}
      {projectTypes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-gray-700/30 mb-3">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-semibold">No Project Activity</p>
          <p className="text-gray-500 text-xs">
            No development work detected in the last {daysToShow.toLocaleString('en-US')} days
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-3">
          {/* Summary Stats - AT THE TOP */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {/* Metric 1: Total Development Time */}
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                <p className="text-xs text-gray-400 mb-1">Total Development Time</p>
                <p className="text-lg font-bold text-white font-mono">{formatDuration(totalHours)}</p>
              </div>
              
              {/* Metric 2: Active Project Types */}
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                <p className="text-xs text-gray-400 mb-1">Active Project Types</p>
                <p className="text-lg font-bold text-white">{projectTypes.length.toLocaleString('en-US')}</p>
              </div>
            </div>
            

          </div>

          {/* Scrollable Project List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: '300px' }}>
            {projectTypes.map((project, idx) => (
              <div 
                key={idx}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">{project.icon}</div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-white">{project.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white font-mono">{formatDuration(project.hours)}</span>
                        <span className="text-xs text-gray-400">{formatPercentage(project.percentage)}%</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-2">{project.description}</p>
                    
                    {/* Languages */}
                    <div className="flex flex-wrap gap-2">
                      {project.languages.map((lang, langIdx) => (
                        <span 
                          key={langIdx}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-300 border border-gray-700/50"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3 bg-gray-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ 
                          width: `${project.percentage}%`,
                          backgroundColor: project.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        {/* Insight */}
        {projectTypes.length >= 4 ? (
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
            <p className="text-xs text-green-300 text-center">
              <span className="font-semibold">🌟 Versatile developer:</span> {projectTypes.length.toLocaleString('en-US')} project types in {daysToShow.toLocaleString('en-US')} days • Primary: {projectTypes[0].name} ({Math.round(projectTypes[0].percentage)}%)
            </p>
          </div>
        ) : projectTypes.length > 1 ? (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
            <p className="text-xs text-blue-300 text-center">
              <span className="font-semibold">🎯 Active projects:</span> {projectTypes.map(p => `${p.name} (${Math.round(p.percentage)}%)`).join(' • ')}
            </p>
          </div>
        ) : projectTypes.length === 1 ? (
          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
            <p className="text-xs text-purple-300 text-center">
              <span className="font-semibold">🎯 Focused work:</span> {projectTypes[0].name} • {formatDuration(projectTypes[0].hours)} over {daysToShow.toLocaleString('en-US')} days
            </p>
          </div>
        ) : null}
    </div>
  );
}
