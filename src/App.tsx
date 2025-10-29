import './index.css';
import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';


// AW HighLevel Summary View
import AWTotalTimeCard from './components/AWTotalTimeCard';
import AWWorkLifeBalanceCard from './components/AWWorkLifeBalanceCard';
import AWContextSwitchCard from './components/AWContextSwitchCard';
import AWCategoryDonut from './components/AWCategoryDonut';
import AWTopAppsBar from './components/AWTopAppsBar';
import AWHourlyActivity from './components/AWHourlyActivity';

//AWAppBehaviorPatterns aka Application Behavior Patterns Views
import AWAppTransitionNetwork from './components/AWAppTransitionNetwork';
import AWSessionLengthDistr from './components/AWSessionLengthDistr';
import AWContextSwitchAnalysis from './components/AWContextSwitchAnalysis';

//AWActivityRhythmAnalysis aka Daily Activity Patterns
import AWActivityRhythmHeatmap from './components/AWActivityRhythmHeatmap';
import AWCategoryDistribution from './components/AWCategoryDistribution';
import AWPeakActivityWindows from './components/AWPeakActivityWindows';
import AWAppLoyaltyMeter from './components/AWAppLoyaltyMeter';

//AWPredictiveAnalysis aka Predictive Analysis
import AWProductivityForecast from './components/AWProductivityForecast';
import AWAnomalyDetection from './components/AWAnomalyDetection';
import AWConsistencyTracker from './components/AWConsistencyTracker';
import AWWorkflowIntelligence from './components/AWWorkflowIntelligence';

//AWDevSnapshot aka Development Snapshot
import AWTechStackBreakdown  from './components/AWTechStackBreakdown';
import AWLanguageVelocity  from './components/AWLanguageVelocity';
import AWProjectTypeClassifier from './components/AWProjectTypeClassifier';

//AWTechnicalProfile aka Technical Profile
import AWStackEvolution from './components/AWStackEvolution';
import AWLanguageHeatmap from './components/AWLanguageHeatmap';
import AWDevelopmentStats from './components/AWDevelopmentStats';

//AWMethodology aka Methodology
import AWMethodology from './components/AWMethodology';


// Filters & Page Selector & Exclusions
import PageSelector from './components/PageSelector';


// Footer
import Footer from './components/Footer';

// Microsoft Clarity
import clarity from "@microsoft/clarity";



const ExploreButton = ({ setHasEntered }: { setHasEntered: (val: boolean) => void }) => {
  const [progress, setProgress] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const duration = 1500;
    const interval = 20;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 102) {
          clearInterval(timer);
          return 102;
        }
        return Math.min(prev + increment, 102);
      });

      setWaveOffset((prev) => (prev + 2) % 360);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const createWave = (offset: number, amplitude = 2, points = 15) => {
    return Array.from({ length: points }, (_, i) => {
      const y = (i / (points - 1)) * 100;
      const wave = Math.sin((y * 5 + offset) * 0.15) * amplitude;
      return `${progress + wave + 2}% ${y}%`;
    }).join(', ');
  };

  return (
    <button
      onClick={() => {
        console.log('Entered!');
        setHasEntered(true);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      type="button"
      className="relative z-20 overflow-hidden text-white font-bold text-xl py-4 px-16 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl cursor-pointer active:scale-95 bg-gray-900/40 border border-gray-700"
    >
      {/* Neon liquid waves */}
      {[1, 2, 3].map((i) => {
        const amplitude = 2 + i;
        const opacity = 0.4 + i * 0.2;
        const offset = waveOffset + i * 20;
        const blur = 10 + i * 5;
        return (
          <div
            key={i}
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              clipPath: `polygon(
                0% 0%, 
                ${createWave(offset, amplitude)}, 
                ${progress + amplitude + 2}% 100%, 
                0% 100%
              )`,
              background: 'linear-gradient(90deg, #ff0080, #7928ca, #00c6ff)',
              boxShadow: isHovered 
                ? '0 0 25px #ff0080, 0 0 40px #7928ca, 0 0 60px #00c6ff'
                : '0 0 15px #ff0080, 0 0 25px #7928ca, 0 0 35px #00c6ff',
              opacity: isHovered ? opacity + 0.2 : opacity,
              filter: `blur(${isHovered ? blur - 3 : blur}px) brightness(${isHovered ? 1.2 : 1})`,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              zIndex: 0,
            }}
          />
        );
      })}

      {/* Ripple effect on hover */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,128,0.4) 0%, transparent 70%)',
            animationDuration: '1s',
          }}
        />
      )}

      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          transform: isHovered ? 'translateX(200%)' : 'translateX(-200%)',
          transition: 'transform 0.8s ease-in-out',
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Button text with glow */}
      <span 
        className="relative z-10 transition-all duration-300"
        style={{
          textShadow: isHovered 
            ? '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,0,128,0.6)'
            : 'none',
        }}
      >
        Initialize
      </span>
    </button>
  );
};

