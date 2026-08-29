import { Agent, LogEntry } from '../types';
import { Activity, Cpu, TerminalSquare, Users, Edit3, Grid, Square, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  agents: Agent[];
  logs: LogEntry[];
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  editTool: 'wall' | 'desk' | 'delete';
  setEditTool: (v: 'wall' | 'desk' | 'delete') => void;
}

export function Sidebar({ agents, logs, isEditMode, setIsEditMode, editTool, setEditTool }: Props) {
  const totalTokens = agents.reduce((acc, a) => acc + a.tokens, 0);
  
  return (
    <aside className="w-80 border-r border-slate-800 bg-[#0F172A] flex flex-col shrink-0 z-10">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Metricas globais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Users size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Agentes</span>
            </div>
            <div className="text-xl font-semibold text-slate-200">{agents.length}</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Cpu size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tokens</span>
            </div>
            <div className="text-xl font-semibold text-indigo-400">
              {(totalTokens / 1000).toFixed(1)}k
            </div>
          </div>
        </div>

        {/* Agentes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Equipe Online
            </p>
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                "p-1.5 rounded-md flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors",
                isEditMode ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              )}
            >
              <Edit3 size={12} /> {isEditMode ? 'Editing' : 'Edit Map'}
            </button>
          </div>

          {isEditMode && (
            <div className="bg-slate-900/80 p-3 rounded-lg border border-indigo-500/30 mb-4 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] uppercase font-bold text-indigo-400 mb-2">Build Tools</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setEditTool('wall')}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded border transition-colors",
                    editTool === 'wall' ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  <Square size={14} className="mb-1" />
                  <span className="text-[9px] uppercase font-bold">Wall</span>
                </button>
                <button
                  onClick={() => setEditTool('desk')}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded border transition-colors",
                    editTool === 'desk' ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  <Grid size={14} className="mb-1" />
                  <span className="text-[9px] uppercase font-bold">Desk</span>
                </button>
                <button
                  onClick={() => setEditTool('delete')}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded border transition-colors",
                    editTool === 'delete' ? "bg-red-500/20 border-red-500 text-red-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  <Trash2 size={14} className="mb-1" />
                  <span className="text-[9px] uppercase font-bold">Erase</span>
                </button>
              </div>
            </div>
          )}

          <ul className="space-y-1">
            {agents.map(agent => (
              <li key={agent.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-800/50 border border-transparent hover:border-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full shadow-sm" 
                    style={{ backgroundColor: '#' + agent.color.toString(16).padStart(6, '0') }} 
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-300">{agent.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">{agent.sector}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-[10px] uppercase font-bold tracking-wider",
                    agent.status === 'working' ? 'text-emerald-400' : 
                    agent.status === 'walking' || agent.status === 'meeting_ceo' ? 'text-indigo-400' : 'text-slate-500'
                  )}>
                    {agent.status === 'working' && 'Produzindo'}
                    {agent.status === 'walking' && 'Em trânsito'}
                    {agent.status === 'meeting_ceo' && 'Em Reunião'}
                    {agent.status === 'idle' && 'Ocioso'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">{agent.tokens} tk</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Terminal / Logs */}
      <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-[#0F172A]/50">
          <TerminalSquare size={14} className="text-slate-500" />
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Auditoria do Sistema</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-1.5">
          {logs.map(log => (
            <div key={log.id} className="text-[10px] font-mono leading-relaxed">
              <span className="text-indigo-500/70 mr-2">[{log.time}]</span>
              <span className="text-slate-400">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-[10px] text-slate-600 font-mono italic">SYSTEM_CORE_INIT: SUCCESS...</div>
          )}
        </div>
      </div>
    </aside>
  );
}
