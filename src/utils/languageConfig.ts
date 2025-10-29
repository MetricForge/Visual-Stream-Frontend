// utils/languageConfig.ts

export const LANGUAGE_COLORS: Record<string, string> = {
  // Core languages (GitHub official colors)
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'C#': '#178600',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'SQL': '#e38c00',
  'C++': '#f34b7d',
  'Java': '#b07219',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Shell': '#89e051',

  'Astro': '#FF5D01',
  'Visual Basic': '#945db7',
  'PHP': '#4F5D95',
  'Kotlin': '#F18E33',
  'Swift': '#F05138',

  'Data': '#10B981', // Green for data files
  'Database': '#8B5CF6', // Purple for databases
  
  // Grouped categories (only for similar file types)
  'Config': '#292929',           // JSON, YAML, TOML, XML
  'Docs': '#083fa1',             // Markdown, text files
  'Other': '#9CA3AF',
};


export const EXTENSION_MAP: Record<string, string> = {
  // TypeScript
  'ts': 'TypeScript',
  'tsx': 'TypeScript',           
  
  // JavaScript  
  'js': 'JavaScript',
  'jsx': 'JavaScript',           
  'mjs': 'JavaScript',
  
  // Python
  'py': 'Python',
  'pyw': 'Python',
  
  // C#
  'cs': 'C#',                    
  
  // Web
  'html': 'HTML',
  'htm': 'HTML',
  'css': 'CSS',
  'scss': 'CSS',
  'sass': 'CSS',
  'astro': 'Astro',
  
  // Config files
  'json': 'Config',
  'yml': 'Config',
  'yaml': 'Config',
  'toml': 'Config',
  'xml': 'Config',
  'ini': 'Config',
  'env': 'Config',
  'tsconfig': 'Config',
  'npmrc': 'Config',
  'dockerfile': 'Config',
  'dockerignore': 'Config',
  
  // Documentation
  'md': 'Docs',
  'mdx': 'Docs',
  'txt': 'Docs',
  'rst': 'Docs',
  'ipynb': 'Docs',
  
  // Other languages
  'vb': 'Visual Basic',
  'sql': 'SQL',
  'php': 'PHP',
  'kts': 'Kotlin',
  'swift': 'Swift',
  'sh': 'Shell',
  'bash': 'Shell',
  'bat': 'Shell',
  'ps1': 'Shell',
  'cpp': 'C++',
  'cc': 'C++',
  'cxx': 'C++',
  'c': 'C++',
  'h': 'C++',
  'hpp': 'C++',
  'java': 'Java',
  'go': 'Go',
  'rs': 'Rust',

    // Data files
  'csv': 'Data',
  'xlsx': 'Data',
  'xls': 'Data',
  'xlsm': 'Data',
  'db': 'Database',
  'sqlite': 'Database',
  'sqlite3': 'Database',
  'sqlite2': 'Database',
  'db3': 'Database',
  'parquet': 'Data',
  'jsonl': 'Data',
};

// Development app whitelist - filters out Slack, browsers, etc.
export const DEV_APP_NAMES = [
  'Visual Studio Code',
  'Code',
  'Microsoft Visual Studio',
  'devenv.exe',
  'Unity',
  'Unity Hub',
  'Excel',
  'Microsoft Excel',
  'SQLite',
  'SQLite Browser',
  'DB Browser for SQLite',
  'PyCharm',
  'IntelliJ IDEA',
  'WebStorm',
  'Rider',
  'Android Studio',
  'Xcode',
  'Sublime Text',
  'Atom',
  'Vim',
  'Neovim',
  'Notepad++',
  'Cursor',
  'Zed',
  'Fleet',
  'GitHub',
  'Unreal Editor',
  'Unreal Engine',
  'Godot',
  'Blender',
];

export const APP_NAME_TO_LANGUAGE: Record<string, string> = {
  'Unity': 'C#',
  'Unity.exe': 'C#',
  'devenv.exe': 'C#',
  'Excel': 'Data',
  'Microsoft Excel': 'Data',
  'SQLite': 'Database',
  'SQLite Browser': 'Database',
  'DB Browser for SQLite': 'Database',
};

export const LANGUAGE_PRIORITY_ORDER = [
  'Python',
  'C#',
  'TypeScript',
  'JavaScript',
  'HTML',
  'CSS',
  'SQL',
  'Data',
  'Database',
  'C++',
  'Astro',
  'SQL',
  'PHP',
  'Kotlin',
  'Swift',
  'Java',
  'Go',
  'Rust',
  'Shell',
  'Config',
  'Docs',
  'Visual Basic',
  'Other',
];


export function getLanguageFromActivity(title: string, appName?: string): string {
  // First: Check AppName directly
  if (appName) {
    // Direct match
    if (APP_NAME_TO_LANGUAGE[appName]) {
      return APP_NAME_TO_LANGUAGE[appName];
    } 
    
    // Partial match
    for (const [app, lang] of Object.entries(APP_NAME_TO_LANGUAGE)) {
      if (appName.includes(app)) {
        return lang;
      } 
    } 
  } 
  
  // Second: Extract extension from title
  const extension = extractFileExtension(title);
  return getLanguageFromExtension(extension);
} 


export function getLanguageFromExtension(extension: string | null): string {
  if (!extension) return 'Other';
  return EXTENSION_MAP[extension] || 'Other';
}



export function extractFileExtension(title: string): string | null {
  if (!title) return null;
  const match = title.match(/\.([a-zA-Z]{2,4})(?:\*|\s|-)/);
  return match ? match[1].toLowerCase() : null;
}

export function sortLanguagesByPriority(languages: string[]): string[] {
  return languages.sort((a, b) => {
    const aIndex = LANGUAGE_PRIORITY_ORDER.indexOf(a);
    const bIndex = LANGUAGE_PRIORITY_ORDER.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}


export function formatDuration(hours: number): string {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  // Show hours and minutes if hours > 0
  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  
  // Show only minutes if < 1 hour but > 0 minutes
  if (m > 0) {
    return `${m}m`;
  }
  
  // Show only seconds if < 1 minute
  return `${s}s`;
}
export function formatPercentage(percent: number): string {
  const rounded = Math.round(percent);
  return rounded.toLocaleString('en-US');
}

// Helper function to check if an app is a development tool
export function isDevApp(appName: string): boolean {
  if (!appName) return false;
  return DEV_APP_NAMES.some(devApp => 
    appName.includes(devApp) || devApp.includes(appName)
  );
}