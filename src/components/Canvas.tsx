import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group } from 'react-konva';
import { ComponentType, SystemNode, SystemEdge } from '../types';
import { LucideIcon, Server, Database, Zap, Globe, Cpu, MessageSquare, ShieldCheck, Activity } from 'lucide-react';

interface CanvasProps {
  nodes: SystemNode[];
  edges: SystemEdge[];
  onNodeMove: (id: string, x: number, y: number) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

const COMPONENT_ICONS: Record<ComponentType, any> = {
  [ComponentType.LOAD_BALANCER]: Activity,
  [ComponentType.API_GATEWAY]: ShieldCheck,
  [ComponentType.MICROSERVICE]: Cpu,
  [ComponentType.DATABASE]: Database,
  [ComponentType.CACHE]: Zap,
  [ComponentType.MESSAGE_QUEUE]: MessageSquare,
  [ComponentType.CDN]: Globe,
  [ComponentType.EXTERNAL_SERVICE]: Server,
};

const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  onNodeMove,
  onConnect,
  selectedNodeId,
  onSelectNode,
}) => {
  const [stageSize, setStageSize] = useState({ width: window.innerWidth - 600, height: window.innerHeight - 100 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNodeClick = (id: string) => {
    if (connectingFrom && connectingFrom !== id) {
      onConnect(connectingFrom, id);
      setConnectingFrom(null);
    } else {
      onSelectNode(id);
    }
  };

  const handleConnectStart = (e: any, id: string) => {
    e.cancelBubble = true;
    setConnectingFrom(id);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#151619] relative overflow-hidden">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onClick={() => onSelectNode(null)}
      >
        <Layer>
          {/* Grid Lines */}
          {Array.from({ length: Math.ceil(stageSize.width / 40) }).map((_, i) => (
            <Line
              key={`v-${i}`}
              points={[i * 40, 0, i * 40, stageSize.height]}
              stroke="#2A2D32"
              strokeWidth={1}
              dash={[2, 2]}
            />
          ))}
          {Array.from({ length: Math.ceil(stageSize.height / 40) }).map((_, i) => (
            <Line
              key={`h-${i}`}
              points={[0, i * 40, stageSize.width, i * 40]}
              stroke="#2A2D32"
              strokeWidth={1}
              dash={[2, 2]}
            />
          ))}

          {/* Edges */}
          {edges.map((edge) => {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target);
            if (!source || !target) return null;

            return (
              <Line
                key={edge.id}
                points={[source.x + 50, source.y + 40, target.x + 50, target.y + 40]}
                stroke="#4A4D52"
                strokeWidth={2}
                lineCap="round"
                lineJoin="round"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <Group
              key={node.id}
              x={node.x}
              y={node.y}
              draggable
              onDragMove={(e) => onNodeMove(node.id, e.target.x(), e.target.y())}
              onClick={() => handleNodeClick(node.id)}
            >
              <Rect
                width={100}
                height={80}
                fill={selectedNodeId === node.id ? '#2A2D32' : '#1E2126'}
                stroke={selectedNodeId === node.id ? '#00FF00' : '#4A4D52'}
                strokeWidth={2}
                cornerRadius={8}
                shadowBlur={10}
                shadowColor="rgba(0,0,0,0.5)"
              />
              <Text
                text={node.label}
                width={100}
                align="center"
                y={60}
                fill="#FFFFFF"
                fontSize={10}
                fontFamily="JetBrains Mono"
              />
              {/* Connection Point */}
              <Circle
                x={100}
                y={40}
                radius={6}
                fill={connectingFrom === node.id ? '#00FF00' : '#4A4D52'}
                onClick={(e) => handleConnectStart(e, node.id)}
                onMouseEnter={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'crosshair';
                }}
                onMouseLeave={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'default';
                }}
              />
              {/* Icon Placeholder (Text for now, using Lucide in UI layer is better but Konva needs canvas drawing) */}
              <Text
                text={node.type.split('_').map(w => w[0]).join('')}
                width={100}
                align="center"
                y={20}
                fill="#8E9299"
                fontSize={20}
                fontFamily="JetBrains Mono"
                fontStyle="bold"
              />
            </Group>
          ))}
        </Layer>
      </Stage>

      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#00FF00] text-black font-mono text-xs rounded-full animate-pulse">
          SELECT TARGET COMPONENT TO CONNECT
        </div>
      )}
    </div>
  );
};

export default Canvas;
