import React from 'react';
import { Evaluation } from '../types';
import { motion } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { Trophy, Target, AlertCircle, RefreshCw } from 'lucide-react';

interface EvaluationViewProps {
  evaluation: Evaluation;
  onRestart: () => void;
}

const EvaluationView: React.FC<EvaluationViewProps> = ({ evaluation, onRestart }) => {
  const data = [
    { subject: 'Scalability', A: evaluation.scalability, fullMark: 100 },
    { subject: 'Reliability', A: evaluation.reliability, fullMark: 100 },
    { subject: 'Clarity', A: evaluation.clarity, fullMark: 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B0D] flex items-center justify-center p-8 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-[#151619] border border-[#2A2D32] rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Side: Score & Chart */}
          <div className="p-12 bg-[#1E2126] border-r border-[#2A2D32] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[#00FF00]/10 rounded-full flex items-center justify-center mb-6">
              <Trophy className="text-[#00FF00]" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Architect Review</h2>
            <p className="text-sm text-[#8E9299] font-mono uppercase tracking-widest mb-8">Session Complete</p>
            
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#2A2D32" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#8E9299', fontSize: 12, fontFamily: 'JetBrains Mono' }} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#00FF00"
                    fill="#00FF00"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full mt-8">
              {data.map((d) => (
                <div key={d.subject} className="text-center">
                  <div className="text-2xl font-bold text-white">{d.A}</div>
                  <div className="text-[10px] text-[#4A4D52] font-mono uppercase">{d.subject}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Feedback Details */}
          <div className="p-12 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#00FF00]">
                <Target size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Executive Summary</h3>
              </div>
              <p className="text-sm text-[#E0E0E0] leading-relaxed italic">
                "{evaluation.feedback}"
              </p>
            </section>

            <div className="grid grid-cols-1 gap-6">
              <section className="space-y-3">
                <h4 className="text-[10px] font-mono text-[#4A4D52] uppercase tracking-widest">Strengths</h4>
                <div className="space-y-2">
                  {evaluation.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#00FF00]">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#00FF00] shrink-0" />
                      <span className="leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-[10px] font-mono text-[#4A4D52] uppercase tracking-widest">Blind Spots</h4>
                <div className="space-y-2">
                  {evaluation.weaknesses.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-400">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{w}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <button
              onClick={onRestart}
              className="w-full py-4 bg-[#2A2D32] text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#3A3D42] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              New Simulation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EvaluationView;
