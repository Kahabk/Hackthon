import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, MapPin, Calendar, Activity, Zap, ShieldAlert, PieChart as PieChartIcon, Droplets, Wind } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ReportProps {
  data: any;
  visible: boolean;
}

export default function Report({ data, visible }: ReportProps) {
  if (!data || !data.ai) return null;

  const landData = [
    { name: 'Agriculture', value: data.ai.landClassification.agriculture, color: '#10B981' },
    { name: 'Forest', value: data.ai.landClassification.forest, color: '#059669' },
    { name: 'Water', value: data.ai.landClassification.water, color: '#3B82F6' },
    { name: 'Urban', value: data.ai.landClassification.urban, color: '#64748B' },
    { name: 'Bare Soil', value: data.ai.landClassification.bareSoil, color: '#92400E' },
  ].filter(item => item.value > 0);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card mt-8 border-brand-green/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-white/10 pb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-green/20 rounded-xl">
                <FileText className="w-8 h-8 text-brand-green" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">AgroTwin AI Intelligence Report</h2>
                <p className="text-xs text-white/40 uppercase tracking-widest">Satellite-Driven Agricultural Analysis</p>
              </div>
            </div>
            <div className="text-left md:text-right space-y-1">
              <div className="flex items-center md:justify-end gap-2 text-xs text-white/60 font-mono">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString()}
              </div>
              <div className="flex items-center md:justify-end gap-2 text-xs text-white/60 font-mono">
                <MapPin className="w-3 h-3" />
                {data.location.address}
              </div>
            </div>
          </div>

          {/* Generated Satellite Image */}
          {data.image && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 relative rounded-2xl overflow-hidden border border-white/10 aspect-video group"
            >
              <img 
                src={data.image} 
                alt="AI Generated Satellite View" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="px-3 py-1 rounded-full glass text-[10px] uppercase tracking-widest text-brand-green font-bold">
                  AI Generated Visualization
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Column 1: Land Classification & Predictions */}
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest">
                  <PieChartIcon className="w-4 h-4" />
                  Land Classification (LULC)
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={landData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {landData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {landData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-[10px]">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-white/60">{item.name}:</span>
                      <span className="font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-green text-xs font-bold uppercase tracking-widest">
                  <Activity className="w-4 h-4" />
                  AI Predictions
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Yield Potential', value: data.ai.predictions.yield, color: 'bg-brand-green' },
                    { label: 'Nutrient Efficiency', value: data.ai.predictions.efficiency, color: 'bg-brand-blue' },
                    { label: 'Risk Factor', value: data.ai.predictions.risk, color: 'bg-brand-red' },
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase text-white/40">
                        <span>{stat.label}</span>
                        <span className="font-mono text-white">{stat.value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.value}%` }}
                          className={`h-full ${stat.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Column 2: Soil & Fertilizer Analysis */}
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-yellow text-xs font-bold uppercase tracking-widest">
                  <Droplets className="w-4 h-4" />
                  Soil & Fertilizer Analysis
                </div>
                <div className="space-y-4">
                  <div className="glass p-4 rounded-xl border-l-2 border-brand-yellow">
                    <h4 className="text-[10px] uppercase text-white/40 mb-1">Nutrient Balance</h4>
                    <p className="text-sm text-white/80">{data.ai.soilAnalysis.nutrientBalance}</p>
                  </div>
                  <div className="glass p-4 rounded-xl border-l-2 border-brand-green">
                    <h4 className="text-[10px] uppercase text-white/40 mb-1">Fertilizer Effectiveness</h4>
                    <p className="text-sm text-white/80">{data.ai.soilAnalysis.effectiveness}</p>
                  </div>
                  <div className="glass p-4 rounded-xl border-l-2 border-brand-red">
                    <h4 className="text-[10px] uppercase text-white/40 mb-1">Possible Losses</h4>
                    <p className="text-sm text-white/80">{data.ai.soilAnalysis.losses}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest">
                  <Calendar className="w-4 h-4" />
                  Seasonal Suitability
                </div>
                <div className="glass p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-white/40">Optimal Timing</span>
                    <span className="text-xs font-bold text-brand-green">{data.ai.seasonalSuitability.bestTime}</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{data.ai.seasonalSuitability.reasoning}</p>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[10px] text-white/40 italic">{data.ai.seasonalSuitability.monthlyOutlook}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest">
                  <Wind className="w-4 h-4" />
                  Environmental Impact
                </div>
                <div className="text-sm text-white/70 italic leading-relaxed">
                  {data.ai.explanation.weatherImpact}
                </div>
              </section>
            </div>

            {/* Column 3: Recommendations & Summary */}
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-green text-xs font-bold uppercase tracking-widest">
                  <Zap className="w-4 h-4" />
                  Strategic Recommendations
                </div>
                <div className="space-y-3">
                  {data.ai.recommendations.map((rec: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-3 p-3 glass rounded-xl border border-white/5"
                    >
                      <div className="w-5 h-5 rounded-full bg-brand-green/20 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                      </div>
                      <p className="text-sm text-white/80">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-white/40">Executive Summary</div>
                <div className="bg-brand-blue/10 p-4 rounded-xl border border-brand-blue/20">
                  <p className="text-sm text-brand-blue leading-relaxed">
                    {data.ai.summary}
                  </p>
                </div>
              </section>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="px-6 py-2 rounded-full glass text-[10px] uppercase tracking-[0.2em] text-white/30">
              AgroTwin AI Engine v3.1 • Real-Time Satellite Analysis
            </div>
            <div className="flex gap-4">
              <button className="text-[10px] uppercase tracking-widest text-brand-blue hover:text-brand-blue/80 transition-colors">Export Data</button>
              <button className="text-[10px] uppercase tracking-widest text-brand-green hover:text-brand-green/80 transition-colors">Share Report</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
