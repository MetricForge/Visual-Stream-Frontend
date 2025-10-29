// components/AWMethodology.tsx
import { useState } from 'react';

const AWMethodology = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dataCollection: false,
    etl: false,
    storage: false,
    security: false,
    frontend: false,
    deployment: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50">
        <h1 className="text-4xl font-bold text-white mb-4">
          How Visual Stream Works
        </h1>
        <p className="text-lg text-gray-300 leading-relaxed">
          Visual Stream is a personal productivity analytics dashboard I built to answer a simple question:{' '}
          <span className="font-semibold text-blue-400">
            where does my time actually go when I'm working?
          </span>
        </p>
        <p className="text-lg text-gray-300 leading-relaxed mt-3">
          What started as curiosity about my own habits evolved into a full-featured analytics platform that 
          demonstrates how I approach BA work—understanding the{' '}
          <span className="italic">'why'</span> behind data requirements before building the{' '}
          <span className="italic">'what'</span>.
        </p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-3xl font-bold text-blue-400 mb-2">1</div>
          <div className="text-sm text-gray-400 mb-1">Data Sources</div>
          <div className="text-xs text-gray-500">ActivityWatch API</div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-3xl font-bold text-green-400 mb-2">24+</div>
          <div className="text-sm text-gray-400 mb-1">Components</div>
          <div className="text-xs text-gray-500">React Visualizations</div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-3xl font-bold text-purple-400 mb-2">6</div>
          <div className="text-sm text-gray-400 mb-1">Architecture Layers</div>
          <div className="text-xs text-gray-500">Collection → ETL → Storage → Security → UI → Deployment</div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-3xl font-bold text-orange-400 mb-2">7+</div>
          <div className="text-sm text-gray-400 mb-1">Tech Stack</div>
          <div className="text-xs text-gray-500">Languages & Tools</div>
        </div>
      </div>

      {/* Visual Architecture Diagram */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-6">System Architecture</h2>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/30 rounded-lg px-4 py-2 min-w-[180px] text-center">
              <div className="text-sm font-bold text-white">ActivityWatch</div>
              <div className="text-xs text-blue-300">(Local SQLite DB)</div>
            </div>
            <div className="text-2xl text-gray-500">→</div>
            <div className="bg-green-600/30 rounded-lg px-4 py-2 min-w-[180px] text-center">
              <div className="text-sm font-bold text-white">Python ETL</div>
              <div className="text-xs text-green-300">(Transform & Export)</div>
            </div>
            <div className="text-2xl text-gray-500">→</div>
            <div className="bg-purple-600/30 rounded-lg px-4 py-2 min-w-[180px] text-center">
              <div className="text-sm font-bold text-white">R2 Storage</div>
              <div className="text-xs text-purple-300">(CSV Files)</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-red-600/30 rounded-lg px-4 py-2 min-w-[180px] text-center">
              <div className="text-sm font-bold text-white">CF Workers</div>
              <div className="text-xs text-red-300">(Security Gateway)</div>
            </div>
            <div className="text-2xl text-gray-500">→</div>
            <div className="bg-orange-600/30 rounded-lg px-4 py-2 min-w-[180px] text-center">
              <div className="text-sm font-bold text-white">React UI</div>
              <div className="text-xs text-orange-300">(TypeScript + Recharts)</div>
            </div>
            <div className="text-2xl text-gray-500">→</div>
            <div className="bg-pink-600/30 rounded-lg px-4 py-2 min-w-[180px] text-center">
              <div className="text-sm font-bold text-white">Kinsta Deploy</div>
              <div className="text-xs text-pink-300">(GitHub CI/CD)</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400 text-center">
          Full CI/CD pipeline: Code push to GitHub triggers automatic build and deployment to Kinsta with custom domain and CDN distribution.
        </div>
      </div>

      {/* The Challenge */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-4">The Challenge</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          As a developer and analyst who works across multiple projects, I struggled to understand my true 
          productivity patterns. Traditional time-tracking tools had major limitations:
        </p>

        <div className="grid md:grid-cols-3 gap-4 my-6">
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <div className="font-semibold text-red-300 mb-2">❌ Manual Entry Required</div>
            <div className="text-sm text-gray-400">
              Tools like Toggl require you to remember to start/stop timers
            </div>
          </div>
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <div className="font-semibold text-red-300 mb-2">❌ Privacy Concerns</div>
            <div className="text-sm text-gray-400">
              Cloud-based tools like RescueTime store sensitive data externally
            </div>
          </div>
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <div className="font-semibold text-red-300 mb-2">❌ Lack of Insights</div>
            <div className="text-sm text-gray-400">
              Most tools show raw data but don't help you understand patterns
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 my-6">
          <h3 className="text-lg font-bold text-blue-300 mb-3">Questions I needed answered:</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>When am I most productive? (time of day patterns)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>How much time do I actually spend coding vs. context-switching?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Which programming languages/tools dominate my workflow?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>What are my typical workflow sequences? (IDE → Browser → Terminal)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Where do distractions come from and how much time do they cost?</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-900/50 border-l-4 border-gray-600 p-6 italic">
          <p className="text-gray-300 text-lg">
            "At the end of the day, dashboards are just expensive reporting if they don't help people make better decisions. 
            I needed a tool that would tell me the story behind my work patterns—not just show me numbers."
          </p>
        </div>

        <p className="text-gray-300 leading-relaxed mt-6">
          <span className="font-semibold">The Core Problem:</span> There was no solution that automatically 
          collected accurate activity data AND transformed it into insights that help me make better decisions 
          about how I work.
        </p>
      </div>

      {/* Solution Approach */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-xl p-8 border border-indigo-700/50 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-4">Solution Approach</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          My solution required building an end-to-end data pipeline—not just a dashboard, but a complete ETL system 
          with cloud infrastructure and security. Every technical decision was driven by specific business and operational requirements.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-semibold text-white">Automated Data Collection</div>
              <div className="text-gray-300 text-sm">
                ActivityWatch runs locally 24/7, passively tracking all computer activity
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600/30 rounded-full flex items-center justify-center text-green-400 font-bold flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-semibold text-white">Smart ETL Processing</div>
              <div className="text-gray-300 text-sm">
                Python script transforms raw events into analytics-ready CSV files every 30 minutes
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-400 font-bold flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-semibold text-white">Secure Cloud Storage</div>
              <div className="text-gray-300 text-sm">
                Cloudflare R2 + Workers provides zero-egress-cost storage with security gateway
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-600/30 rounded-full flex items-center justify-center text-orange-400 font-bold flex-shrink-0">
              4
            </div>
            <div>
              <div className="font-semibold text-white">Question-Driven Visualizations</div>
              <div className="text-gray-300 text-sm">
                24+ React components designed to answer specific productivity questions
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-pink-600/30 rounded-full flex items-center justify-center text-pink-400 font-bold flex-shrink-0">
              5
            </div>
            <div>
              <div className="font-semibold text-white">Production CI/CD Pipeline</div>
              <div className="text-gray-300 text-sm">
                GitHub → automated build → Kinsta deployment with custom domain
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Architecture - Collapsible Sections */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-6">Technical Architecture</h2>

        {/* Layer 1: Data Collection */}
        <div className="mb-4 border border-gray-700/30 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('dataCollection')}
            className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center text-blue-400 font-bold">
                1
              </div>
              <span className="font-semibold text-white">Data Collection Layer</span>
              <span className="text-sm text-gray-400">(ActivityWatch)</span>
            </div>
            <span className="text-gray-400 text-xl">
              {expandedSections.dataCollection ? '▲' : '▼'}
            </span>
          </button>
          
          {expandedSections.dataCollection && (
            <div className="p-6 bg-gray-800/50 border-t border-gray-700/30">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-blue-300 mb-2">Decision: ActivityWatch API Integration</div>
                <div className="text-sm text-gray-400 mb-2">
                  <span className="font-semibold">Why:</span> Needed automated, passive tracking without manual input. 
                  ActivityWatch runs locally, respects privacy, and captures application-level activity with millisecond precision timestamps.
                </div>
                <div className="text-sm text-gray-400">
                  <span className="font-semibold">Business Reasoning:</span> Manual time tracking has 40-60% error rates. 
                  Automation ensures 100% data completeness while eliminating user friction.
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                  <div className="font-semibold text-blue-300 mb-1">
                    🪟 Window Watcher (aw-watcher-window)
                  </div>
                  <div className="text-sm text-gray-400">
                    Tracks active application and window title every 1-5 seconds
                  </div>
                </div>

                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                  <div className="font-semibold text-green-300 mb-1">
                    ⌨️ AFK Watcher (aw-watcher-afk)
                  </div>
                  <div className="text-sm text-gray-400">
                    Monitors keyboard/mouse input to detect idle time (3+ minutes without input = AFK)
                  </div>
                </div>

                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
                  <div className="font-semibold text-purple-300 mb-1">
                    📝 Editor Watcher (aw-watcher-vscode)
                  </div>
                  <div className="text-sm text-gray-400">
                    Tracks VS Code file activity, language, and project context
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layer 2: ETL Processing */}
        <div className="mb-4 border border-gray-700/30 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('etl')}
            className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600/30 rounded-full flex items-center justify-center text-green-400 font-bold">
                2
              </div>
              <span className="font-semibold text-white">ETL Processing Layer</span>
              <span className="text-sm text-gray-400">(Python Scripts)</span>
            </div>
            <span className="text-gray-400 text-xl">
              {expandedSections.etl ? '▲' : '▼'}
            </span>
          </button>
          
          {expandedSections.etl && (
            <div className="p-6 bg-gray-800/50 border-t border-gray-700/30">
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-green-300 mb-2">Data Transformation Pipeline</div>
                <div className="text-sm text-gray-400 mb-2">
                  Custom Python script handles the complete ETL process—extracting raw ActivityWatch events, 
                  transforming them into analytics-ready format, and loading to cloud storage.
                </div>
                <div className="text-sm text-gray-400">
                  <span className="font-semibold">Business Reasoning:</span> Separating data processing from visualization 
                  allows independent scaling and easier debugging. Pipeline can run on schedule without frontend dependency.
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                  <div className="font-semibold text-blue-300 mb-1">1. Fetch Events</div>
                  <div className="text-sm text-gray-400">
                    Query ActivityWatch API for all events since last run
                  </div>
                  <div className="text-xs text-blue-400 mt-1 font-mono">
                    GET /api/0/buckets/&#123;bucket&#125;/events
                  </div>
                </div>

                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                  <div className="font-semibold text-green-300 mb-1">2. Categorize Applications</div>
                  <div className="text-sm text-gray-400">
                    Map app names to categories using utils/appCategories.ts logic
                  </div>
                  <div className="text-xs text-green-400 mt-1">
                    Development, Testing, Tools, Communication, Entertainment, Browser, Utilities
                  </div>
                </div>

                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
                  <div className="font-semibold text-purple-300 mb-1">3. Filter AFK Time</div>
                  <div className="text-sm text-gray-400">
                    Remove or mark events where user was detected as away from keyboard
                  </div>
                </div>

                <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/30">
                  <div className="font-semibold text-orange-300 mb-1">4. Aggregate & Transform</div>
                  <div className="text-sm text-gray-400">
                    Calculate durations, session boundaries, hourly rollups, and daily summaries
                  </div>
                </div>

                <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-700/30">
                  <div className="font-semibold text-pink-300 mb-1">5. Export to CSV</div>
                  <div className="text-sm text-gray-400">
                    Generate optimized CSV files for frontend consumption
                  </div>
                  <div className="text-xs text-pink-400 mt-1 font-mono">
                    activity_data.csv, development_data.csv, etc.
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                <div className="text-sm font-semibold text-gray-300 mb-2">Environment & Security</div>
                <div className="text-xs text-gray-400">
                  Uses environment variables and secrets management for API keys and R2 credentials—no hardcoded credentials in code.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layer 3: Storage */}
        <div className="mb-4 border border-gray-700/30 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('storage')}
            className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-400 font-bold">
                3
              </div>
              <span className="font-semibold text-white">Storage Layer</span>
              <span className="text-sm text-gray-400">(Cloudflare R2)</span>
            </div>
            <span className="text-gray-400 text-xl">
              {expandedSections.storage ? '▲' : '▼'}
            </span>
          </button>
          
          {expandedSections.storage && (
            <div className="p-6 bg-gray-800/50 border-t border-gray-700/30">
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-purple-300 mb-2">Decision: Cloudflare R2 Object Storage</div>
                <div className="text-sm text-gray-400 mb-2">
                  <span className="font-semibold">Why:</span> S3-compatible storage without egress fees. 
                  Stores processed CSV files that frontend consumes.
                </div>
                <div className="text-sm text-gray-400">
                  <span className="font-semibold">Business Reasoning:</span> Decouples data storage from application hosting. 
                  Frontend can be static (fast, cheap) while data remains centralized and versioned.
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                  <div className="font-semibold text-blue-300 mb-1">
                    ☁️ Why Cloudflare R2?
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1 mt-2">
                    <li>• Free egress bandwidth (unlike AWS S3)</li>
                    <li>• Fast global CDN distribution</li>
                    <li>• S3-compatible API (easy Python integration)</li>
                    <li>• Cost-effective for personal projects</li>
                  </ul>
                </div>

                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                  <div className="font-semibold text-green-300 mb-1">
                    📁 File Structure
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-2 space-y-1">
                    <div>/activity_data.csv (main events)</div>
                    <div>/development_data.csv (coding stats)</div>
                    <div>/daily_summary.csv (aggregated metrics)</div>
                    <div>/last_updated.json (metadata)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layer 4: Security (Cloudflare Workers) */}
        <div className="mb-4 border border-gray-700/30 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('security')}
            className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600/30 rounded-full flex items-center justify-center text-red-400 font-bold">
                4
              </div>
              <span className="font-semibold text-white">Security Layer</span>
              <span className="text-sm text-gray-400">(Cloudflare Workers)</span>
            </div>
            <span className="text-gray-400 text-xl">
              {expandedSections.security ? '▲' : '▼'}
            </span>
          </button>
          
          {expandedSections.security && (
            <div className="p-6 bg-gray-800/50 border-t border-gray-700/30">
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-red-300 mb-2">Cloudflare Workers Security Layer</div>
                <div className="text-sm text-gray-400 mb-2">
                  All data requests are proxied through Cloudflare Workers—direct access to R2 buckets is blocked. 
                  Workers act as a security gateway.
                </div>
                <div className="text-sm text-gray-400">
                  <span className="font-semibold">Business Reasoning:</span> Protects sensitive activity data from unauthorized access. 
                  Even if bucket URLs leaked, data remains secure. Demonstrates understanding of zero-trust architecture.
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                  <div className="font-semibold text-red-300 mb-2">🚫 Direct CSV Access: DENIED</div>
                  <div className="text-sm text-gray-400">
                    Attempting to directly download or access raw CSV files from R2 URLs returns 403 Forbidden. 
                    All requests must go through authenticated Worker endpoints.
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                  <div className="font-semibold text-green-300 mb-2">✓ Worker-Mediated Access: ALLOWED</div>
                  <div className="text-sm text-gray-400">
                    Workers validate requests, apply rate limiting, log access patterns, and serve data only to authorized origins.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layer 5: Frontend */}
        <div className="mb-4 border border-gray-700/30 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('frontend')}
            className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600/30 rounded-full flex items-center justify-center text-orange-400 font-bold">
                5
              </div>
              <span className="font-semibold text-white">Frontend Layer</span>
              <span className="text-sm text-gray-400">(React + TypeScript)</span>
            </div>
            <span className="text-gray-400 text-xl">
              {expandedSections.frontend ? '▲' : '▼'}
            </span>
          </button>
          
          {expandedSections.frontend && (
            <div className="p-6 bg-gray-800/50 border-t border-gray-700/30">
              <p className="text-gray-300 mb-4">
                Frontend fetches processed CSV data through Worker endpoints, performs client-side calculations 
                for interactivity, and renders 24+ visualization components.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                  <div className="font-semibold text-blue-300 mb-2">React + TypeScript</div>
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold">Why:</span> Type safety, component reusability, scalability
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Add visualizations without breaking existing ones
                  </div>
                </div>

                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                  <div className="font-semibold text-green-300 mb-2">Recharts Library</div>
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold">Why:</span> Declarative, composable charts
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Faster iteration on user feedback
                  </div>
                </div>

                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
                  <div className="font-semibold text-purple-300 mb-2">TailwindCSS</div>
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold">Why:</span> Rapid, consistent UI development
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Professional appearance without CSS overhead
                  </div>
                </div>

                <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/30">
                  <div className="font-semibold text-orange-300 mb-2">Modular Components</div>
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold">Why:</span> Each viz is independent
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Easy to test, maintain, extend
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                <div className="font-semibold text-gray-300 mb-2">📊 Component Architecture</div>
                <div className="text-sm text-gray-400 mb-2">
                  24+ modular components, each handling specific analytics:
                </div>
                <div className="text-xs text-gray-400 grid grid-cols-2 gap-1">
                  <div>• AWCategoryDistribution.tsx</div>
                  <div>• AWActivityRhythmHeatmap.tsx</div>
                  <div>• AWAppTransitionNetwork.tsx</div>
                  <div>• AWWorkflowIntelligence.tsx</div>
                  <div>• AWDevelopmentStats.tsx</div>
                  <div>• AWLanguageVelocity.tsx</div>
                  <div>• AWAnomalyDetection.tsx</div>
                  <div>• AWProductivityForecast.tsx</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layer 6: Deployment (GitHub + Kinsta) */}
        <div className="mb-4 border border-gray-700/30 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('deployment')}
            className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-600/30 rounded-full flex items-center justify-center text-pink-400 font-bold">
                6
              </div>
              <span className="font-semibold text-white">Deployment Layer</span>
              <span className="text-sm text-gray-400">(GitHub + Kinsta)</span>
            </div>
            <span className="text-gray-400 text-xl">
              {expandedSections.deployment ? '▲' : '▼'}
            </span>
          </button>
          
          {expandedSections.deployment && (
            <div className="p-6 bg-gray-800/50 border-t border-gray-700/30">
              <div className="bg-pink-900/20 border border-pink-700/50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-pink-300 mb-2">CI/CD Implementation</div>
                <div className="text-sm text-gray-400 mb-2">
                  Implemented automated deployment pipeline for zero-downtime updates and version control.
                </div>
                <div className="text-sm text-gray-400">
                  <span className="font-semibold">Business Reasoning:</span> Automated deployment eliminates manual errors 
                  and enables rapid iteration. Treating this as a production system (not a toy project) demonstrates 
                  understanding of real-world software operations and DevOps practices.
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                  <div className="font-semibold text-gray-300 mb-1">
                    📦 Version Control (GitHub)
                  </div>
                  <div className="text-sm text-gray-400">
                    Source code managed in GitHub repository with proper branching strategy
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Business value: Change tracking, rollback capability, collaboration-ready
                  </div>
                </div>

                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
                  <div className="font-semibold text-purple-300 mb-1">
                    ⚡ Automated Deployment (Kinsta)
                  </div>
                  <div className="text-sm text-gray-400">
                    Git push triggers automatic build and deployment to production
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Business value: Fast iteration cycles, reduced manual deployment errors
                  </div>
                </div>

                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                  <div className="font-semibold text-blue-300 mb-1">
                    🌐 Custom Domain & CDN
                  </div>
                  <div className="text-sm text-gray-400">
                    Professional domain (metricforge.dev) with global CDN distribution via Kinsta
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Business value: Fast load times worldwide, professional branding
                  </div>
                </div>

                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                  <div className="font-semibold text-green-300 mb-1">
                    🔧 Production-Ready Infrastructure
                  </div>
                  <div className="text-sm text-gray-400">
                    Managed hosting with automatic SSL, DNS management, and uptime monitoring
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Business value: Reliable, secure, maintainable production environment
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Pipeline Performance */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-6">Data Pipeline Performance</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                ⏱️
              </div>
              <div>
                <div className="font-semibold text-white">ETL Frequency</div>
                <div className="text-gray-400">Runs every 30 minutes via cron job</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                📅
              </div>
              <div>
                <div className="font-semibold text-white">Historical Data</div>
                <div className="text-gray-400">Full history since October 2025</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                ⚡
              </div>
              <div>
                <div className="font-semibold text-white">Processing Speed</div>
                <div className="text-gray-400">&lt; 15 seconds per run</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-600/30 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                💾
              </div>
              <div>
                <div className="font-semibold text-white">Data Volume</div>
                <div className="text-gray-400">~3MB of CSV data (growing)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
          <div className="flex items-center gap-2 text-green-300 font-semibold mb-2">
            <span className="text-xl">✅</span>
            <span>Pipeline Reliability</span>
          </div>
          <div className="text-sm text-gray-400">
            Automated error logging, Discord webhook notifications on failures, and incremental 
            processing ensure zero data loss even during outages.
          </div>
        </div>
      </div>

      {/* Question-Driven Design */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-4">Question-Driven Design</h2>
        <p className="text-gray-300 mb-6">
          Every visualization answers a specific user question—design driven by actual information needs, not just "looks cool."
        </p>

        <div className="space-y-3">
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <div className="font-semibold text-blue-300 mb-1">Question: "When am I most productive?"</div>
            <div className="text-sm text-gray-400">
              → <span className="font-mono text-xs">AWActivityRhythmHeatmap.tsx</span> shows minute-by-minute activity patterns across all days
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
            <div className="font-semibold text-green-300 mb-1">Question: "Am I context-switching too much?"</div>
            <div className="text-sm text-gray-400">
              → <span className="font-mono text-xs">AWAppTransitionNetwork.tsx</span> tracks workflow sequences and identifies distraction patterns
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
            <div className="font-semibold text-purple-300 mb-1">Question: "Which languages/tools do I actually use?"</div>
            <div className="text-sm text-gray-400">
              → <span className="font-mono text-xs">AWLanguageVelocity.tsx</span> shows 30-day coding trends by language
            </div>
          </div>

          <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
            <div className="font-semibold text-orange-300 mb-1">Question: "Are my work patterns sustainable?"</div>
            <div className="text-sm text-gray-400">
              → <span className="font-mono text-xs">AWConsistencyTracker.tsx</span> measures productive streaks and habit consistency
            </div>
          </div>

          <div className="bg-pink-900/20 border border-pink-700/30 rounded-lg p-4">
            <div className="font-semibold text-pink-300 mb-1">Question: "Should I expect busy/slow days ahead?"</div>
            <div className="text-sm text-gray-400">
              → <span className="font-mono text-xs">AWProductivityForecast.tsx</span> predicts future activity based on historical patterns
            </div>
          </div>
        </div>
      </div>

      {/* Complete Tech Stack */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-6">Complete Technology Stack</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <div className="font-semibold text-blue-300 mb-3">Data Collection</div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• ActivityWatch</li>
              <li>• SQLite (local)</li>
              <li>• Python REST API</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <div className="font-semibold text-green-300 mb-3">ETL & Storage</div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Python 3.10+</li>
              <li>• Pandas (data processing)</li>
              <li>• Cloudflare R2</li>
              <li>• Cron scheduling</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <div className="font-semibold text-purple-300 mb-3">Security</div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Cloudflare Workers</li>
              <li>• Environment secrets</li>
              <li>• Rate limiting</li>
              <li>• Access logging</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <div className="font-semibold text-orange-300 mb-3">Frontend</div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• React 18</li>
              <li>• TypeScript</li>
              <li>• Recharts</li>
              <li>• TailwindCSS</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <div className="font-semibold text-pink-300 mb-3">Build & Deploy</div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Vite (bundler)</li>
              <li>• GitHub (version control)</li>
              <li>• Kinsta (hosting)</li>
              <li>• Custom domain + CDN</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <div className="font-semibold text-red-300 mb-3">DevOps</div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Automated CI/CD</li>
              <li>• Secrets management</li>
              <li>• Discord webhooks</li>
              <li>• Error monitoring</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Known Limitations */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-6">Known Limitations</h2>
        
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <div className="font-semibold text-yellow-300 mb-2">
                  AFK Detection During Video Watching
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  ActivityWatch relies on keyboard/mouse input to detect activity. When watching videos 
                  (YouTube, Netflix) without interaction, the system may incorrectly mark time as AFK.
                </div>
                <div className="text-xs text-gray-500 italic">
                  Workaround: The browser watcher detects audio playback to partially mitigate this, 
                  but it's not perfect for all video platforms.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🖥️</span>
              <div className="flex-1">
                <div className="font-semibold text-yellow-300 mb-2">
                  Window Focus vs. Actual Attention
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  The window watcher only tracks which window has focus, not where your eyes are looking. 
                  You might be reading documentation on a second monitor while a different window is active.
                </div>
                <div className="text-xs text-gray-500 italic">
                  Impact: Time attribution may not reflect true attention distribution on multi-monitor setups.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐧</span>
              <div className="flex-1">
                <div className="font-semibold text-yellow-300 mb-2">
                  Wayland Compatibility Issues
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  On Linux systems using Wayland (vs. X11), some desktop environments restrict apps 
                  from reading window titles for security/privacy reasons.
                </div>
                <div className="text-xs text-gray-500 italic">
                  Solution: Visual Stream is developed on X11-based systems where this limitation doesn't apply.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div className="flex-1">
                <div className="font-semibold text-yellow-300 mb-2">
                  Activity is Estimated, Not Perfect
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  All time tracking is inherently approximate. The definition of "productive" vs. 
                  "unproductive" is subjective and context-dependent.
                </div>
                <div className="text-xs text-gray-500 italic">
                  Philosophy: Visual Stream provides patterns and trends to inform decisions, not 
                  absolute truth about productivity.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="text-sm text-gray-400">
            💡 <span className="font-semibold">Despite these limitations</span>, Visual Stream provides 
            valuable insights into work patterns that would be impossible to track manually. The goal 
            isn't perfection—it's understanding trends and making informed decisions about time allocation.
          </div>
        </div>
      </div>

      {/* Business Analysis Perspective */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-xl p-8 border border-indigo-700/50 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-6">The Business Analysis Perspective</h2>

        <p className="text-gray-300 mb-6">
          This project demonstrates core BA competencies beyond just technical implementation:
        </p>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="font-semibold text-white">Requirements Engineering</div>
              <div className="text-gray-300 text-sm">
                Identified stakeholder needs through self-reflection and gap analysis of existing tools
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600/30 rounded-full flex items-center justify-center text-green-400 font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="font-semibold text-white">Solution Design</div>
              <div className="text-gray-300 text-sm">
                Architected a scalable, modular dashboard system with reusable components
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-400 font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="font-semibold text-white">Data Modeling</div>
              <div className="text-gray-300 text-sm">
                Designed data transformation pipelines from raw events to actionable insights
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-600/30 rounded-full flex items-center justify-center text-orange-400 font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="font-semibold text-white">User-Centered Design</div>
              <div className="text-gray-300 text-sm">
                Built iteratively based on real usage, refining visualizations for clarity
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-pink-600/30 rounded-full flex items-center justify-center text-pink-400 font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="font-semibold text-white">Systems Thinking</div>
              <div className="text-gray-300 text-sm">
                Designed for scalability, security, and maintainability—not just "make it work"
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-600/30 rounded-full flex items-center justify-center text-red-400 font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="font-semibold text-white">ETL Understanding</div>
              <div className="text-gray-300 text-sm">
                Can design and implement full data pipelines, not just consume data
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key BA Takeaways */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-bold text-white mb-6">Key BA Takeaways</h2>

        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/30">
            <div className="font-semibold text-blue-300 mb-2 text-lg">
              1. Understanding the 'why' is more important than the 'what'
            </div>
            <div className="text-gray-300 text-sm">
              Users don't want dashboards—they want answers. By focusing on specific questions stakeholders need answered, 
              I created visualizations that drive action rather than just displaying data. This mirrors professional BA work: 
              always start with the business problem, not the solution.
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/30">
            <div className="font-semibold text-green-300 mb-2 text-lg">
              2. Less is more when each element has purpose
            </div>
            <div className="text-gray-300 text-sm">
              My initial version had too many metrics. Through self-testing, I realized overwhelming users with data is counterproductive. 
              The best dashboards are focused, scannable, and opinionated about what matters. Every visualization should answer a specific question.
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/30">
            <div className="font-semibold text-purple-300 mb-2 text-lg">
              3. Iterative refinement beats perfect planning
            </div>
            <div className="text-gray-300 text-sm">
              I didn't build all 24 components at once. I started with basic time tracking, identified gaps through usage, 
              and incrementally added sophisticated features like forecasting and anomaly detection. This agile approach mirrors 
              how BAs should work with stakeholders—deliver value early, learn, and iterate.
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/30">
            <div className="font-semibold text-orange-300 mb-2 text-lg">
              4. Technical depth enables business value
            </div>
            <div className="text-gray-300 text-sm">
              The sophisticated algorithms (forecasting, pattern detection, session merging) aren't just for show—they directly enable 
              better business decisions. Good BAs need enough technical understanding to bridge the gap between what's technically possible 
              and what's business-valuable.
            </div>
          </div>
        </div>
      </div>

      {/* Professional Application */}
      <div className="bg-gray-900/50 border-l-4 border-blue-600 p-6 rounded-lg">
        <div className="text-lg text-gray-300 italic mb-4">
          "This project reinforced my core belief about analytics work: dashboards are just expensive reporting if they 
          don't help people make better decisions. We analysts aren't doing our jobs if we don't understand the data at 
          a fundamental level. You can't create stories if you don't understand the plot yourself."
        </div>
        <div className="text-sm text-gray-400">
          <span className="font-semibold text-white">How This Applies to Professional BA Work:</span> The same principles 
          I applied here—understanding stakeholder needs, designing for actionability, iterating based on feedback, and balancing 
          technical sophistication with usability—are exactly what I bring to business analysis roles. Whether it's productivity analytics, 
          operational dashboards, or business intelligence, the process is the same: listen, analyze, build, deliver, refine.
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700/50">
        <div className="text-center text-sm text-gray-400">
          <p className="mb-2">
            This methodology demonstrates my approach to business analysis: understanding problems deeply before building solutions.
          </p>
          <p className="font-semibold text-white mb-3">
            Visual Stream is actively maintained and continuously improved based on real-world usage.
          </p>
          <p className="text-xs text-gray-500">
            Built with React, TypeScript, Recharts, and TailwindCSS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AWMethodology;
