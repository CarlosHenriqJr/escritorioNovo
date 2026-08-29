import { useState, useCallback } from 'react';
import { OfficeCanvas } from './components/OfficeCanvas';
import { Sidebar } from './components/Sidebar';
import { Agent, LogEntry } from './types';

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const handleAgentsUpdate = useCallback((newAgents: Agent[]) => {
    setAgents(newAgents);
  }, []);

  const handleLog = useCallback((log: LogEntry) => {
    setLogs(prev => [log, ...prev].slice(0, 50)); // Keep last 50 logs
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-[#0F172A] text-slate-200 font-sans overflow-hidden">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-[#0F172A]/80 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <span className="text-lg font-bold tracking-tight">VIRTUDESK <span className="text-indigo-400 font-normal">OS</span></span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Engine: PixiJS v8.0</span>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar agents={agents} logs={logs} />
        <main className="flex-1 relative bg-slate-950">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-0"></div>
          <div className="absolute inset-0 z-10">
            <OfficeCanvas onAgentsUpdate={handleAgentsUpdate} onLog={handleLog} />
          </div>
        </main>
      </div>
    </div>
  );
}
