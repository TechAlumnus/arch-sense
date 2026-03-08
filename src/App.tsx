import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import AIReviewer from './components/AIReviewer';
import EvaluationView from './components/EvaluationView';
import MissionBriefing from './components/MissionBriefing';
import ThinkingPrompt from './components/ThinkingPrompt';
import { analyzeArchitecture, DesignSignal } from './utils/architectureAnalyzer';
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
import { Terminal, Shield, Zap, AlertCircle, Clock, ChevronLeft } from 'lucide-react';

const INITIAL_SCENARIO = "Our app has seen scalability issues due to a rise in the number of users, hence we need to design a scalable notification system for a global social network with 100M active users. Must handle push, email, and SMS with low latency and high reliability.";

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
  const [isBriefingVisible, setIsBriefingVisible] = useState(true);
  const [isThinkingPromptVisible, setIsThinkingPromptVisible] = useState(false);
  const [scalingChallenge, setScalingChallenge] = useState('');
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [edges, setEdges] = useState<SystemEdge[]>([]);

  // Observation Window State
  const [observationTimeLeft, setObservationTimeLeft] = useState(180); // 3 minutes
  const [isObserving, setIsObserving] = useState(false);
  const [detectedSignals, setDetectedSignals] = useState<DesignSignal[]>([]);

  // ... (rest of the component)

  // ... (rest of the component)

  // Fetch initial state
  useEffect(() => {
    fetch('/api/session')
      .then(res => res.json())
      .then(data => {
        setNodes(data.nodes);
        setEdges(data.edges);
        setState(prev => ({ ...prev, phase: data.phase }));
      });
  }, []);

  // Sync state to backend
  const syncState = useCallback(async (newNodes: SystemNode[], newEdges: SystemEdge[], signals: DesignSignal[] = []) => {
    await fetch('/api/session/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: newNodes, edges: newEdges, scalingChallenge, signals })
    });
  }, [scalingChallenge]);

  const [state, setState] = useState<SimulationState>({
    phase: 'PROBLEM_STATEMENT',
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
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editNodeLabel, setEditNodeLabel] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isChallengeCollapsed, setIsChallengeCollapsed] = useState(false);

  const latestState = useRef({ nodes, edges, messages, phase: state.phase, detectedSignals, scenario: state.scenario });
  useEffect(() => {
    latestState.current = { nodes, edges, messages, phase: state.phase, detectedSignals, scenario: state.scenario };
  }, [nodes, edges, messages, state.phase, detectedSignals, state.scenario]);

  // Timer for observation window
  useEffect(() => {
    if (!isObserving) return;
    if (observationTimeLeft <= 0) {
      setIsObserving(false);
      
      const triggerAIReview = async () => {
        setIsTyping(true);
        const { nodes: currentNodes, edges: currentEdges, messages: currentMessages, phase: currentPhase, detectedSignals: currentSignals } = latestState.current;
        try {
          const hiddenPrompt = `The 3-minute observation window is over. The user has built the initial design. 
          Detected signals: ${currentSignals.join(', ')}. 
          Please review the design and ask a probing question based on these signals and the current graph.`;
          
          const feedback = await getArchitectFeedback(currentNodes, currentEdges, [...currentMessages, { id: 'hidden', role: 'user', content: hiddenPrompt, timestamp: Date.now() }], currentPhase, latestState.current.scenario, scalingChallenge);
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'architect',
            content: feedback,
            timestamp: Date.now()
          }]);
        } catch (error) {
          console.error("Failed to get architect feedback:", error);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'architect',
            content: "I've reviewed your initial design. Please explain your architectural choices.",
            timestamp: Date.now()
          }]);
        } finally {
          setIsTyping(false);
        }
      };
      
      triggerAIReview();
      return;
    }
    const timer = setInterval(() => {
      setObservationTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isObserving, observationTimeLeft]);

  // Signal detection
  useEffect(() => {
    if (isObserving) {
      const newSignals = analyzeArchitecture(nodes, edges);
      setDetectedSignals(newSignals);
      syncState(nodes, edges, newSignals);
    }
  }, [nodes, edges, isObserving, syncState]);

  const handleAddComponent = (type: ComponentType) => {
    const newNode: SystemNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      label: type === ComponentType.COMMENT ? 'New Comment' : type.toLowerCase().replace(/_/g, ' '),
      properties: {}
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    syncState(newNodes, edges);
    
    if (type === ComponentType.COMMENT) {
      setEditingNodeId(newNode.id);
      setEditNodeLabel('New Comment');
    }
  };

  const handleNodeDoubleClick = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      setEditingNodeId(id);
      setEditNodeLabel(node.label);
    }
  };

  const saveNodeLabel = () => {
    if (editingNodeId) {
      const newNodes = nodes.map(n => n.id === editingNodeId ? { ...n, label: editNodeLabel } : n);
      setNodes(newNodes);
      syncState(newNodes, edges);
      setEditingNodeId(null);
    }
  };

  const handleNodeMove = (id: string, x: number, y: number) => {
    const newNodes = nodes.map(n => n.id === id ? { ...n, x, y } : n);
    setNodes(newNodes);
    syncState(newNodes, edges);
  };

  const handleConnect = (source: string, target: string) => {
    const newEdge: SystemEdge = {
      id: `${source}-${target}`,
      source,
      target
    };
    if (!edges.find(e => e.id === newEdge.id)) {
      const newEdges = [...edges, newEdge];
      setEdges(newEdges);
      syncState(nodes, newEdges);
    }
  };

  const handleRemoveEdge = (edgeId: string) => {
    const newEdges = edges.filter(e => e.id !== edgeId);
    setEdges(newEdges);
    syncState(nodes, newEdges);
  };

  const handleRemoveNode = (nodeId: string) => {
    const newNodes = nodes.filter(n => n.id !== nodeId);
    const newEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNodeId(null);
    syncState(newNodes, newEdges);
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
      const feedback = await getArchitectFeedback(nodes, edges, newMessages, state.phase, state.scenario, scalingChallenge);
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
      const result = await getFinalEvaluation(nodes, edges, messages, state.scenario, scalingChallenge);
      setEvaluation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRestart = () => {
    setIsBriefingVisible(true);
    setIsThinkingPromptVisible(false);
    setScalingChallenge('');
    setNodes([]);
    setEdges([]);
    setMessages([{
      id: '1',
      role: 'architect',
      content: "New session. The requirements are the same. Let's see if you've learned from the last review.",
      timestamp: Date.now()
    }]);
    setState({
      phase: 'PROBLEM_STATEMENT',
      scenario: INITIAL_SCENARIO,
      stressEvents: STRESS_EVENTS,
      currentStressIndex: -1
    });
    setEvaluation(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0B0D] text-white font-sans overflow-hidden">
      <AnimatePresence>
        {isBriefingVisible && (
          <MissionBriefing onStart={() => {
            setIsBriefingVisible(false);
            setIsThinkingPromptVisible(true);
          }} />
        )}
        {isThinkingPromptVisible && (
          <ThinkingPrompt onContinue={(challenge) => {
            setScalingChallenge(challenge);
            setIsThinkingPromptVisible(false);
            setIsObserving(true);
            setObservationTimeLeft(180);
          }} />
        )}
      </AnimatePresence>

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
          {isObserving && (
            <div className="flex items-center gap-2 bg-[#2A2D32] px-3 py-1 rounded-full">
              <Clock size={14} className={observationTimeLeft < 60 ? "text-red-500 animate-pulse" : "text-[#00FF00]"} />
              <span className={`text-[10px] font-mono ${observationTimeLeft < 60 ? "text-red-500" : "text-[#00FF00]"}`}>
                {Math.floor(observationTimeLeft / 60)}:{(observationTimeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
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

      <div className="flex flex-1 w-full pt-12 overflow-hidden">
        <Sidebar 
          onAddComponent={handleAddComponent} 
        />
        
        <main className="flex-1 relative">
          <Canvas 
            nodes={nodes}
            edges={edges}
            onNodeMove={handleNodeMove}
            onConnect={handleConnect}
            onRemoveEdge={handleRemoveEdge}
            onRemoveNode={handleRemoveNode}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onNodeDoubleClick={handleNodeDoubleClick}
          />
          
          {/* Bottom Center Panel */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[600px] bg-[#1E2126] border border-[#2A2D32] rounded-xl shadow-2xl flex flex-col z-20 transition-all duration-300">
            <div 
              className="p-4 border-b border-[#2A2D32] flex items-center justify-between bg-[#151619] cursor-pointer rounded-t-xl"
              onClick={() => setIsChallengeCollapsed(!isChallengeCollapsed)}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#4A4D52] uppercase tracking-widest">The Challenge</span>
                <span className="px-2 py-0.5 bg-[#2A2D32] text-[9px] text-[#8E9299] rounded uppercase font-mono">{state.phase.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-4">
                {isChallengeCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEvaluate();
                    }}
                    className="px-4 py-1.5 bg-[#00FF00] text-black font-bold text-[10px] uppercase tracking-widest rounded hover:bg-[#00CC00] transition-colors shadow-[0_0_10px_rgba(0,255,0,0.2)]"
                  >
                    Submit
                  </button>
                )}
                <button className="text-[#8E9299] hover:text-white transition-colors">
                  {isChallengeCollapsed ? <ChevronLeft size={16} className="rotate-90" /> : <ChevronLeft size={16} className="-rotate-90" />}
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {!isChallengeCollapsed && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-[#1E2126]">
                    <p className="text-[10px] font-mono text-[#00FF00] uppercase mb-2">Current Issue</p>
                    <p className="text-xs text-[#E0E0E0] leading-relaxed italic">"{state.scenario}"</p>
                    {scalingChallenge && (
                      <div className="mt-2 pt-2 border-t border-[#2A2D32]">
                        <p className="text-[10px] font-mono text-[#00FF00] uppercase mb-1">Scaling Goal</p>
                        <p className="text-xs text-[#E0E0E0] leading-relaxed">{scalingChallenge}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-[#2A2D32] bg-[#151619] flex justify-end rounded-b-xl">
                    <button
                      onClick={handleEvaluate}
                      className="px-6 py-2 bg-[#00FF00] text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#00CC00] transition-colors shadow-[0_0_20px_rgba(0,255,0,0.2)]"
                    >
                      Submit for Review
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <aside className="w-[400px]">
          <AIReviewer 
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            isObserving={isObserving}
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

      <AnimatePresence>
        {editingNodeId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1E2126] border border-[#2A2D32] p-6 rounded-xl shadow-2xl w-96"
            >
              <h3 className="text-white font-bold mb-4">Edit Label</h3>
              <input 
                type="text"
                value={editNodeLabel}
                onChange={(e) => setEditNodeLabel(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveNodeLabel();
                  if (e.key === 'Escape') setEditingNodeId(null);
                }}
                className="w-full bg-[#151619] border border-[#2A2D32] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#00FF00] mb-4"
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setEditingNodeId(null)}
                  className="px-4 py-2 text-[#8E9299] hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveNodeLabel}
                  className="px-4 py-2 bg-[#00FF00] text-black font-bold rounded hover:bg-[#00CC00] transition-colors text-sm"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
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
