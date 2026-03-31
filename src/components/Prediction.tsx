import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface PredictionProps {
  data: {
    yield: number;
    risk: string;
    efficiency: number;
    engine?: string;
  };
}

export default function Prediction({ data }: PredictionProps) {
  const riskColor = 
    data.risk === 'Low' ? 'text-brand-green' : 
    data.risk === 'Medium' ? 'text-brand-yellow' : 'text-brand-red';

  const riskBg = 
    data.risk === 'Low' ? 'bg-brand-green/20' : 
    data.risk === 'Medium' ? 'bg-brand-yellow/20' : 'bg-brand-red/20';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card flex flex-col items-center justify-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-green/5 blur-3xl" />
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/10"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * data.yield) / 100 }}
                className="text-brand-green"
              />
            </svg>
            <span className="absolute text-xl font-bold">{data.yield}%</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/50">Predicted Yield</span>
        </div>

        <div className="space-y-4">
          <div className={`glass-card p-4 flex items-center gap-3 ${riskBg}`}>
            <AlertTriangle className={`w-5 h-5 ${riskColor}`} />
            <div>
              <div className="text-[10px] uppercase text-white/50">Risk Level</div>
              <div className={`font-bold ${riskColor}`}>{data.risk}</div>
            </div>
          </div>

          <div className="glass-card p-4 space-y-2">
            <div className="flex justify-between text-[10px] uppercase text-white/50">
              <span>Efficiency</span>
              <span className="text-brand-blue font-mono">{data.efficiency}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.efficiency}%` }}
                className="h-full bg-brand-blue"
              />
            </div>
          </div>
        </div>
      </div>
      
      {data.engine && (
        <div className="px-4 py-2 glass rounded-lg flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-white/30">AI Engine</span>
          <span className="text-[10px] font-mono text-brand-green">{data.engine}</span>
        </div>
      )}
    </div>
  );
}
