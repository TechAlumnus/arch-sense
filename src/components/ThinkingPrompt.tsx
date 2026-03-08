import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, ArrowRight } from 'lucide-react';

interface ThinkingPromptProps {
  onContinue: (challenge: string) => void;
}

const ThinkingPrompt: React.FC<ThinkingPromptProps> = ({ onContinue }) => {
  const [challenge, setChallenge] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0D] p-6"
    >
      <div className="w-full max-w-xl bg-[#151619] border border-[#2A2D32] rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="text-[#00FF00]" size={24} />
          <h2 className="text-xl font-bold text-white">Pre-Design Analysis</h2>
        </div>

        <p className="text-[#E0E0E0] mb-6 leading-relaxed">
          Before designing the system, what do you think is the biggest scaling challenge in this scenario?
        </p>

        <textarea
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          placeholder="e.g., handling traffic spikes, preventing notification duplication..."
          className="w-full h-32 bg-[#1E2126] border border-[#2A2D32] rounded-lg p-4 text-white placeholder-[#4A4D52] focus:border-[#00FF00] focus:outline-none resize-none"
        />

        <button
          onClick={() => challenge.trim() && onContinue(challenge)}
          disabled={!challenge.trim()}
          className="w-full mt-6 py-3 bg-[#00FF00] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#00CC00] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Proceed to Canvas <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default ThinkingPrompt;
