import React, { useState, useRef } from 'react';
import { ArrowRight, Atom, Database, FileText, Zap, BarChart3, BrainCircuit, ShieldCheck, TrendingUp, PlayCircle, Info } from 'lucide-react';

interface IntroPageProps {
  onEnter: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const productRef = useRef<HTMLDivElement | null>(null);
  const whyRef = useRef<HTMLDivElement | null>(null);

  const handleEnter = () => {
    setIsExiting(true);
    // Smooth transition delay
    setTimeout(() => {
      onEnter();
    }, 500);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-science-900 via-science-800 to-science-900 text-white flex flex-col relative overflow-hidden font-sans transition-all duration-500 ease-in-out ${isExiting ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500 blur-[120px]" />
         <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-teal-500 blur-[100px]" />
      </div>

      <nav className="relative z-10 p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20 shadow-lg">
               <Atom size={20} className="text-blue-300 md:hidden" />
               <Atom size={24} className="text-blue-300 hidden md:block" />
            </div>
            <span className="font-serif font-bold text-lg md:text-xl tracking-tight text-white">Archimedes AI</span>
         </div>
         <div className="text-xs md:text-sm text-science-200 font-medium tracking-wide">v1.0.4 Beta</div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center max-w-6xl mx-auto py-12">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 md:mb-8 animate-[fadeIn_0.7s_ease-out]">
           <Zap size={14} /> The New Standard in R&D
        </div>

          <h1 className="font-serif text-[2.75rem] sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 md:mb-8 animate-[slideUp_0.9s_ease-out_0.1s_both]">
            <span className="block">Accelerate Discovery.</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 inline-block">Eliminate Noise.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-science-200/90 max-w-3xl mb-10 md:mb-14 leading-relaxed animate-[slideUp_0.9s_ease-out_0.18s_both] px-4">
            India's first AI Literature Review Agent purpose-built for Material Science R&D. Archimedes synthesizes fragmented literature, surfaces contradictions, proposes experimental hypotheses, and converts them into actionable laboratory protocols – compressing weeks of manual review into minutes.
          </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-[zoomIn_1s_ease-out_0.3s_both]">
          <button 
            onClick={handleEnter}
            className="group relative inline-flex items-center gap-3 px-7 py-4 bg-white text-science-900 rounded-xl font-bold text-base md:text-lg shadow-2xl shadow-blue-900/30 hover:shadow-blue-500/30 hover:scale-[1.03] transition-all"
          >
             Launch Workspace
             <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => productRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-white/20 bg-white/5 text-white font-semibold text-sm md:text-base backdrop-blur hover:bg-white/10 hover:border-white/30 transition"
          >
            <PlayCircle size={20} /> View Product Overview
          </button>
        </div>

        {/* Capability Highlights */}
        <div ref={productRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-14 w-full text-left animate-[slideUp_0.9s_ease-out_0.35s_both]">
          {[
            { icon: Database, title: 'Unified Corpus', desc: 'Patents, journals & preprints fused with semantic normalization.' },
            { icon: FileText, title: 'Structured Reviews', desc: 'Hypothesis-driven literature distillation with traceable citations.' },
            { icon: Atom, title: 'Protocol Generation', desc: 'Transforms hypotheses into parameterized experimental workflows.' },
            { icon: BrainCircuit, title: 'Contextual Chat', desc: 'Ask Archimedes follow-ups grounded in the generated report.' }
          ].map((f,i)=>(
            <div key={i} className="p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition group backdrop-blur-sm">
              <div className="w-11 h-11 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition">
                <f.icon size={22} className="text-blue-200" />
              </div>
              <h3 className="text-sm md:text-base font-serif font-bold text-white mb-2 tracking-wide">{f.title}</h3>
              <p className="text-[11px] md:text-xs text-science-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Workflow Strip */}
        <div className="mt-16 md:mt-24 w-full animate-[fadeIn_0.8s_ease-out_0.55s_both]">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
            {[
              { step: '1', label: 'Define Research Goal', detail: 'Material system, property window, exclusions' },
              { step: '2', label: 'Automated Collection', detail: 'Semantic retrieval & relevance pruning' },
              { step: '3', label: 'Cross-Reference Engine', detail: 'Aligns findings, flags contradictions' },
              { step: '4', label: 'Hypothesis & Protocol', detail: 'Generates testable plan & lab steps' }
            ].map((s,i)=>(
              <div key={i} className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-science-800/80 to-science-700/70 border border-white/10 p-5 md:p-6 group">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs font-bold text-blue-200 shadow-inner">{s.step}</div>
                  <span className="text-sm md:text-base font-semibold text-white tracking-wide">{s.label}</span>
                </div>
                <p className="text-[11px] md:text-xs text-science-300 leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Archimedes Section */}
        <section ref={whyRef} className="mt-20 md:mt-28 max-w-5xl text-left animate-[fadeIn_0.8s_ease-out_0.65s_both]">
          <div className="flex items-center gap-2 mb-5">
            <Info size={18} className="text-teal-200" />
            <h2 className="font-serif text-xl md:text-2xl font-bold text-white tracking-tight">Why Archimedes?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <p className="text-sm md:text-base text-science-200 leading-relaxed">Traditional review cycles fracture across paper discovery, manual summarization, and protocol drafting. Archimedes unifies these phases in one semantic pipeline.</p>
              <ul className="space-y-2 text-[12px] md:text-sm text-science-300">
                <li className="flex gap-2"><span className="text-teal-300 font-bold">•</span> Multi-source ingestion with duplicate + contradiction detection.</li>
                <li className="flex gap-2"><span className="text-teal-300 font-bold">•</span> Explicit citation mapping for every claim in generated sections.</li>
                <li className="flex gap-2"><span className="text-teal-300 font-bold">•</span> Gap analysis produces an experiment-ready hypothesis.</li>
                <li className="flex gap-2"><span className="text-teal-300 font-bold">•</span> Protocol generation encodes conditions, equipment & safety.</li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-sm md:text-base text-science-200 leading-relaxed">Designed for rapid iteration inside advanced materials labs and innovation scouting teams.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Avg. Review Time Saved', value: '82%' },
                  { label: 'Sources Unified / Session', value: '150+' },
                  { label: 'Protocol Draft Speed', value: '<< 2m' },
                  { label: 'Contradiction Flags', value: 'Automated' }
                ].map((m,i)=>(
                  <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col items-start">
                    <span className="text-[10px] uppercase tracking-wider text-science-300">{m.label}</span>
                    <span className="text-sm md:text-base font-serif font-bold text-white">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Metrics / Badges */}
        <div className="mt-14 md:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full animate-[fadeIn_0.8s_ease-out_0.75s_both]">
          {[
            { icon: ShieldCheck, label: 'Citation Traceability' },
            { icon: BarChart3, label: 'Quant Metric Focus' },
            { icon: TrendingUp, label: 'Gap Detection' },
            { icon: BrainCircuit, label: 'Adaptive Reasoning' }
          ].map((b,i)=>(
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition">
              <b.icon size={18} className="text-teal-200" />
              <span className="text-[11px] md:text-xs font-medium tracking-wide text-science-200">{b.label}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 px-6 md:px-10 py-8 text-center text-[11px] md:text-xs text-science-400 tracking-wide space-y-2">
        <div>&copy; 2024 Archimedes Scientific. All systems operational.</div>
        <div className="opacity-70">Experimental build • Do not rely for regulatory submissions.</div>
      </footer>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default IntroPage;