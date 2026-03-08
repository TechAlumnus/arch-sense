import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group, Arrow } from 'react-konva';
import { ComponentType, SystemNode, SystemEdge } from '../types';
import { LucideIcon, Server, Database, Zap, Globe, Cpu, MessageSquare, ShieldCheck, Activity, MessageCircle } from 'lucide-react';

interface CanvasProps {
  nodes: SystemNode[];
  edges: SystemEdge[];
  onNodeMove: (id: string, x: number, y: number) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onRemoveEdge: (edgeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onNodeDoubleClick?: (id: string) => void;
}

const COMPONENT_ICONS: Record<ComponentType, any> = {
  [ComponentType.LOAD_BALANCER]: Activity,
  [ComponentType.L4_LOAD_BALANCER]: Activity,
  [ComponentType.L7_LOAD_BALANCER]: Activity,
  [ComponentType.API_GATEWAY]: ShieldCheck,
  [ComponentType.MICROSERVICE]: Cpu,
  [ComponentType.DATABASE]: Database,
  [ComponentType.CACHE]: Zap,
  [ComponentType.MESSAGE_QUEUE]: MessageSquare,
  [ComponentType.CDN]: Globe,
  [ComponentType.EXTERNAL_SERVICE]: Server,
  [ComponentType.COMMENT]: MessageCircle,
};

const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  onNodeMove,
  onConnect,
  onRemoveEdge,
  onRemoveNode,
  selectedNodeId,
  onSelectNode,
  onNodeDoubleClick,
}) => {
  const [stageSize, setStageSize] = useState({ width: window.innerWidth - 600, height: window.innerHeight - 100 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setStageSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
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
    <div 
      ref={containerRef} 
      className="w-full h-full bg-[#151619] relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(#2A2D32 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        backgroundPosition: `${stagePos.x}px ${stagePos.y}px`
      }}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        draggable
        x={stagePos.x}
        y={stagePos.y}
        onDragMove={(e) => {
          if (e.target === e.target.getStage()) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onClick={(e) => {
          if (e.target === e.target.getStage()) {
            onSelectNode(null);
          }
        }}
        onKeyDown={(e) => {
          if ((e.evt.key === 'Backspace' || e.evt.key === 'Delete') && selectedNodeId) {
            onRemoveNode(selectedNodeId);
          }
        }}
        tabIndex={0}
      >
        <Layer>
          {/* Edges */}
          {edges.map((edge) => {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target);
            if (!source || !target) return null;

            const sourceWidth = source.type === ComponentType.COMMENT ? 150 : 100;
            const sourceHeight = source.type === ComponentType.COMMENT ? 60 : 80;
            const targetWidth = target.type === ComponentType.COMMENT ? 150 : 100;
            const targetHeight = target.type === ComponentType.COMMENT ? 60 : 80;

            const sourceCenterX = source.x + sourceWidth / 2;
            const sourceCenterY = source.y + sourceHeight / 2;
            const targetCenterX = target.x + targetWidth / 2;
            const targetCenterY = target.y + targetHeight / 2;

            const dx = targetCenterX - sourceCenterX;
            const dy = targetCenterY - sourceCenterY;
            const angle = Math.atan2(dy, dx);
            
            // Calculate intersection with target node (approximate with ellipse)
            const targetX = targetCenterX - Math.cos(angle) * (targetWidth / 2 + 5);
            const targetY = targetCenterY - Math.sin(angle) * (targetHeight / 2 + 5);
            
            // Calculate intersection with source node
            const sourceX = sourceCenterX + Math.cos(angle) * (sourceWidth / 2 + 5);
            const sourceY = sourceCenterY + Math.sin(angle) * (sourceHeight / 2 + 5);

            const isCommentEdge = source.type === ComponentType.COMMENT || target.type === ComponentType.COMMENT;

            return (
              <Group key={edge.id}>
                {/* Invisible thicker line for easier clicking */}
                <Line
                  points={[sourceX, sourceY, targetX, targetY]}
                  stroke="transparent"
                  strokeWidth={20}
                  onClick={() => onRemoveEdge(edge.id)}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'default';
                  }}
                />
                {isCommentEdge ? (
                  <Line
                    points={[sourceX, sourceY, targetX, targetY]}
                    stroke="#4A4D52"
                    strokeWidth={2}
                    dash={[5, 5]}
                    pointerEvents="none"
                  />
                ) : (
                  <Arrow
                    points={[sourceX, sourceY, targetX, targetY]}
                    stroke="#4A4D52"
                    fill="#4A4D52"
                    strokeWidth={2}
                    pointerLength={10}
                    pointerWidth={10}
                    lineCap="round"
                    lineJoin="round"
                    pointerEvents="none"
                  />
                )}
              </Group>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            if (node.type === ComponentType.COMMENT) {
              return (
                <Group
                  key={node.id}
                  x={node.x}
                  y={node.y}
                  draggable
                  onDragMove={(e) => onNodeMove(node.id, e.target.x(), e.target.y())}
                  onClick={() => handleNodeClick(node.id)}
                  onDblClick={() => onNodeDoubleClick?.(node.id)}
                >
                  <Rect
                    width={150}
                    height={60}
                    fill={selectedNodeId === node.id ? '#2A2D32' : '#1E2126'}
                    stroke={selectedNodeId === node.id ? '#00FF00' : '#4A4D52'}
                    strokeWidth={1}
                    cornerRadius={4}
                    dash={[5, 5]}
                  />
                  <Text
                    text={node.label}
                    width={130}
                    x={10}
                    y={10}
                    fill="#E0E0E0"
                    fontSize={12}
                    fontFamily="sans-serif"
                    fontStyle="italic"
                    wrap="word"
                  />
                  {/* Connection Point */}
                  <Circle
                    x={150}
                    y={30}
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
                  {/* Delete Button */}
                  {selectedNodeId === node.id && (
                    <Group
                      x={150}
                      y={0}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        onRemoveNode(node.id);
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'pointer';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    >
                      <Circle radius={8} fill="#FF4444" />
                      <Line
                        points={[-3, -3, 3, 3]}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                      <Line
                        points={[3, -3, -3, 3]}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    </Group>
                  )}
                </Group>
              );
            }

            return (
              <Group
                key={node.id}
                x={node.x}
                y={node.y}
                draggable
                onDragMove={(e) => onNodeMove(node.id, e.target.x(), e.target.y())}
                onClick={() => handleNodeClick(node.id)}
                onDblClick={() => onNodeDoubleClick?.(node.id)}
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
              {/* Delete Button */}
              {selectedNodeId === node.id && (
                <Group
                  x={100}
                  y={0}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    onRemoveNode(node.id);
                  }}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'default';
                  }}
                >
                  <Circle radius={8} fill="#FF4444" />
                  <Line
                    points={[-3, -3, 3, 3]}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <Line
                    points={[3, -3, -3, 3]}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                </Group>
              )}
            </Group>
            );
          })}
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
