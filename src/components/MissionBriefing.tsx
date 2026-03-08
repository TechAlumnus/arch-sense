import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Shield, Target, Users, Zap } from 'lucide-react';

interface MissionBriefingProps {
  onStart: () => void;
}

const MissionBriefing: React.FC<MissionBriefingProps> = ({ onStart }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0D] p-6"
    >
      <div className="w-full max-w-2xl bg-[#151619] border border-[#2A2D32] rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Terminal className="text-[#00FF00]" size={24} />
          <h1 className="text-2xl font-bold text-white tracking-tight">System Design Simulation</h1>
        </div>

        <div className="space-y-6 text-[#E0E0E0]">
          <div>
            <h2 className="text-sm font-mono text-[#4A4D52] uppercase tracking-widest mb-2">Scenario</h2>
            <p className="text-lg font-semibold text-white">Design a Scalable Notification System</p>
          </div>

          <div>
            <h2 className="text-sm font-mono text-[#4A4D52] uppercase tracking-widest mb-2">Context</h2>
            <p className="text-sm leading-relaxed">
              You are the first backend engineer at a fast-growing startup.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-[#1E2126] rounded-lg border border-[#2A2D32]">
                <div className="flex items-center gap-2 text-[#8E9299] mb-1">
                  <Users size={14} />
                  <span className="text-[10px] uppercase font-mono">Current Users</span>
                </div>
                <p className="text-xl font-mono text-white">50,000</p>
              </div>
              <div className="p-3 bg-[#1E2126] rounded-lg border border-[#2A2D32]">
                <div className="flex items-center gap-2 text-[#8E9299] mb-1">
                  <Zap size={14} />
                  <span className="text-[10px] uppercase font-mono">6-Month Projection</span>
                </div>
                <p className="text-xl font-mono text-white">5,000,000</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-mono text-[#4A4D52] uppercase tracking-widest mb-2">Notification Triggers</h2>
            <ul className="text-sm space-y-1 text-[#8E9299]">
              <li>• A message is received</li>
              <li>• A payment succeeds</li>
              <li>• A new follower appears</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-mono text-[#4A4D52] uppercase tracking-widest mb-2">Task</h2>
            <p className="text-sm leading-relaxed">
              Design a system capable of delivering notifications reliably at scale.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-mono text-[#4A4D52] uppercase tracking-widest mb-2">Evaluation Criteria</h2>
            <div className="flex gap-4">
              {['Scalability', 'Reliability', 'Trade-off Awareness', 'Clarity'].map((crit) => (
                <div key={crit} className="flex items-center gap-2 text-xs text-white">
                  <Target size={12} className="text-[#00FF00]" />
                  {crit}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full mt-10 py-4 bg-[#00FF00] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#00CC00] transition-all shadow-[0_0_20px_rgba(0,255,0,0.2)]"
        >
          Start Simulation
        </button>
      </div>
    </motion.div>
  );
};

export default MissionBriefing;
