import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import AIReviewer from './components/AIReviewer';
import EvaluationView from './components/EvaluationView';
import { 
  ComponentType, 
  SystemNode, 
  SystemEdge, 
  SimulationState, 
  Message, 
  Evaluation,
  StressEvent
} from './types';
import { getArchitectFeedback, getFinalEvaluation } from './services/geminiService';
import { Terminal, Shield, Zap, AlertCircle } from 'lucide-react';

const INITIAL_SCENARIO = "Design a scalable notification system for a global social network with 100M active users. Must handle push, email, and SMS with low latency and high reliability.";

const STRESS_EVENTS: StressEvent[] = [
  {
    id: 'spike',
    title: 'Flash Traffic Spike',
    description: 'A major celebrity just posted. Traffic has increased by 50x in the last 2 minutes. Your load balancer is reporting high latency.',
    impact: 'Increased latency, potential database connection exhaustion.',
    triggered: false
  },
  {
    id: 'outage',
    title: 'Third-Party Provider Outage',
    description: 'Your primary SMS provider is experiencing a regional outage. 40% of notification deliveries are failing.',
    impact: 'Notification delivery failures, queue buildup.',
    triggered: false
  }
];

export default function App() {
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [edges, setEdges] = useState<SystemEdge[]>([]);
  const [state, setState] = useState<SimulationState>({
    phase: 'DESIGN',
    scenario: INITIAL_SCENARIO,
    stressEvents: STRESS_EVENTS,
    currentStressIndex: -1
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'architect',
      content: "Welcome to the architectural review. I'm your lead architect. We need a notification system that won't crumble under load. Start by placing your core components on the canvas. I'll be watching.",
      timestamp: Date.now()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const handleAddComponent = (type: ComponentType) => {
    const newNode: SystemNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      label: type.toLowerCase().replace('_', ' '),
      properties: {}
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeMove = (id: string, x: number, y: number) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, x, y } : n));
  };

  const handleConnect = (source: string, target: string) => {
    const newEdge: SystemEdge = {
      id: `${source}-${target}`,
      source,
      target
    };
    if (!edges.find(e => e.id === newEdge.id)) {
      setEdges([...edges, newEdge]);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const feedback = await getArchitectFeedback(nodes, edges, newMessages, state.phase);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'architect',
        content: feedback || "Interesting point. Tell me more about how you handle failures in that part of the system.",
        timestamp: Date.now()
      }]);

      // Trigger stress events after a few messages
      if (newMessages.length > 4 && state.currentStressIndex < state.stressEvents.length - 1) {
        const nextIndex = state.currentStressIndex + 1;
        setState(prev => ({
          ...prev,
          phase: 'STRESS',
          currentStressIndex: nextIndex
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEvaluate = async () => {
    setIsTyping(true);
    try {
      const result = await getFinalEvaluation(nodes, edges, messages);
      setEvaluation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRestart = () => {
    setNodes([]);
    setEdges([]);
    setMessages([{
      id: '1',
      role: 'architect',
      content: "New session. The requirements are the same. Let's see if you've learned from the last review.",
      timestamp: Date.now()
    }]);
    setState({
      phase: 'DESIGN',
      scenario: INITIAL_SCENARIO,
      stressEvents: STRESS_EVENTS,
      currentStressIndex: -1
    });
    setEvaluation(null);
  };

  return (
    <div className="flex h-screen w-full bg-[#0A0B0D] text-white font-sans overflow-hidden">
      {/* Header Bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-[#1E2126] border-b border-[#2A2D32] z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#00FF00]" />
            <span className="text-xs font-bold uppercase tracking-widest">System Design Simulator</span>
          </div>
          <div className="h-4 w-[1px] bg-[#2A2D32]" />
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[#8E9299]" />
            <span className="text-[10px] font-mono text-[#8E9299] uppercase">Session: active_node_01</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#00FF00]" />
            <span className="text-[10px] font-mono text-[#8E9299]">LATENCY: 24ms</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className={state.phase === 'STRESS' ? 'text-red-500 animate-pulse' : 'text-[#8E9299]'} />
            <span className="text-[10px] font-mono text-[#8E9299]">STATUS: {state.phase}</span>
          </div>
        </div>
      </div>

      <div className="flex w-full mt-12">
        <Sidebar 
          onAddComponent={handleAddComponent} 
          scenario={state.scenario}
          phase={state.phase}
          onEvaluate={handleEvaluate}
        />
        
        <main className="flex-1 relative">
          <Canvas 
            nodes={nodes}
            edges={edges}
            onNodeMove={handleNodeMove}
            onConnect={handleConnect}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </main>

        <aside className="w-[400px]">
          <AIReviewer 
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            stressEvent={state.currentStressIndex >= 0 ? state.stressEvents[state.currentStressIndex] : undefined}
          />
        </aside>
      </div>

      <AnimatePresence>
        {evaluation && (
          <EvaluationView 
            evaluation={evaluation} 
            onRestart={handleRestart} 
          />
        )}
      </AnimatePresence>

      {/* Global Overlay for Stress */}
      <AnimatePresence>
        {state.phase === 'STRESS' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none border-4 border-red-500/20 z-50 animate-pulse"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
