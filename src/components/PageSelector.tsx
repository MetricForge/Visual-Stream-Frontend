import React from 'react';

interface PageSelectorProps {
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  onClose?: () => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ selectedPage, setSelectedPage, onClose }) => { 
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPage(e.target.value);
    if (onClose) onClose();
  };

  return (
    <div className="page-selector">
      <select
        onChange={handleChange}
        value={selectedPage}
        className="
          bg-gradient-to-r from-blue-600 to-blue-800 
          border border-gray-500 
          text-white 
          text-sm 
          font-semibold 
          rounded-lg 
          px-2 
          py-2 
          h-11 
          min-w-[130px] 
          focus:ring-blue-400 
          focus:ring-2 
          focus:border-blue-400 
          hover:border-blue-400 
          shadow-md 
          transition-all 
          duration-200 
          leading-normal
        "
      >
        <option value="AWHLSummary" className="bg-gray-800 hover:bg-blue-600 text-center">PC Summary</option>
        <option value="AWAppBehaviorPatterns" className="bg-gray-800 hover:bg-blue-600 text-center">Application Behavior Patterns</option>
        <option value="AWActivityRhythmAnalysis" className="bg-gray-800 hover:bg-blue-600 text-center">Daily Activity Patterns</option>
        <option value="AWPredictiveAnalysis" className="bg-gray-800 hover:bg-blue-600 text-center">Predictive Analysis</option>
        <option value="AWDevSnapshot" className="bg-gray-800 hover:bg-blue-600 text-center">Language Stack Snapshot</option>
        <option value="AWTechnicalProfile" className="bg-gray-800 hover:bg-blue-600 text-center">Technical Profile</option>
        <option value="Methodology" className="bg-gray-800 hover:bg-blue-600 text-center">Methodology</option>
      </select>
    </div>
  );
};

export default PageSelector;