// cache busters
const cacheBusted = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`;






function App() {
    const [showPageSelector, setShowPageSelector] = useState(false);
const [hasEntered, setHasEntered] = useState(false); 

const [showError, setShowError] = useState(false);
  const [awData, setAwData] = useState<any[]>([]);


  const [selectedPage, setSelectedPage] = useState('AWHLSummary');

    // Load ActivityWatch data
    useEffect(() => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-endpoint.workers.dev';
  
      fetch(cacheBusted(`${API_BASE_URL}/aw-export-all.csv`))
        .then((res) => res.text())
        .then((text) => {
          Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results: Papa.ParseResult<any>) => {
              const parsed = results.data
                .filter((d: any) => !!d.timestamp)
                .map((d: any) => ({
                  timestamp: new Date(d.timestamp),
                  duration: d.duration || 0,
                  appName: d.AppName || d.App || 'Unknown',
                  title: d.Title || '',  
                }));
              setAwData(parsed);
            },
          });
        });
    }, []);




// Clarity tracking init - only in production
useEffect(() => {
  const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
  
  // Only initialize if we have a project ID and we're in production
  if (clarityProjectId && import.meta.env.PROD) {
    clarity.init(clarityProjectId);
  }
}, []);




  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

    // Day filter for AWActivityRhythmAnalysis page
  const [dayFilter, setDayFilter] = useState<'all' | 'weekday' | 'weekend'>('all');
  
  const filteredAwData = useMemo(() => {
    if (dayFilter === 'all' || selectedPage !== 'AWActivityRhythmAnalysis') {
      return awData;
    }
    
    return awData.filter((row) => {
      const date = new Date(row.timestamp);
      const dayOfWeek = date.getDay();
      
      if (dayFilter === 'weekday') {
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      } else {
        return dayOfWeek === 0 || dayOfWeek === 6;
      }
    });
  }, [awData, dayFilter, selectedPage]);


  // Define the render function for each page
  const renderPageContent = () => {
    switch (selectedPage) {
      
        case 'AWHLSummary':
          return (
            <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
              {/* Title */}
              <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
                PC Time Insights
              </h1>

              {/* Page Selector Only (no Filters for AW data) */}
                <div className="fixed top-4 right-4 z-50">
                  <button 
                    onClick={() => setShowPageSelector(!showPageSelector)}
                    className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
                    aria-label="Page Navigation"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
  
                  {showPageSelector && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setShowPageSelector(false)}
                      />
                      <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                        <PageSelector 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage}
                  onClose={() => setShowPageSelector(false)}
                />
                      </div>
                    </>
                  )}
                </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AWTotalTimeCard data={awData} />
              <AWWorkLifeBalanceCard data={awData} />
              <AWContextSwitchCard data={awData} />
            </div>

            {/* Middle Row - 3 Charts in Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              <AWCategoryDonut data={awData} />
              <AWTopAppsBar data={awData} />
              <AWHourlyActivity data={awData} />
            </div>
            </div>
          );

case 'AWAppBehaviorPatterns':
    return (
    <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
        {/* Title */}
        <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
        Application Behavior Patterns
        </h1>

        {/* Page Selector Only (no Filters for AW data) */}
        <div className="fixed top-4 right-4 z-50">
            <button 
            onClick={() => setShowPageSelector(!showPageSelector)}
            className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
            aria-label="Page Navigation"
            >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            </button>
  
            {showPageSelector && (
            <>
                {/* Backdrop to close on click outside */}
                <div 
                className="fixed inset-0 -z-10" 
                onClick={() => setShowPageSelector(false)}
                />
                <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                <PageSelector 
            selectedPage={selectedPage} 
            setSelectedPage={setSelectedPage}
            onClose={() => setShowPageSelector(false)}
        />
                </div>
            </>
            )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <AWAppTransitionNetwork data={awData} />
        </div>

    {/* Middle Row - 2 Charts in Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AWSessionLengthDistr data={awData} />
        <AWContextSwitchAnalysis data={awData} />
    </div>
    </div>
    );
    
    case 'AWActivityRhythmAnalysis':
    return (
    <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">

        {/* Title */}
        <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
        Daily Activity Patterns
        </h1>

        {/* Page Selector + Day Filter */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {/* Day Filter Toggle */}
          <div className="inline-flex rounded-lg bg-gray-800/90 backdrop-blur-sm border border-gray-700 p-0.5">
            <button 
              onClick={() => setDayFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                dayFilter === 'all' 
                  ? 'bg-gray-700 text-gray-100' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setDayFilter('weekday')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                dayFilter === 'weekday' 
                  ? 'bg-gray-700 text-gray-100' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Weekday
            </button>
            <button 
              onClick={() => setDayFilter('weekend')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                dayFilter === 'weekend' 
                  ? 'bg-gray-700 text-gray-100' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Weekend
            </button>
          </div>

          {/* Hamburger Button */}
          <button 
            onClick={() => setShowPageSelector(!showPageSelector)}
            className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
            aria-label="Page Navigation"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {showPageSelector && (
            <>
              <div 
                className="fixed inset-0 -z-10" 
                onClick={() => setShowPageSelector(false)}
              />
              <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                <PageSelector 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage}
                  onClose={() => setShowPageSelector(false)}
                />
              </div>
            </>
          )}
        </div>


        {/* Row 1: Heatmap + Distribution (Side-by-Side on large screens, stacked on small) */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
            {/* Activity Rhythm Heatmap */}
            <div className="w-full lg:w-[480px]">
                <AWActivityRhythmHeatmap data={filteredAwData} />
            </div>
    
            {/* Time-of-Day Distribution */}
            <div className="w-full lg:flex-1">
                <AWCategoryDistribution data={filteredAwData} />
            </div>
        </div>



        {/* Row 2: Timeline + loyalty (Equal Split) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AWPeakActivityWindows data={filteredAwData} />
            <AWAppLoyaltyMeter data={filteredAwData} />
        </div>
    </div>
    );

case 'AWPredictiveAnalysis':
    return (
    <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
        {/* Title */}
        <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
        Predictive Analysis
        </h1>

        {/* Page Selector Only (no Filters for AW data) */}
        <div className="fixed top-4 right-4 z-50">
            <button 
            onClick={() => setShowPageSelector(!showPageSelector)}
            className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
            aria-label="Page Navigation"
            >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            </button>
  
            {showPageSelector && (
            <>
                {/* Backdrop to close on click outside */}
                <div 
                className="fixed inset-0 -z-10" 
                onClick={() => setShowPageSelector(false)}
                />
                <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                <PageSelector 
            selectedPage={selectedPage} 
            setSelectedPage={setSelectedPage}
            onClose={() => setShowPageSelector(false)}
        />
                </div>
            </>
            )}
        </div>

        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:h-[calc(120vh-12rem)]">
    
         {/* Left Section (Full width on mobile, 3/4 on desktop) */}
    <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
        
        {/* Top: Productivity Forecast */}
        <div className="flex-1">
            <AWProductivityForecast data={awData} />
        </div>

        {/* Bottom: Anomaly Detection + Habit Streaks (Stacks on mobile, side-by-side on medium screens and up) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <AWAnomalyDetection data={awData} />
            <AWConsistencyTracker data={awData} />
        </div>

    </div>

    {/* Right Sidebar (Full width on mobile, 1/4 on desktop) */}
    <div className="col-span-1 lg:col-span-1 overflow-y-auto">
        <AWWorkflowIntelligence data={awData} />
    </div>

</div>

    </div>
    );


    case 'AWDevSnapshot':
    return (
    <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
        {/* Title */}
        <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
        Language Stack Snapshot
        </h1>

        {/* Page Selector Only (no Filters for AW data) */}
        <div className="fixed top-4 right-4 z-50">
            <button 
            onClick={() => setShowPageSelector(!showPageSelector)}
            className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
            aria-label="Page Navigation"
            >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            </button>
  
            {showPageSelector && (
            <>
                {/* Backdrop to close on click outside */}
                <div 
                className="fixed inset-0 -z-10" 
                onClick={() => setShowPageSelector(false)}
                />
                <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                <PageSelector 
            selectedPage={selectedPage} 
            setSelectedPage={setSelectedPage}
            onClose={() => setShowPageSelector(false)}
        />
                </div>
            </>
            )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <AWTechStackBreakdown data={awData} />
        </div>

    {/* Middle Row - 2 Charts in Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AWLanguageVelocity data={awData} />
        <AWProjectTypeClassifier data={awData} />
    </div>
    </div>
    );

        case 'AWTechnicalProfile':
    return (
    <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
        {/* Title */}
        <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
        Technical Profile
        </h1>

        {/* Page Selector Only (no Filters for AW data) */}
        <div className="fixed top-4 right-4 z-50">
            <button 
            onClick={() => setShowPageSelector(!showPageSelector)}
            className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
            aria-label="Page Navigation"
            >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            </button>
  
            {showPageSelector && (
            <>
                {/* Backdrop to close on click outside */}
                <div 
                className="fixed inset-0 -z-10" 
                onClick={() => setShowPageSelector(false)}
                />
                <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                <PageSelector 
            selectedPage={selectedPage} 
            setSelectedPage={setSelectedPage}
            onClose={() => setShowPageSelector(false)}
        />
                </div>
            </>
            )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <AWStackEvolution data={awData} />
        </div>

    {/* Middle Row - 2 Charts in Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AWLanguageHeatmap data={awData} />
        <AWDevelopmentStats data={awData} />
    </div>
    </div>
    );

case 'Methodology':
  return (
    <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
      {/* Title */}
      <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
        Project Methodology
      </h1>
      <p className="text-center text-gray-400 text-lg -mt-4 pb-4">
        A Business Analyst's Approach to Building Visual Stream
      </p>

      {/* Page Selector */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => setShowPageSelector(!showPageSelector)}
          className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
          aria-label="Page Navigation"
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {showPageSelector && (
          <>
            <div 
              className="fixed inset-0 -z-10" 
              onClick={() => setShowPageSelector(false)}
            />
            <div className="absolute top-0 right-full mr-2 min-w-[200px]">
              <PageSelector 
                selectedPage={selectedPage} 
                setSelectedPage={setSelectedPage}
                onClose={() => setShowPageSelector(false)}
              />
            </div>
          </>
        )}
      </div>

      {/* Methodology Content */}
      <AWMethodology />
    </div>
  );

      default:
        return null;
    }
  };
  if (!hasEntered) {
    return (
<div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
  <div className="relative z-10 text-center space-y-8 p-8 max-w-2xl">
    <div className="overflow-visible py-4">
      <h1 className="text-6xl md:text-7xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 drop-shadow-lg tracking-tight leading-tight animate-pulse">
        Visual Stream
      </h1>
    </div>
<p className="text-slate-300 text-lg max-w-md mx-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
  Visualizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">digital footprint</span> in <span className="text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.4)]">real-time</span>
</p>

<ExploreButton setHasEntered={setHasEntered} />



  </div>
</div>

    );
  }


  // {awData.length === 0 || true ? (  
return (
  <div className="flex flex-col min-h-screen bg-gray-950 text-white">
    <main className="flex-grow flex flex-col space-y-4 p-4 overflow-hidden">
      
      {awData.length === 0 ? (  
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <svg
              className="w-16 h-16 text-blue-500 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-white text-lg font-medium">Loading activity data...</p>
            <p className="text-gray-400 text-base">Analyzing your PC usage...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {renderPageContent()}
        </>
      )}
    </main>
    <Footer />
  </div>
);
}

export default App;