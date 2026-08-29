import { Application, Graphics, Container, Text, TextStyle } from 'pixi.js';
import { Agent, LogEntry } from '../types';

export const TILE_SIZE = 32;

export class OfficeEngine {
  public app: Application;
  private container: Container;
  private agentsMap: Map<string, { data: Agent; graphics: Container }> = new Map();
  private rooms: { name: string; x: number; y: number; w: number; h: number; color: number }[] = [];
  
  private isDestroyed = false;
  private isInitialized = false;
  private simulationInterval?: number;

  public onLog?: (log: LogEntry) => void;
  public onAgentUpdate?: (agents: Agent[]) => void;

  constructor() {
    this.app = new Application();
    this.container = new Container();
  }

  public async init(canvas: HTMLCanvasElement) {
    await this.app.init({
      canvas,
      backgroundColor: 0x020617,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: false,
    });

    if (this.isDestroyed) {
      try {
        this.app.destroy({ removeView: false }, { children: true });
      } catch (e) {
        console.error('PixiJS cleanup error in init:', e);
      }
      return;
    }

    this.isInitialized = true;

    // Setup pixel art rendering
    // PixiJS v8 scale mode is usually set per texture or globally differently,
    // but the `antialias: false` in app.init covers most of it.
    
    this.app.stage.addChild(this.container);

    // Center the map a bit (mock camera)
    this.container.x = 40;
    this.container.y = 40;
    this.container.scale.set(1.5); // Make the pixel art chunkier

    this.drawMap();
    this.setupAgents();

    this.app.ticker.add((time) => {
      this.update(time.deltaTime);
    });
    
    // Simulate random events
    this.simulationInterval = window.setInterval(() => this.simulateEvent(), 5000);
  }

  public resize(width: number, height: number) {
    if (this.isInitialized && this.app.renderer) {
      this.app.renderer.resize(width, height);
    }
  }

  private drawMap() {
    const bg = new Graphics();
    
    // Layout based on brief (simplified)
    this.rooms = [
      { name: 'CEO', x: 0, y: 0, w: 6, h: 5, color: 0x1E293B },
      { name: 'Diretoria', x: 7, y: 0, w: 6, h: 5, color: 0x1E293B },
      { name: 'Engenharia', x: 0, y: 6, w: 8, h: 6, color: 0x1E293B },
      { name: 'Design', x: 9, y: 6, w: 6, h: 6, color: 0x1E293B },
      { name: 'Fábrica LPs', x: 0, y: 13, w: 8, h: 6, color: 0x1E293B },
      { name: 'Marketing', x: 9, y: 13, w: 10, h: 6, color: 0x1E293B },
      { name: 'Fábrica Canais', x: 16, y: 0, w: 12, h: 8, color: 0x1E293B },
    ];

    // Corridors
    bg.rect(0, 0, 30 * TILE_SIZE, 20 * TILE_SIZE).fill({ color: 0x0F172A }); // sleeker corridor

    // Draw Rooms
    this.rooms.forEach(room => {
      bg.rect(room.x * TILE_SIZE, room.y * TILE_SIZE, room.w * TILE_SIZE, room.h * TILE_SIZE)
        .fill({ color: room.color })
        .stroke({ color: 0x334155, width: 2, alignment: 1 });
    });

    // Draw Grid Lines (optional for the pixel tilemap look)
    for (let x = 0; x <= 30; x++) {
      bg.moveTo(x * TILE_SIZE, 0);
      bg.lineTo(x * TILE_SIZE, 20 * TILE_SIZE);
      bg.stroke({ color: 0x000000, alpha: 0.1, width: 1 });
    }
    for (let y = 0; y <= 20; y++) {
      bg.moveTo(0, y * TILE_SIZE);
      bg.lineTo(30 * TILE_SIZE, y * TILE_SIZE);
      bg.stroke({ color: 0x000000, alpha: 0.1, width: 1 });
    }

    this.container.addChild(bg);

    // Draw Desks
    const desks = new Graphics();
    const deskPositions = [
      { x: 3, y: 2 }, // CEO
      { x: 8, y: 2 }, // Sócio
      { x: 2, y: 8 }, // Tato
      { x: 11, y: 8 }, // Marina
      { x: 12, y: 15 }, // Gael
      { x: 18, y: 4 }, // Oráculo
    ];

    deskPositions.forEach(d => {
      desks.rect(d.x * TILE_SIZE + 4, d.y * TILE_SIZE + 16, 24, 12)
           .fill({ color: 0x475569 })
           .stroke({ color: 0x1E293B, width: 2, alignment: 1 });
    });
    this.container.addChild(desks);

    // Room Labels
    this.rooms.forEach(room => {
      const label = new Text({
        text: room.name,
        style: new TextStyle({
          fontFamily: 'monospace',
          fontSize: 10,
          fill: 0x94A3B8,
        })
      });
      label.x = room.x * TILE_SIZE + 4;
      label.y = room.y * TILE_SIZE + 4;
      this.container.addChild(label);
    });
  }

