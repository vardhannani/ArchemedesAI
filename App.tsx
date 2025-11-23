import React, { useState, useCallback } from 'react';
import InputDashboard from './components/InputDashboard';
import ProcessingView from './components/ProcessingView';
import ResultsReport from './components/ResultsReport';
import IntroPage from './components/IntroPage';
import { generateResearchReport } from './services/geminiService';
import { AppState, ResearchParams, ResearchReport as ResearchReportType } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [currentQuery, setCurrentQuery] = useState('');
  const [reportData, setReportData] = useState<ResearchReportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnterApp = () => {
    setAppState(AppState.INPUT);
  };

  const handleGenerate = useCallback(async (params: ResearchParams) => {
    setAppState(AppState.PROCESSING);
    setCurrentQuery(params.query);
    setError(null);

    try {
      // Simulate minimum wait time for the "Processing" animation to look real and authoritative
      const [data] = await Promise.all([
        generateResearchReport(params),
        new Promise(resolve => setTimeout(resolve, 6000)) // Wait at least 6 seconds
      ]);
      
      setReportData(data);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to generate report. Please try again later.';
      setError(message);
      setAppState(AppState.INPUT);
    }
  }, []);

  const handleBack = () => {
    setAppState(AppState.INPUT);
    setReportData(null);
  };

  return (
    <div className={
      `h-screen w-screen bg-white font-sans ` +
      (appState === AppState.INTRO ? 'overflow-y-auto' : 'overflow-hidden')
    }>
      {appState === AppState.INTRO && (
        <IntroPage onEnter={handleEnterApp} />
      )}

      {appState === AppState.INPUT && (
        <div className="h-full w-full animate-in fade-in duration-700">
          {error && (
            <div className="absolute top-4 right-4 z-50 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded shadow-sm max-w-xs">
              <div className="text-xs font-bold uppercase tracking-wider mb-1">Error</div>
              <span className="block text-sm leading-snug">{error}</span>
              {error.includes('API key') && (
                <div className="mt-2 text-[10px] text-red-600">
                  Define <code className="font-mono">VITE_API_KEY</code> in <code className="font-mono">.env.local</code> then restart dev server.
                </div>
              )}
              <button
                onClick={() => setError(null)}
                className="absolute top-1 right-2 text-red-400 hover:text-red-600 text-xs"
              >✕</button>
            </div>
          )}
          <InputDashboard onGenerate={handleGenerate} />
        </div>
      )}

      {appState === AppState.PROCESSING && (
        <ProcessingView query={currentQuery} />
      )}

      {appState === AppState.RESULTS && reportData && (
        <ResultsReport data={reportData} onBack={handleBack} />
      )}
    </div>
  );
};

export default App;