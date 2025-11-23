import React, { useState } from 'react';
import { Search, Sliders, ChevronRight, BookOpen, Clock, Ban, X } from 'lucide-react';
import { ResearchParams } from '../types';

interface InputDashboardProps {
  onGenerate: (params: ResearchParams) => void;
  isHistory?: boolean; // For future history feature
}

const InputDashboard: React.FC<InputDashboardProps> = ({ onGenerate }) => {
  const [query, setQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Param States
  const [timeframe, setTimeframe] = useState('Last 5 Years');
  const [sources, setSources] = useState({
    patents: true,
    journals: true,
    preprints: false
  });
  const [exclusions, setExclusions] = useState('');

  const handleGenerate = () => {
    if (!query.trim()) return;
    onGenerate({
      query,
      timeframe,
      sources,
      exclusions
    });
  };

  return (
    <div className="flex h-full w-full bg-white relative overflow-hidden">
      
      {/* Mobile Sidebar Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar / Context Panel */}
      <div 
        className={`
          bg-science-50 border-r border-science-200 transition-all duration-300 ease-in-out flex flex-col z-50
          fixed inset-y-0 left-0 h-full shadow-2xl md:shadow-none md:relative
          ${isSidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full w-0 md:translate-x-0 md:w-0'} 
          overflow-hidden
        `}
      >
        <div className="p-6 border-b border-science-200 flex justify-between items-center">
          <h2 className="font-serif font-bold text-science-800 text-lg flex items-center gap-2">
            <Sliders size={18} /> Constraints
          </h2>
          {/* Mobile Close Button */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-science-400 hover:text-science-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
          {/* Timeframe */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-science-500 uppercase tracking-wider flex items-center gap-2">
              <Clock size={14} /> Timeframe
            </label>
            <div className="flex flex-col space-y-2">
              {['Last 5 Years', 'Since 2010', 'All Time'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${timeframe === opt ? 'border-science-600 bg-science-600' : 'border-science-300 bg-white'}`}>
                    {timeframe === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className={`text-sm ${timeframe === opt ? 'text-science-800 font-medium' : 'text-science-600 group-hover:text-science-700'}`}>{opt}</span>
                  <input 
                    type="radio" 
                    name="timeframe" 
                    className="hidden" 
                    checked={timeframe === opt} 
                    onChange={() => setTimeframe(opt)} 
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-science-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} /> Source Types
            </label>
            <div className="flex flex-col space-y-2">
              {[
                { key: 'journals', label: 'Journal Articles' },
                { key: 'patents', label: 'Patents' },
                { key: 'preprints', label: 'Preprints (arXiv/ChemRxiv)' }
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-science-700 rounded border-science-300 focus:ring-science-500"
                    checked={sources[opt.key as keyof typeof sources]}
                    onChange={(e) => setSources({...sources, [opt.key]: e.target.checked})}
                  />
                  <span className="text-sm text-science-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-science-500 uppercase tracking-wider flex items-center gap-2">
              <Ban size={14} /> Exclusions
            </label>
            <input 
              type="text" 
              placeholder="e.g., Toxic solvents, Pb-based"
              className="w-full text-sm p-2 border border-science-300 rounded bg-white text-science-800 placeholder-science-400 focus:outline-none focus:border-science-500 transition-colors"
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Toggle Sidebar Button (Visible when sidebar is closed on desktop, or always on mobile) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-4 left-4 p-2 text-science-400 hover:text-science-700 transition-colors z-20 ${isSidebarOpen ? 'md:hidden' : ''}`}
        >
          <Sliders size={20} />
        </button>

        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 md:px-16 max-w-4xl mx-auto w-full">
          <div className="text-center mb-8 md:mb-10 mt-10 md:mt-0">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-science-900 mb-4 tracking-tight">
              Archimedes AI
            </h1>
            <p className="text-science-500 text-base sm:text-lg md:text-xl font-light">
              Accelerating Material Science Discovery
            </p>
          </div>

          <div className="w-full bg-white shadow-xl rounded-xl border border-science-100 p-2 flex items-center group focus-within:ring-2 focus-within:ring-science-200 transition-all flex-col sm:flex-row">
            <div className="flex w-full items-center">
                <div className="pl-4 text-science-400 hidden sm:block">
                    <Search size={24} />
                </div>
                <input 
                type="text" 
                className="w-full p-4 text-base sm:text-lg text-science-800 placeholder-science-300 outline-none font-sans bg-transparent text-center sm:text-left"
                placeholder="Enter Research Goal..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
            </div>
            <button 
              onClick={handleGenerate}
              className={`
                w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shrink-0
                ${query.trim() 
                  ? 'bg-science-800 text-white shadow-lg hover:bg-science-700 hover:shadow-xl transform hover:-translate-y-0.5' 
                  : 'bg-science-100 text-science-300 cursor-not-allowed'}
              `}
              disabled={!query.trim()}
            >
              <span className="sm:hidden">Generate</span>
              <span className="hidden sm:inline">Generate Report</span>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs text-science-400 font-mono">
             <span>Examples:</span>
             <button onClick={() => setQuery("High-entropy alloys for cryogenic applications")} className="hover:text-science-600 hover:underline">High-entropy alloys</button>
             <span className="hidden sm:inline">•</span>
             <button onClick={() => setQuery("Solid-state electrolyte interface stability")} className="hover:text-science-600 hover:underline">Solid-state electrolytes</button>
          </div>
        </div>

        {/* Footer/Status Bar */}
        <div className="h-12 border-t border-science-100 bg-white flex items-center px-6 text-xs text-science-400 justify-between shrink-0">
            <span>System Status: Ready</span>
            <span className="font-mono">v1.0.4-beta</span>
        </div>
      </div>
    </div>
  );
};

export default InputDashboard;