import React from 'react';
import { Thermometer, Droplets, CloudRain } from 'lucide-react';
import { motion } from 'motion/react';

interface WeatherProps {
  data: {
    temp: number;
    humidity: number;
    rainfall: number;
    condition: string;
  };
}

export default function Weather({ data }: WeatherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4 flex flex-col justify-between min-h-[120px]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Current Weather</div>
        <div className="text-[10px] text-white/40">{data.condition}</div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-1">
          <Thermometer className="w-4 h-4 text-brand-yellow" />
          <span className="text-xs font-bold">{data.temp}°</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Droplets className="w-4 h-4 text-brand-blue" />
          <span className="text-xs font-bold">{data.humidity}%</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CloudRain className="w-4 h-4 text-brand-green" />
          <span className="text-xs font-bold">{data.rainfall}mm</span>
        </div>
      </div>
    </motion.div>
  );
}
