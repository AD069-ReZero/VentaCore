export type RiskLevel = 'normal' | 'suspicious' | 'critical';

export interface ThreatNodeData {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  risk: RiskLevel;
  mitreTactic?: string;
  confidence: number;
}

export function getRiskColorClass(risk: RiskLevel): {
  border: string;
  bg: string;
  text: string;
  glow: string;
  edgeColor: string;
} {
  switch (risk) {
    case 'critical':
      return {
        border: 'border-[#EF4444]',
        bg: 'bg-[#180A0A]',
        text: 'text-[#EF4444]',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]',
        edgeColor: '#EF4444',
      };
    case 'suspicious':
      return {
        border: 'border-[#F59E0B]',
        bg: 'bg-[#18130A]',
        text: 'text-[#F59E0B]',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
        edgeColor: '#F59E0B',
      };
    case 'normal':
    default:
      return {
        border: 'border-[#70FF5E]',
        bg: 'bg-[#0A130C]',
        text: 'text-[#70FF5E]',
        glow: 'shadow-[0_0_20px_rgba(112,255,94,0.25)]',
        edgeColor: '#70FF5E',
      };
  }
}

export function calculateChainMaxRisk(nodes: ThreatNodeData[]): RiskLevel {
  if (nodes.some((n) => n.risk === 'critical')) return 'critical';
  if (nodes.some((n) => n.risk === 'suspicious')) return 'suspicious';
  return 'normal';
}
