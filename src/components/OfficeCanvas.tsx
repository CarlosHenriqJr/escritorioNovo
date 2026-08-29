import { useEffect, useRef } from 'react';
import { OfficeEngine } from '../game/engine';
import { Agent, LogEntry } from '../types';

interface Props {
  onAgentsUpdate: (agents: Agent[]) => void;
  onLog: (log: LogEntry) => void;
  isEditMode: boolean;
  editTool: 'wall' | 'desk' | 'delete';
}

export function OfficeCanvas({ onAgentsUpdate, onLog, isEditMode, editTool }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OfficeEngine | null>(null);

  // Sync callbacks without recreating engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.onAgentUpdate = onAgentsUpdate;
      engineRef.current.onLog = onLog;
    }
  }, [onAgentsUpdate, onLog]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.isEditMode = isEditMode;
      engineRef.current.editTool = editTool;
    }
  }, [isEditMode, editTool]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Create canvas dynamically to avoid StrictMode conflicts
    const canvas = document.createElement('canvas');
    canvas.className = "block w-full h-full";
    canvas.style.touchAction = "none";
    container.appendChild(canvas);
    
    const engine = new OfficeEngine();
    engine.onAgentUpdate = onAgentsUpdate;
    engine.onLog = onLog;
    engineRef.current = engine;
    
    (async () => {
      try {
        await engine.init(canvas);
        if (container) {
          const { width, height } = container.getBoundingClientRect();
          engine.resize(width, height);
        }
      } catch (e) {
        console.error("PIXI INIT ERROR:", e);
      }
    })();
    
    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0 && engineRef.current) {
        const { width, height } = entries[0].contentRect;
        engineRef.current.resize(width, height);
      }
    });
    
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden bg-transparent" />
  );
}
