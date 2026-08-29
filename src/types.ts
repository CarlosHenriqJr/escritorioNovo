export type AgentStatus = 'idle' | 'working' | 'walking' | 'meeting_ceo';

export interface Agent {
  id: string;
  name: string;
  role: string;
  sector: string;
  status: AgentStatus;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  color: number;
  tokens: number;
}

export interface LogEntry {
  id: string;
  time: string;
  message: string;
}
