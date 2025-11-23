import React, { useState, useEffect, useRef } from 'react';
import { ResearchReport, Citation, ExperimentalPlan, ChatMessage, PaperComparison, KnowledgeGraph, GraphNode, GraphEdge } from '../types';
import { Download, Share2, ArrowLeft, ExternalLink, Lightbulb, MessageSquare, BookOpen, Send, FlaskConical, X, Copy, Check, SplitSquareHorizontal, ArrowRightLeft, Network, Maximize2, FileText } from 'lucide-react';
import { generateExperimentalPlan, queryReportContext, generatePaperComparison, generateKnowledgeGraph } from '../services/geminiService';

interface ResultsReportProps {
  data: ResearchReport;
  onBack: () => void;
}

const ResultsReport: React.FC<ResultsReportProps> = ({ data, onBack }) => {
  const [activeCitationId, setActiveCitationId] = useState<number | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'sources' | 'chat' | 'network'>('sources');
  const [mobileView, setMobileView] = useState<'report' | 'tools'>('report');
  
  const citationRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  
  // Experimental Plan State
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [experimentalPlan, setExperimentalPlan] = useState<ExperimentalPlan | null>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Comparison State
  const [selectedCitations, setSelectedCitations] = useState<number[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<PaperComparison | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Graph State
  const [graphData, setGraphData] = useState<KnowledgeGraph | null>(null);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [simulatedNodes, setSimulatedNodes] = useState<(GraphNode & {x: number, y: number})[]>([]);

    // PDF Export
    const handleExportPDF = () => {
        try {
            const printable = `<!DOCTYPE html><html><head><title>${data.title} - Archimedes Report</title>
            <meta charset='utf-8'/>
            <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap' rel='stylesheet'>
            <style>
                body{font-family:'Merriweather',serif;margin:40px;color:#102a43;}
                h1{font-size:26px;margin:0 0 12px;font-family:'Merriweather',serif;}
                h2{font-size:18px;margin:32px 0 8px;font-family:'Inter',sans-serif;text-transform:uppercase;letter-spacing:.5px;color:#486581;}
                p,li{line-height:1.55;font-size:14px;}
                blockquote{margin:24px 0;padding:16px 20px;background:#243b53;color:#f0f4f8;border-left:4px solid #d64545;font-style:italic;border-radius:6px;}
                .citations{margin-top:40px;font-size:13px;}
                .citations h2{color:#334e68;}
                table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px;}
                th,td{border:1px solid #bcccdc;padding:6px 8px;vertical-align:top;}
                .marker{background:#243b53;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;}
                @page{margin:28mm 18mm;}
                @media print{button{display:none}}
            </style></head><body>`;
            const summary = `<h1>${data.title}</h1><h2>Executive Summary</h2><p>${data.summary}</p>`;
            const sections = data.sections.map((s,i)=>`<h2>${(i+1).toString().padStart(2,'0')} ${s.heading}</h2><p>${s.content.replace(/\[(\d+)\]/g,'<span class="marker">$1</span>')}</p>`).join('');
            const hypothesis = `<blockquote>\"${data.novel_hypothesis}\"</blockquote>`;
            const cites = `<div class='citations'><h2>References</h2>${data.citations.map(c=>`<p>[${c.id}] ${c.authors}. <em>${c.title}</em>. ${c.journal} (${c.year}).</p>`).join('')}</div>`;
            const html = printable + summary + sections + hypothesis + cites + '</body></html>';
            const w = window.open('', '_blank');
            if (!w) throw new Error('Popup blocked');
            w.document.write(html);
            w.document.close();
            w.focus();
            setTimeout(()=>{w.print();}, 300);
        } catch (e) {
            alert('Failed to open print view. Please allow popups.');
        }
    };

    // Share action (navigator.share fallback to clipboard)
    const handleShare = () => {
        const shareData = {
            title: data.title,
            text: `Research report generated with Archimedes AI: ${data.title}`,
            url: window.location.href
        };
        if (navigator.share) {
            navigator.share(shareData).catch(()=>{});
        } else {
            try {
                navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
                alert('Link copied to clipboard.');
            } catch {
                alert('Copy failed. Share manually.');
            }
        }
    };

    // Helper: Scroll to citation
  const handleCitationClick = (id: number) => {
    // On mobile, switch to tools view
    setMobileView('tools');
    setSidebarTab('sources'); 
    setActiveCitationId(id);
    
    // Tiny timeout to allow tab switch render
    setTimeout(() => {
        const element = citationRefs.current[id];
        if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
  };

  // Helper: Chat Scroll
  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, sidebarTab, mobileView]);

  // Handler: Generate Experiment
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
        const context = data.sections.map(s => s.content).join('\n');
        const plan = await generateExperimentalPlan(data.novel_hypothesis, context);
        setExperimentalPlan(plan);
        setShowPlanModal(true);
    } catch (e) {
        alert("Failed to generate experimental plan.");
    } finally {
        setIsGeneratingPlan(false);
    }
  };

  // Handler: Chat
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
        const response = await queryReportContext(userMsg, data, chatHistory);
        setChatHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (e) {
        setChatHistory(prev => [...prev, { role: 'model', content: "I'm having trouble analyzing the text right now." }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  // Handler: Export BibTeX
  const handleExportBibtex = () => {
    const bibtex = data.citations.map(c => {
        const id = c.authors.split(' ')[0].replace(/[^a-zA-Z]/g, '') + c.year;
        return `@article{${id},
  title={${c.title}},
  author={${c.authors}},
  journal={${c.journal}},
  year={${c.year}}
}`;
    }).join('\n\n');
    
    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'citations.bib';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handler: Citation Selection
  const toggleCitationSelection = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (selectedCitations.includes(id)) {
      setSelectedCitations(prev => prev.filter(c => c !== id));
    } else {
      if (selectedCitations.length >= 3) {
        alert("You can compare up to 3 papers at a time.");
        return;
      }
      setSelectedCitations(prev => [...prev, id]);
    }
  };

  // Handler: Generate Comparison
  const handleComparePapers = async () => {
    if (selectedCitations.length < 2) return;
    setIsComparing(true);
    try {
      const selectedPapers = data.citations.filter(c => selectedCitations.includes(c.id));
      const context = data.sections.map(s => s.content).join('\n');
      const result = await generatePaperComparison(selectedPapers, context);
      setComparisonData(result);
      setShowComparisonModal(true);
    } catch (e) {
      alert("Failed to compare papers.");
    } finally {
      setIsComparing(false);
    }
  };

  // Handler: Generate Graph
  const handleGenerateGraph = async () => {
    setIsGraphLoading(true);
    try {
        const context = data.sections.map(s => s.content).join('\n');
        const graph = await generateKnowledgeGraph(context);
        setGraphData(graph);
    } catch (e) {
        alert("Failed to generate knowledge graph.");
    } finally {
        setIsGraphLoading(false);
    }
  };

  // Effect: Calculate Force Graph Layout when modal opens
  useEffect(() => {
    if (showGraphModal && graphData) {
        const width = window.innerWidth > 1000 ? 1000 : window.innerWidth;
        const height = window.innerHeight > 700 ? 700 : window.innerHeight;
        const nodes = graphData.nodes.map(n => ({ 
            ...n, 
            x: Math.random() * width, 
            y: Math.random() * height,
            vx: 0,
            vy: 0 
        }));
        
        // Simple Force Simulation
        const k = Math.sqrt((width * height) / nodes.length) * 0.8; 
        const iterations = 150;

        for (let i = 0; i < iterations; i++) {
            // Repulsion
            for (let a = 0; a < nodes.length; a++) {
                for (let b = 0; b < nodes.length; b++) {
                    if (a === b) continue;
                    const dx = nodes[a].x - nodes[b].x;
                    const dy = nodes[a].y - nodes[b].y;
                    let dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
                    const force = (k * k) / dist;
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    nodes[a].vx += fx * 0.05;
                    nodes[a].vy += fy * 0.05;
                }
            }

            // Attraction (Edges)
            graphData.edges.forEach(edge => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (source && target) {
                    const dx = source.x - target.x;
                    const dy = source.y - target.y;
                    let dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
                    const force = (dist * dist) / k;
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    source.vx -= fx * 0.05;
                    source.vy -= fy * 0.05;
                    target.vx += fx * 0.05;
                    target.vy += fy * 0.05;
                }
            });

            // Center Gravity & Update
            for (let n of nodes) {
                const dx = width/2 - n.x;
                const dy = height/2 - n.y;
                n.vx += dx * 0.01; 
                n.vy += dy * 0.01;
                
                n.x += n.vx;
                n.y += n.vy;
                n.vx *= 0.5; // Friction
                n.vy *= 0.5;
            }
        }
        setSimulatedNodes(nodes);
    }
  }, [showGraphModal, graphData]);

  // Helper: Render Text
  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const id = parseInt(match[1]);
        const isActive = activeCitationId === id;
        return (
          <button
            key={index}
            onClick={() => handleCitationClick(id)}
            className={`
              inline-flex items-center justify-center px-1 mx-0.5 rounded text-xs font-bold -translate-y-1 select-none
              transition-all duration-200 cursor-pointer border
              ${isActive 
                ? 'bg-science-800 text-white border-science-800 scale-110 shadow-sm' 
                : 'bg-science-100 text-science-600 border-science-200 hover:bg-science-200 hover:text-science-800'}
            `}
          >
            {match[0]}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getNodeColor = (type: string) => {
      switch(type) {
          case 'material': return '#3b82f6'; // blue
          case 'property': return '#10b981'; // green
          case 'method': return '#8b5cf6'; // purple
          case 'application': return '#f59e0b'; // orange
          default: return '#64748b';
      }
  };

  return (
    <div className="flex flex-col h-full bg-science-50 relative">
      {/* Header */}
      <header className="h-14 md:h-16 bg-white border-b border-science-200 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onBack} className="p-2 hover:bg-science-50 rounded-full text-science-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="overflow-hidden">
            <span className="text-[10px] md:text-xs font-bold text-science-400 uppercase tracking-wider block">Report Generated</span>
            <h1 className="text-science-900 font-serif font-bold text-base md:text-lg leading-none truncate max-w-[200px] md:max-w-md">{data.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
                    <button onClick={handleShare} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-science-600 hover:text-science-900 hover:bg-science-50 rounded-lg transition-colors">
                        <Share2 size={16} /> Share
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-science-800 hover:bg-science-700 rounded-lg shadow-sm transition-all">
                        <Download size={16} /> <span className="hidden md:inline">Export PDF</span>
                    </button>
        </div>
      </header>

      {/* Main Content Body - Responsive Split */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left: Report Content (Visible on Desktop OR when Mobile View is 'report') */}
        <div className={`
            flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-32 scroll-smooth bg-science-50
            ${mobileView === 'tools' ? 'hidden lg:block' : 'block'}
        `}>
          <div className="max-w-3xl mx-auto space-y-8 md:space-y-10 pb-20">
            
            {/* Executive Summary */}
            <section>
               <h2 className="text-xs font-bold text-science-400 uppercase tracking-wider mb-3 border-b border-science-200 pb-1">Executive Summary</h2>
               <p className="text-science-800 text-base md:text-lg leading-relaxed font-serif">
                 {data.summary}
               </p>
            </section>

            {/* Dynamic Sections */}
            {data.sections.map((section, idx) => (
              <section key={idx} className="group">
                <h3 className="text-lg md:text-xl font-bold text-science-900 mb-4 flex items-center gap-3">
                  <span className="text-science-300 font-mono text-sm">0{idx + 1}</span>
                  {section.heading}
                </h3>
                <div className="text-science-700 text-sm md:text-base leading-7 text-justify group-hover:text-science-900 transition-colors">
                  {renderTextWithCitations(section.content)}
                </div>
              </section>
            ))}

            {/* Novel Hypothesis */}
            <div className="mt-8 md:mt-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-science-800 to-science-900 p-6 md:p-8 text-white shadow-xl">
               <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4 text-accent-500">
                    <Lightbulb className="text-yellow-400 fill-yellow-400" size={24} />
                    <h3 className="font-bold tracking-wider uppercase text-sm text-science-200">Novel Hypothesis</h3>
                 </div>
                 <blockquote className="font-serif text-lg md:text-xl italic leading-relaxed text-science-50 border-l-4 border-yellow-400 pl-4 md:pl-6 mb-6">
                   "{data.novel_hypothesis}"
                 </blockquote>
                 
                 <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/10 pt-6 gap-4">
                     <p className="text-xs text-science-300 max-w-sm text-center sm:text-left">
                        Turn this hypothesis into a lab-ready experimental plan.
                     </p>
                    <button 
                        onClick={handleGeneratePlan}
                        disabled={isGeneratingPlan}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-science-900 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-science-100 disabled:opacity-70 transition-all"
                    >
                        {isGeneratingPlan ? (
                             <span className="animate-pulse">Synthesizing...</span>
                        ) : (
                            <>
                                <FlaskConical size={16} /> Generate Protocol
                            </>
                        )}
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar (Visible on Desktop OR when Mobile View is 'tools') */}
        <div className={`
            lg:w-96 border-l border-science-200 bg-white flex flex-col shrink-0
            ${mobileView === 'report' ? 'hidden lg:flex' : 'flex absolute inset-0 lg:static z-10 pb-16 lg:pb-0'}
        `}>
            {/* Tab Header */}
            <div className="flex border-b border-science-200 shrink-0">
                <button 
                    onClick={() => setSidebarTab('sources')}
                    className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'sources' ? 'text-science-800 border-b-2 border-science-800 bg-science-50' : 'text-science-500 hover:bg-science-50/50 hover:text-science-700'}`}
                >
                    <BookOpen size={16} /> <span className="hidden xl:inline">Sources</span>
                </button>
                <button 
                    onClick={() => setSidebarTab('chat')}
                    className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'chat' ? 'text-science-800 border-b-2 border-science-800 bg-science-50' : 'text-science-500 hover:bg-science-50/50 hover:text-science-700'}`}
                >
                    <MessageSquare size={16} /> <span className="hidden xl:inline">Chat</span>
                </button>
                <button 
                    onClick={() => setSidebarTab('network')}
                    className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'network' ? 'text-science-800 border-b-2 border-science-800 bg-science-50' : 'text-science-500 hover:bg-science-50/50 hover:text-science-700'}`}
                >
                    <Network size={16} /> <span className="hidden xl:inline">Network</span>
                </button>
            </div>
          
          {/* TAB: SOURCES */}
          {sidebarTab === 'sources' && (
            <div className="flex-1 flex flex-col overflow-hidden relative animate-in fade-in duration-300">
                <div className="p-4 bg-science-50/50 backdrop-blur-sm flex justify-between items-center border-b border-science-100">
                    <span className="text-[10px] uppercase font-bold text-science-400">
                        {data.citations.length} References
                    </span>
                    <button onClick={handleExportBibtex} className="text-xs flex items-center gap-1 text-science-600 hover:text-science-900 hover:underline">
                        <Copy size={12} /> BibTeX
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 citation-scroll pb-40 lg:pb-20">
                    {data.citations.map((cite) => {
                      const isSelected = selectedCitations.includes(cite.id);
                      return (
                        <div 
                            key={cite.id}
                            ref={el => { citationRefs.current[cite.id] = el }}
                            onClick={() => handleCitationClick(cite.id)}
                            className={`
                            p-4 rounded-lg border text-sm transition-all duration-300 cursor-pointer group relative
                            ${activeCitationId === cite.id 
                                ? 'bg-science-50 border-science-400 shadow-md ring-1 ring-science-400' 
                                : isSelected 
                                  ? 'bg-blue-50 border-science-300 shadow-sm'
                                  : 'bg-white border-science-100 hover:border-science-300 hover:shadow-sm'}
                            `}
                        >
                            {/* Checkbox for Comparison */}
                            <div 
                                className="absolute top-4 right-4 z-10 p-1"
                                onClick={(e) => toggleCitationSelection(e, cite.id)}
                            >
                                <div className={`
                                    w-5 h-5 rounded border flex items-center justify-center transition-colors
                                    ${isSelected ? 'bg-science-800 border-science-800 text-white' : 'bg-white border-science-300 hover:border-science-500'}
                                `}>
                                    {isSelected && <Check size={12} />}
                                </div>
                            </div>

                            <div className={`
                            absolute -left-2 top-3 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-colors
                            ${activeCitationId === cite.id ? 'bg-science-800 text-white' : 'bg-science-200 text-science-600 group-hover:bg-science-300'}
                            `}>
                            {cite.id}
                            </div>

                            <h4 className={`font-serif font-bold mb-1 leading-snug pr-6 ${activeCitationId === cite.id ? 'text-science-900' : 'text-science-800'}`}>
                            {cite.title}
                            </h4>
                            <div className="text-science-500 text-xs mb-2 line-clamp-2">
                            {cite.authors}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-science-100">
                            <span className="text-xs font-mono text-science-400 italic truncate max-w-[70%]">{cite.journal}, {cite.year}</span>
                            {cite.doi && (
                                <a href={`https://doi.org/${cite.doi}`} target="_blank" rel="noopener noreferrer" className="text-science-400 hover:text-science-700 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <ExternalLink size={12} />
                                </a>
                            )}
                            </div>
                        </div>
                    )})}
                </div>

                {/* Comparison Floating Bar */}
                {selectedCitations.length > 0 && (
                  <div className="absolute bottom-20 lg:bottom-4 left-4 right-4 z-20">
                    <button
                      onClick={handleComparePapers}
                      disabled={selectedCitations.length < 2 || isComparing}
                      className={`
                        w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm shadow-lg
                        transition-all duration-300
                        ${selectedCitations.length >= 2 
                           ? 'bg-science-800 text-white hover:bg-science-700 transform hover:-translate-y-1' 
                           : 'bg-science-200 text-science-400 cursor-not-allowed'}
                      `}
                    >
                       {isComparing ? (
                          <span className="animate-pulse">Comparing...</span>
                       ) : (
                          <>
                            <ArrowRightLeft size={16} />
                            Compare ({selectedCitations.length})
                          </>
                       )}
                    </button>
                  </div>
                )}
            </div>
          )}

          {/* TAB: NETWORK */}
          {sidebarTab === 'network' && (
              <div className="flex-1 flex flex-col p-6 bg-science-50 items-center text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 mt-10">
                      <Network size={32} className="text-science-500" />
                  </div>
                  <h3 className="font-serif font-bold text-science-900 mb-2">Knowledge Graph</h3>
                  <p className="text-xs text-science-500 mb-6 px-4">
                      Visualize connections between materials, properties, and methods in this report.
                  </p>
                  
                  {!graphData ? (
                      <button 
                        onClick={handleGenerateGraph}
                        disabled={isGraphLoading}
                        className="w-full max-w-xs py-3 bg-science-800 text-white rounded-lg font-bold text-sm shadow-md hover:bg-science-700 transition-all flex items-center justify-center gap-2"
                      >
                         {isGraphLoading ? (
                            <span className="animate-pulse">Analyzing Entities...</span>
                         ) : "Generate Graph"}
                      </button>
                  ) : (
                      <div className="w-full max-w-xs space-y-4">
                          <div className="bg-white p-4 rounded-lg border border-science-200 text-left">
                              <div className="text-xs font-bold text-science-400 uppercase mb-2">Graph Stats</div>
                              <div className="flex justify-between text-sm text-science-800 border-b border-science-100 pb-2 mb-2">
                                  <span>Entities</span>
                                  <span className="font-mono font-bold">{graphData.nodes.length}</span>
                              </div>
                              <div className="flex justify-between text-sm text-science-800">
                                  <span>Relationships</span>
                                  <span className="font-mono font-bold">{graphData.edges.length}</span>
                              </div>
                          </div>
                          
                          <button 
                            onClick={() => setShowGraphModal(true)}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                          >
                             <Maximize2 size={16} /> View Full Screen
                          </button>
                          
                          <button 
                            onClick={handleGenerateGraph}
                            className="text-xs text-science-500 underline hover:text-science-800"
                          >
                             Regenerate
                          </button>
                      </div>
                  )}
              </div>
          )}

          {/* TAB: CHAT */}
          {sidebarTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-science-50 animate-in fade-in duration-300">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 lg:pb-4">
                        {chatHistory.length === 0 && (
                            <div className="text-center mt-10 text-science-400">
                                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Ask questions about the generated report, specific citations, or the hypothesis.</p>
                            </div>
                        )}
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-sm md:max-w-md lg:max-w-xs xl:max-w-sm p-3 rounded-lg ${msg.role === 'user' ? 'bg-science-800 text-white' : 'bg-white border border-science-100'}`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-sm md:max-w-md lg:max-w-xs xl:max-w-sm p-3 rounded-lg bg-white border border-science-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-science-400 rounded-full animate-pulse delay-0"></div>
                                        <div className="w-2 h-2 bg-science-400 rounded-full animate-pulse delay-150"></div>
                                        <div className="w-2 h-2 bg-science-400 rounded-full animate-pulse delay-300"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                  </div>
                  
                  {/* Chat Input Form */}
                  <div className="p-4 border-t border-science-200 bg-white/80 backdrop-blur-sm absolute bottom-16 left-0 right-0 lg:static">
                      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                          <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Ask Archimedes..."
                              className="w-full bg-science-50 border border-science-200 rounded-lg pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-science-400 focus:outline-none transition-shadow"
                          />
                          <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-science-800 text-white disabled:bg-science-300 hover:bg-science-700 transition-colors">
                              <Send size={16} />
                          </button>
                      </form>
                  </div>
              </div>
          )}
        </div>

        {/* Mobile Bottom Navigation (Fixed for persistent visibility) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-science-800/95 backdrop-blur-sm border-t border-science-700 flex justify-around items-center z-50 shadow-lg">
            <button 
                onClick={() => setMobileView('report')}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${mobileView === 'report' ? 'text-white' : 'text-science-300 hover:text-white'}`}
            >
                <FileText size={20} />
                <span className="text-[10px] font-medium tracking-wide">Report</span>
            </button>
            <button 
                onClick={() => { setMobileView('tools'); setSidebarTab('sources'); }}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${mobileView === 'tools' && sidebarTab === 'sources' ? 'text-white' : 'text-science-300 hover:text-white'}`}
            >
                <BookOpen size={20} />
                <span className="text-[10px] font-medium tracking-wide">Sources</span>
            </button>
            <button 
                onClick={() => { setMobileView('tools'); setSidebarTab('chat'); }}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${mobileView === 'tools' && sidebarTab === 'chat' ? 'text-white' : 'text-science-300 hover:text-white'}`}
            >
                <MessageSquare size={20} />
                <span className="text-[10px] font-medium tracking-wide">Chat</span>
            </button>
            <button 
                onClick={() => { setMobileView('tools'); setSidebarTab('network'); }}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${mobileView === 'tools' && sidebarTab === 'network' ? 'text-white' : 'text-science-300 hover:text-white'}`}
            >
                <Network size={20} />
                <span className="text-[10px] font-medium tracking-wide">Graph</span>
            </button>
        </nav>

      </div>

      {/* MODAL: Experimental Plan */}
      {showPlanModal && experimentalPlan && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border-4 border-science-200">
                  <header className="p-4 md:p-6 border-b border-science-200 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-science-100 rounded-lg">
                            <FlaskConical size={20} className="text-science-600" />
                          </div>
                          <div>
                            <h2 className="font-serif font-bold text-lg md:text-xl text-science-900">Experimental Protocol</h2>
                            <p className="text-xs text-science-500">Generated from novel hypothesis</p>
                          </div>
                      </div>
                      <button onClick={() => setShowPlanModal(false)} className="p-2 rounded-full hover:bg-science-100">
                          <X size={20} className="text-science-500" />
                      </button>
                  </header>
                  <div className="flex-1 overflow-y-auto p-4 md:p-8">
                      <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:text-science-800 prose-h3:mt-6 prose-h3:mb-1 prose-p:text-science-700 prose-li:text-science-700 prose-strong:text-science-800">
                          <h3>Objective</h3>
                          <p>{experimentalPlan.objective}</p>
                          
                          <h3>Materials & Equipment</h3>
                          <ul>
                              {experimentalPlan.materials_and_equipment.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>

                          <h3>Step-by-Step Procedure</h3>
                          <ol>
                              {experimentalPlan.procedure.map((step, i) => <li key={i}>{step}</li>)}
                          </ol>

                          <h3>Data Collection & Analysis</h3>
                          <ul>
                              {experimentalPlan.data_collection_and_analysis.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>

                          <h3>Safety Precautions</h3>
                          <ul className="prose-li:text-amber-800">
                              {experimentalPlan.safety_precautions.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: Paper Comparison */}
      {showComparisonModal && comparisonData && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border-4 border-science-200">
                  <header className="p-4 md:p-6 border-b border-science-200 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-science-100 rounded-lg">
                            <SplitSquareHorizontal size={20} className="text-science-600" />
                          </div>
                          <div>
                            <h2 className="font-serif font-bold text-lg md:text-xl text-science-900">Paper Comparison</h2>
                            <p className="text-xs text-science-500">{comparisonData.points?.length} papers analyzed</p>
                          </div>
                      </div>
                      <button onClick={() => setShowComparisonModal(false)} className="p-2 rounded-full hover:bg-science-100">
                          <X size={20} className="text-science-500" />
                      </button>
                  </header>
                  <div className="flex-1 overflow-auto p-4 md:p-6">
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="text-science-800 text-sm leading-relaxed">{comparisonData.summary}</p>
                      </div>

                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                              <thead>
                                  <tr>
                                      <th className="p-4 bg-science-100 text-science-700 font-bold border-b-2 border-science-200 w-1/4">Criteria</th>
                                      {selectedCitations.map(id => {
                                          const paper = data.citations.find(c => c.id === id);
                                          return (
                                              <th key={id} className="p-4 bg-science-50 text-science-900 font-serif font-bold border-b-2 border-science-200 min-w-[200px] align-top">
                                                  <div className="flex items-center gap-2 mb-1">
                                                      <span className="bg-science-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shrink-0">{id}</span>
                                                      <span className="line-clamp-2">{paper?.title}</span>
                                                  </div>
                                                  <div className="text-[10px] text-science-500 font-sans font-normal">{paper?.authors} ({paper?.year})</div>
                                              </th>
                                          );
                                      })}
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-science-100">
                                  {comparisonData.points?.map((point, idx) => (
                                      <tr key={idx} className="hover:bg-science-50 transition-colors">
                                          <td className="p-4 font-medium text-science-700 bg-science-50/50 border-r border-science-100">{point.attribute}</td>
                                          {selectedCitations.map(id => {
                                              const detail = point.details.find(d => d.citation_id === id);
                                              return (
                                                  <td key={id} className="p-4 text-science-600 align-top leading-relaxed">
                                                      {detail ? detail.value : <span className="text-gray-300 italic">Not specified</span>}
                                                  </td>
                                              );
                                          })}
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: Knowledge Graph */}
      {showGraphModal && graphData && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="flex items-center gap-4 bg-white/10 p-2 rounded-lg border border-white/20 text-xs">
                    {['material', 'property', 'method', 'application'].map(type => (
                        <div key={type} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: getNodeColor(type)}}></div>
                            <span className="capitalize text-white font-medium">{type}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => setShowGraphModal(false)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20">
                    <X size={20} className="text-white" />
                </button>
              </div>
              <svg width="100%" height="100%">
                  {graphData.edges.map((edge, i) => {
                      const source = simulatedNodes.find(n => n.id === edge.source);
                      const target = simulatedNodes.find(n => n.id === edge.target);
                      if (!source || !target) return null;
                      return <line key={i} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#4b5563" strokeWidth={0.7} opacity={0.6} />
                  })}
                  {simulatedNodes.map(node => (
                      <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer group">
                          <circle r={12} fill={getNodeColor(node.type)} stroke="white" strokeWidth={2} />
                          <text textAnchor="middle" y={24} fill="white" fontSize="10px" className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">{node.label}</text>
                      </g>
                  ))}
              </svg>
          </div>
      )}

    </div>
  );
};

export default ResultsReport;