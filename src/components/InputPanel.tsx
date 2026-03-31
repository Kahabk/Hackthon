import React from 'react';
import { motion } from 'motion/react';

interface InputPanelProps {
  values: any;
  onChange: (name: string, value: any) => void;
  onPredict: () => void;
  loading: boolean;
}

export default function InputPanel({ values, onChange, onPredict, loading }: InputPanelProps) {
  const sliders = [
    { name: 'n', label: 'Nitrogen (N)', min: 0, max: 140 },
    { name: 'p', label: 'Phosphorus (P)', min: 0, max: 140 },
    { name: 'k', label: 'Potassium (K)', min: 0, max: 140 },
    { name: 'ph', label: 'Soil pH', min: 0, max: 14, step: 0.1 },
    { name: 'moist', label: 'Moisture (%)', min: 0, max: 100 },
  ];

  return (
    <div className="glass-card space-y-6">
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Soil Parameters</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {sliders.map((s) => (
          <div key={s.name} className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">{s.label}</span>
              <span className="font-mono text-brand-green">{values[s.name]}</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step || 1}
              value={values[s.name]}
              onChange={(e) => onChange(s.name, parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-green"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-white/50">Target Crop</label>
          <select
            value={values.crop}
            onChange={(e) => onChange('crop', e.target.value)}
            className="w-full glass-input text-sm"
          >
            <option value="Corn">Corn</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Soybean">Soybean</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-white/50">Fertilizer Type</label>
          <select
            value={values.fertilizer}
            onChange={(e) => onChange('fertilizer', e.target.value)}
            className="w-full glass-input text-sm"
          >
            <option value="Urea">Urea</option>
            <option value="DAP">DAP</option>
            <option value="NPK 10-26-26">NPK 10-26-26</option>
            <option value="Organic">Organic</option>
          </select>
        </div>
      </div>

      <button
        onClick={onPredict}
        disabled={loading}
        className="w-full py-4 bg-brand-green hover:bg-brand-green/80 disabled:opacity-50 text-brand-bg font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]"
      >
        {loading ? 'Analyzing Data...' : 'GENERATE AI PREDICTION'}
      </button>
    </div>
  );
}
