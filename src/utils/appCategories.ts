// utils/appCategories.ts

export type AppCategory = 'Development' | 'Testing & QA' | 'Operations' | 'Tools' | 'Communication' | 'Browser' | 'Entertainment' | 'Other';

export type ActivityType = 'productive' | 'leisure';

// Add this constant at the top
export const CATEGORY_ORDER = [
  'Browser',
  'Development',      // Previously Coding (Writing code, building features)
  'Testing & QA',     // Development related testing (Testing, debugging, code review)
  'Operations',       // Dev Ops (Deploying, infrastructure, monitoring)
  'Communication',    // Emails / Instant Messaging
  'Tools',            // Productivity tools like Word, Excel, Notion
  'Entertainment',    // Games, Music, Videos
  'Other'             // Uncategorized or miscellaneous
];

//export const COLORS: Record<string, string> = {
export const COLORS: Record<AppCategory, string> = {
  'Development': '#3b82f6',      // Blue
  'Testing & QA': '#8b5cf6',     // Purple
  'Operations': '#f59e0b',       // Orange
  'Tools': '#10b981',            // Green
  'Communication': '#ec4899',    // Pink
  'Browser': '#06b6d4',          // Cyan
  'Entertainment': '#ef4444',    // Red
  'Other': '#6b7280'             // Gray
};

const APPS_BY_CATEGORY: Record<AppCategory, string[]> = {
  Development: [
    'Microsoft Visual Studio',
    'Visual Studio Code',
    'Microsoft Management Console',
    'Unity',
  ],
  'Testing & QA': [
    'Windows PowerShell',
    'Dev Testing',
    'Windows Error Reporting/werfault.exe',
    'Testing & QA',  // General testing category
    'Manual Testing',  //Testing performed by a person interacting with the software/game directly rather than using automated scripts
    'Performance Testing', //Testing how well the software runs under various conditions, measuring metrics like frame rate, load times, memory usage, and system resource consumption
    'Functional Testing', //Testing whether features and mechanics work correctly as intended according to the specifications, ensuring buttons respond, actions trigger properly, and core gameplay functions without bugs
    'Usability Testing'  //Testing how intuitive, user-friendly, and enjoyable the interface and controls feel to players, evaluating ease of navigation and overall user experience
  ],
  Operations: [
    'Operations Monitoring',
    'SQLite',
    'Cloudflare',
    'GitHub'
  ],
  Tools: [
    'Microsoft Excel',
    'Microsoft Word',
    'Microsoft PowerPoint',
    'File Explorer',
    'Notepad',
    'ShareX',
    'Standard Notes',
    'LinkedIn',
    'Notion',
    'AI Tools',
    'ExitLag',
    'Activity Watch',
    'Paint'
  ],
  Communication: [
    'Rambox',
    'WhatsApp',
    'Discord',
    'Facebook Messenger',
    'Telegram',
    'Email',
    'Forums',
    'Slack'
  ],
  Browser: [
    'Microsoft Edge',
    'Google Chrome',
    'Mozilla Firefox',
    'Brave Browser'
  ],
  Entertainment: [
    'Dragon Ball Gekishin Squadra',
    'Black Desert Online',
    'Legends of Idleon',
    'Marvel Snap',
    'Gacha Games',
    'Grand Theft Auto V',
    'Guild Wars 2',
    'Spotify',
    'Taiga',
    'YouTube',
    'Netflix',
    'Twitch',
    'VLC Media Player',
    'Digimon Story Time Stranger',
    'League of Legends',
    'Mabinogi',
    'Evil Genius 2',
    'Stella Sora',
    'Summoners War Rush',
    'Raven2',
    'Souls Remnant'
  ],
  Other: [
    'Steam',
    'Reddit',
    'Twitter/X',
    'Instagram',
    'Facebook',
    'Epic Games'
  ]
};

// Categorize by detailed category
export const categorizeApp = (appName: string): AppCategory => {
  for (const [category, keywords] of Object.entries(APPS_BY_CATEGORY)) {
    if (keywords.some(keyword => appName.toLowerCase().includes(keyword.toLowerCase()))) {
      return category as AppCategory;
    }
  }
  return 'Other';
};

// Categorize by activity type (productive vs leisure)
export const categorizeActivity = (appName: string): ActivityType => {
  const category = categorizeApp(appName);
  // Only Entertainment is leisure, everything else is productive
  if (category === 'Entertainment') {
    return 'leisure';
  }
  return 'productive';
};
