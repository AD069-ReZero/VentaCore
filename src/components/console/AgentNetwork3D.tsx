import React, { useEffect, useRef } from 'react';
import { Shield, AlertTriangle, AlertOctagon, Cpu, Bot } from 'lucide-react';

interface AgentNode {
  id: string;
  name: string;
  status: 'ACTIVE' | 'HIGH RISK' | 'QUARANTINED';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  connections: string[];
}

const AGENTS: AgentNode[] = [
  {
    id: 'research',
    name: 'research-agent-01',
    status: 'ACTIVE',
    x: 75,
    y: 22,
    connections: ['mcp', 'finance', 'web'],
  },
  {
    id: 'web',
    name: 'web-agent-01',
    status: 'ACTIVE',
    x: 20,
    y: 58,
    connections: ['mcp', 'research'],
  },
  {
    id: 'mcp',
    name: 'mcp-agent-01',
    status: 'QUARANTINED',
    x: 52,
    y: 55,
    connections: ['research', 'web', 'finance', 'analysis'],
  },
  {
    id: 'finance',
    name: 'finance-agent-01',
    status: 'HIGH RISK',
    x: 88,
    y: 48,
    connections: ['mcp', 'analysis'],
  },
  {
    id: 'analysis',
    name: 'analysis-agent-01',
    status: 'ACTIVE',
    x: 76,
    y: 84,
    connections: ['mcp', 'finance'],
  },
];

export const AgentNetwork3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let reqId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 350;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      reqId = requestAnimationFrame(draw);
      t += 0.02;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Connection lines and animated pulse packets
      AGENTS.forEach((agent) => {
        const x1 = (agent.x / 100) * canvas.width;
        const y1 = (agent.y / 100) * canvas.height;

        agent.connections.forEach((targetId) => {
          const target = AGENTS.find((a) => a.id === targetId);
          if (!target) return;

          const x2 = (target.x / 100) * canvas.width;
          const y2 = (target.y / 100) * canvas.height;

          // Wire gradient
          const isQuarantined = agent.status === 'QUARANTINED' || target.status === 'QUARANTINED';
          const isHighRisk = agent.status === 'HIGH RISK' || target.status === 'HIGH RISK';

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = 1;
          ctx.strokeStyle = isQuarantined
            ? 'rgba(239, 68, 68, 0.25)'
            : isHighRisk
            ? 'rgba(245, 158, 11, 0.25)'
            : 'rgba(112, 255, 94, 0.2)';
          ctx.stroke();

          // Animated particle pulse along wire
          const progress = (t * 0.4 + (x1 + y1) * 0.01) % 1;
          const px = x1 + (x2 - x1) * progress;
          const py = y1 + (y2 - y1) * progress;

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = isQuarantined ? '#EF4444' : isHighRisk ? '#F59E0B' : '#70FF5E';
          ctx.shadowBlur = 6;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });
    };

    draw();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[400px] rounded-2xl bg-[#070A08] border border-white/5 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-[#70FF5E]/06 via-transparent to-transparent pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 vanta-noise opacity-30 pointer-events-none" />

      {/* Connection Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Agent Hologram Nodes overlaid matching panel 05 */}
      {AGENTS.map((agent) => {
        const isQuarantined = agent.status === 'QUARANTINED';
        const isHighRisk = agent.status === 'HIGH RISK';

        return (
          <div
            key={agent.id}
            style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
          >
            {/* Hologram Avatar / Head Orb */}
            <div
              className={`relative w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${
                isQuarantined
                  ? 'bg-[#150A0A] border-[#EF4444] shadow-[0_0_25px_rgba(239,68,68,0.4)] text-[#EF4444]'
                  : isHighRisk
                  ? 'bg-[#141007] border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.35)] text-[#F59E0B]'
                  : 'bg-[#0A130C] border-[#70FF5E] shadow-[0_0_20px_rgba(112,255,94,0.35)] text-[#70FF5E]'
              }`}
            >
              {/* Outer pulsing ring */}
              <div
                className={`absolute inset-0 rounded-full border animate-ping opacity-25 ${
                  isQuarantined
                    ? 'border-[#EF4444]'
                    : isHighRisk
                    ? 'border-[#F59E0B]'
                    : 'border-[#70FF5E]'
                }`}
              />

              {/* Wireframe head icon / glyph */}
              {isQuarantined ? (
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              ) : isHighRisk ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Bot className="w-6 h-6" />
              )}
            </div>

            {/* Label and Status */}
            <div className="mt-2 text-center whitespace-nowrap">
              <div className="text-xs font-mono font-medium text-white group-hover:text-[#70FF5E] transition-colors">
                {agent.name}
              </div>
              <div
                className={`text-[10px] font-mono tracking-widest font-semibold uppercase mt-0.5 ${
                  isQuarantined
                    ? 'text-[#EF4444]'
                    : isHighRisk
                    ? 'text-[#F59E0B]'
                    : 'text-[#70FF5E]'
                }`}
              >
                {agent.status}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