  private setupAgents() {
    const initialAgents: Agent[] = [
      { id: 'ceo', name: 'Carlos', role: 'CEO', sector: 'CEO', status: 'idle', x: 3, y: 2, color: 0xd9af62, tokens: 0 },
      { id: 'a1', name: 'Bruno', role: 'Sócio', sector: 'Diretoria', status: 'idle', x: 8, y: 2, color: 0xf0cf89, tokens: 120 },
      { id: 'a2', name: 'Tato', role: 'Engenheiro', sector: 'Engenharia', status: 'working', x: 2, y: 8, color: 0x5a9bd4, tokens: 450 },
      { id: 'a3', name: 'Marina', role: 'Designer', sector: 'Design', status: 'working', x: 11, y: 8, color: 0xd45a9b, tokens: 300 },
      { id: 'a4', name: 'Gael', role: 'Growth', sector: 'Marketing', status: 'working', x: 12, y: 15, color: 0x5ad488, tokens: 890 },
      { id: 'a5', name: 'Oráculo', role: 'Diretor', sector: 'Fábrica Canais', status: 'idle', x: 18, y: 4, color: 0x9b5ad4, tokens: 1200 },
    ];

    initialAgents.forEach(agent => {
      const agentContainer = new Container();
      
      // Shadow
      const shadow = new Graphics();
      shadow.ellipse(0, 0, 10, 5).fill({ color: 0x000000, alpha: 0.3 });
      shadow.y = 12;
      agentContainer.addChild(shadow);

      // Body (pixel art proxy)
      const body = new Graphics();
      body.rect(-8, -12, 16, 20).fill({ color: agent.color }).stroke({ color: 0x0b0e10, width: 2, alignment: 1 });
      
      // Head
      const head = new Graphics();
      head.rect(-6, -24, 12, 12).fill({ color: 0xffdbac }).stroke({ color: 0x0b0e10, width: 2, alignment: 1 });
      
      agentContainer.addChild(body);
      agentContainer.addChild(head);

      // Name tag
      const tag = new Text({
        text: agent.name,
        style: new TextStyle({ fontSize: 9, fill: 0xffffff, fontFamily: 'monospace' })
      });
      tag.anchor.set(0.5, 1);
      tag.y = -28;
      agentContainer.addChild(tag);

      // Initial position
      agentContainer.x = agent.x * TILE_SIZE + TILE_SIZE / 2;
      agentContainer.y = agent.y * TILE_SIZE + TILE_SIZE / 2;

      this.container.addChild(agentContainer);
      this.agentsMap.set(agent.id, { data: agent, graphics: agentContainer });
    });

    this.emitUpdate();
  }

  private update(delta: number) {
    const speed = 2 * delta;
    
    this.agentsMap.forEach(({ data, graphics }) => {
      if (data.targetX !== undefined && data.targetY !== undefined) {
        const tx = data.targetX * TILE_SIZE + TILE_SIZE / 2;
        const ty = data.targetY * TILE_SIZE + TILE_SIZE / 2;
        
        const dx = tx - graphics.x;
        const dy = ty - graphics.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < speed) {
          graphics.x = tx;
          graphics.y = ty;
          data.x = data.targetX;
          data.y = data.targetY;
          data.targetX = undefined;
          data.targetY = undefined;
          
          if (data.status === 'walking') {
            data.status = 'meeting_ceo';
            this.log(`${data.name} aguardando aprovação do CEO.`);
            // Return to desk after 3 seconds
            setTimeout(() => this.returnToDesk(data.id), 3000);
          } else if (data.status === 'idle') {
            data.status = 'working';
          }
          this.emitUpdate();
        } else {
          graphics.x += (dx / dist) * speed;
          graphics.y += (dy / dist) * speed;
          
          // Bobbing animation
          graphics.getChildAt(1).y = Math.sin(Date.now() / 100) * 2; // body
          graphics.getChildAt(2).y = Math.sin(Date.now() / 100) * 2 - 24; // head
        }
      } else {
        // Reset bobbing
        graphics.getChildAt(1).y = -12;
        graphics.getChildAt(2).y = -24;
      }
    });
  }

  private simulateEvent() {
    const agents = Array.from(this.agentsMap.values()).map(a => a.data).filter(a => a.id !== 'ceo');
    if (agents.length === 0) return;
    
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    
    if (randomAgent.status === 'working' || randomAgent.status === 'idle') {
      if (Math.random() > 0.5) {
        // Needs CEO approval
        randomAgent.status = 'walking';
        randomAgent.targetX = 4; // CEO office door
        randomAgent.targetY = 2;
        this.log(`${randomAgent.name} está indo pedir aprovação ao CEO.`);
        this.emitUpdate();
      } else {
        // Just working and generating tokens
        randomAgent.tokens += Math.floor(Math.random() * 50) + 10;
        this.emitUpdate();
      }
    }
  }

  private returnToDesk(agentId: string) {
    const agent = this.agentsMap.get(agentId);
    if (!agent) return;
    
    this.log(`CEO aprovou pedido de ${agent.data.name}.`);
    agent.data.status = 'idle'; // walking back
    
    // Find their original room (mocked, we just send them to a random spot in their sector)
    const room = this.rooms.find(r => r.name === agent.data.sector);
    if (room) {
      agent.data.targetX = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
      agent.data.targetY = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
    }
    this.emitUpdate();
  }

  private log(message: string) {
    if (this.onLog) {
      this.onLog({
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message
      });
    }
  }

  private emitUpdate() {
    if (this.onAgentUpdate) {
      this.onAgentUpdate(Array.from(this.agentsMap.values()).map(a => ({ ...a.data })));
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    if (this.isInitialized) {
      try {
        this.app.destroy({ removeView: false }, { children: true });
      } catch (e) {
        console.error('PixiJS cleanup error:', e);
      }
    }
  }
}
