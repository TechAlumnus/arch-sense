import React, { useState } from 'react';
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
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  onAddComponent: (type: ComponentType) => void;
}

const COMPONENT_METADATA: Record<ComponentType, { label: string; icon: any; description: string }> = {
  [ComponentType.LOAD_BALANCER]: { 
    label: 'Load Balancer', 
    icon: Activity, 
    description: 'Distributes incoming network traffic.' 
  },
  [ComponentType.L4_LOAD_BALANCER]: { 
    label: 'L4 Load Balancer', 
    icon: Activity, 
    description: 'Transport layer (TCP/UDP) routing.' 
  },
  [ComponentType.L7_LOAD_BALANCER]: { 
    label: 'L7 Load Balancer', 
    icon: Activity, 
    description: 'Application layer (HTTP/HTTPS) routing.' 
  },
  [ComponentType.API_GATEWAY]: { 
    label: 'API Gateway', 
    icon: ShieldCheck, 
    description: 'Entry point for all clients.' 
  },
  [ComponentType.MICROSERVICE]: { 
    label: 'Microservice', 
    icon: Cpu, 
    description: 'Independent service handling logic.' 
  },
  [ComponentType.DATABASE]: { 
    label: 'Database', 
    icon: Database, 
    description: 'Persistent data storage.' 
  },
  [ComponentType.CACHE]: { 
    label: 'Cache', 
    icon: Zap, 
    description: 'In-memory data store.' 
  },
  [ComponentType.MESSAGE_QUEUE]: { 
    label: 'Message Queue', 
    icon: MessageSquare, 
    description: 'Async communication.' 
  },
  [ComponentType.CDN]: { 
    label: 'CDN', 
    icon: Globe, 
    description: 'Content Delivery Network.' 
  },
  [ComponentType.EXTERNAL_SERVICE]: { 
    label: 'External API', 
    icon: Server, 
    description: 'Third-party services.' 
  },
  [ComponentType.COMMENT]: { 
    label: 'Comment', 
    icon: MessageCircle, 
    description: 'Add a text note to the canvas.' 
  },
};

const Sidebar: React.FC<SidebarProps> = ({ onAddComponent }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`h-full bg-[#1E2126] border-r border-[#2A2D32] flex flex-col transition-all duration-300 relative ${isCollapsed ? 'w-12' : 'w-[300px]'}`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-[#2A2D32] text-white p-1 rounded-full z-10 hover:bg-[#00FF00] hover:text-black transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {!isCollapsed && (
        <div className="p-6 border-b border-[#2A2D32]">
          <h1 className="text-lg font-bold text-white tracking-tight mb-1">Components</h1>
          <p className="text-[10px] font-mono text-[#00FF00] uppercase tracking-widest">Drag to Canvas</p>
        </div>
      )}

      <div className={`p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide ${isCollapsed ? 'hidden' : 'block'}`}>
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
      
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center py-4 gap-4 overflow-y-auto scrollbar-hide">
          {(Object.entries(COMPONENT_METADATA) as [ComponentType, any][]).map(([type, meta]) => (
            <button
              key={type}
              onClick={() => onAddComponent(type)}
              title={meta.label}
              className="p-2 bg-[#151619] border border-[#2A2D32] rounded-lg hover:border-[#00FF00] hover:text-[#00FF00] text-[#8E9299] transition-all"
            >
              <meta.icon size={16} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
