import React from 'react';
import { ComponentType } from '../types';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Zap, 
  MessageSquare, 
  Globe, 
  Server,
  Plus,
  Info
} from 'lucide-react';

interface SidebarProps {
  onAddComponent: (type: ComponentType) => void;
  scenario: string;
  phase: string;
  onEvaluate: () => void;
}

const COMPONENT_METADATA: Record<ComponentType, { label: string; icon: any; description: string }> = {
  [ComponentType.LOAD_BALANCER]: { 
    label: 'Load Balancer', 
    icon: Activity, 
    description: 'Distributes incoming network traffic across multiple servers.' 
  },
  [ComponentType.API_GATEWAY]: { 
    label: 'API Gateway', 
    icon: ShieldCheck, 
    description: 'Entry point for all clients. Handles auth, rate limiting, etc.' 
  },
  [ComponentType.MICROSERVICE]: { 
    label: 'Microservice', 
    icon: Cpu, 
    description: 'Independent service handling specific business logic.' 
  },
  [ComponentType.DATABASE]: { 
    label: 'Database', 
    icon: Database, 
    description: 'Persistent data storage (SQL or NoSQL).' 
  },
  [ComponentType.CACHE]: { 
    label: 'Cache', 
    icon: Zap, 
    description: 'In-memory data store for high-speed access.' 
  },
  [ComponentType.MESSAGE_QUEUE]: { 
    label: 'Message Queue', 
    icon: MessageSquare, 
    description: 'Asynchronous communication between services.' 
  },
  [ComponentType.CDN]: { 
    label: 'CDN', 
    icon: Globe, 
    description: 'Content Delivery Network for static assets.' 
  },
  [ComponentType.EXTERNAL_SERVICE]: { 
    label: 'External API', 
    icon: Server, 
    description: 'Third-party services (e.g., Twilio, SendGrid).' 
  },
};

const Sidebar: React.FC<SidebarProps> = ({ onAddComponent, scenario, phase, onEvaluate }) => {
  return (
    <div className="w-[300px] h-full bg-[#1E2126] border-r border-[#2A2D32] flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[#2A2D32]">
        <h1 className="text-lg font-bold text-white tracking-tight mb-1">System Design</h1>
        <p className="text-[10px] font-mono text-[#00FF00] uppercase tracking-widest">Simulator v1.0</p>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#4A4D52] uppercase tracking-widest">Scenario</span>
            <span className="px-2 py-0.5 bg-[#2A2D32] text-[9px] text-[#8E9299] rounded uppercase font-mono">{phase}</span>
          </div>
          <div className="p-3 bg-[#151619] border border-[#2A2D32] rounded-lg">
            <p className="text-xs text-[#E0E0E0] leading-relaxed italic">"{scenario}"</p>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-mono text-[#4A4D52] uppercase tracking-widest block">Components</span>
          <div className="grid grid-cols-1 gap-2">
            {(Object.entries(COMPONENT_METADATA) as [ComponentType, any][]).map(([type, meta]) => (
              <button
                key={type}
                onClick={() => onAddComponent(type)}
                className="group flex items-center gap-3 p-3 bg-[#151619] border border-[#2A2D32] rounded-lg hover:border-[#00FF00] hover:bg-[#1E2126] transition-all text-left"
              >
                <div className="p-2 bg-[#2A2D32] rounded text-[#8E9299] group-hover:text-[#00FF00] transition-colors">
                  <meta.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FFFFFF] truncate">{meta.label}</span>
                    <Plus size={12} className="text-[#4A4D52] group-hover:text-[#00FF00]" />
                  </div>
                  <p className="text-[10px] text-[#4A4D52] truncate">{meta.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-[#2A2D32] bg-[#151619]">
        <button
          onClick={onEvaluate}
          className="w-full py-3 bg-[#00FF00] text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#00CC00] transition-colors shadow-[0_0_20px_rgba(0,255,0,0.2)]"
        >
          Submit for Review
        </button>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-[#4A4D52] font-mono">
          <Info size={12} />
          <span>Final evaluation ends the session</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
