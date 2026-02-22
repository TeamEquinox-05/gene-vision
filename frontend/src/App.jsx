import React, { useState } from 'react';
import { Search, Plus, Minus, Save, Download, Upload, Zap, Activity, Eye, Settings, ChevronRight, Play, Bug } from 'lucide-react';
import './App.css';
import DNAHelix3D from './DNAHelix3D';
import ReconstructionPanel from './ReconstructionPanel';
import EvolutionPanel from './EvolutionPanel';
import DiseaseChatPanel from './DiseaseChatPanel';

// --- Gene Card Component ---
function GeneCard({ gene, onToggle, onRemove, onValueChange }) {
  return (
    <div className="group p-5 relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#00d9ff]/[0.03] to-[#7c3aed]/[0.03] transition-all duration-300 hover:border-[#00d9ff]/30 hover:bg-gradient-to-br hover:from-[#00d9ff]/[0.08] hover:to-[#7c3aed]/[0.08] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,217,255,0.15)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-[#00d9ff] before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-[18px] h-[18px] rounded border-2 border-[#00d9ff]/40 bg-transparent cursor-pointer appearance-none relative transition-all duration-200 checked:bg-gradient-to-br checked:from-[#00d9ff] checked:to-[#00a8cc] checked:border-[#00d9ff] checked:after:content-['✓'] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-black checked:after:text-xs checked:after:font-bold"
              onChange={() => onToggle?.(gene.id)}
            />
          </div>
          <div className="flex-1">
            <div className="text-xs font-mono text-gray-200 mb-1">{gene.name}</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${gene.active ? 'bg-emerald-400' : 'bg-gray-600'}`}></div>
              <span className="text-[10px] text-gray-500">
                {gene.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onRemove?.(gene.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
        >
          <Minus size={14} className="text-red-400" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded border-2 border-white/20" 
            style={{ backgroundColor: gene.color || '#ffffff' }}
          ></div>
          <span className="text-[10px] uppercase text-gray-400 font-medium w-16">{gene.trait}</span>
          <input 
            type="range" 
            min="0"
            max="100"
            defaultValue={gene.value}
            onChange={(e) => onValueChange?.(gene.id, parseInt(e.target.value))}
            className="flex-1 h-1.5 rounded-full bg-white/10 outline-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#00d9ff] [&::-webkit-slider-thumb]:to-[#00a8cc] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,217,255,0.6)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-[0_0_16px_rgba(0,217,255,0.8)] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-[#00d9ff] [&::-moz-range-thumb]:to-[#00a8cc] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(0,217,255,0.6)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:hover:shadow-[0_0_16px_rgba(0,217,255,0.8)]"
          />
          <span className="text-xs text-gray-400 w-8 text-right font-mono">{gene.value}%</span>
        </div>
      </div>
    </div>
  );
}

// --- Main UI Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('Health');
  const [genes, setGenes] = useState([
    { id: 1, name: 'GENE_0012_LIMB_STRUCTURE', trait: 'Length', value: 75, active: true, color: '#00d9ff' },
    { id: 2, name: 'GENE_0034_SKELETAL_DENSITY', trait: 'Density', value: 62, active: true, color: '#7c3aed' },
    { id: 3, name: 'GENE_0056_MUSCLE_FIBER', trait: 'Strength', value: 88, active: true, color: '#10b981' },
    { id: 4, name: 'GENE_0078_NEURAL_PATHWAY', trait: 'Response', value: 45, active: false, color: '#f59e0b' },
    { id: 5, name: 'GENE_0091_METABOLIC_RATE', trait: 'Energy', value: 70, active: true, color: '#ef4444' },
  ]);

  const tabs = [
    { name: 'Design', icon: Settings },
    { name: 'Health', icon: Activity },
    { name: 'Evolution', icon: Zap },
    { name: 'Reconstruction', icon: Eye },
    { name: 'Disease Chat', icon: Bug },
  ];

  const handleGeneValueChange = (id, value) => {
    setGenes(genes.map(g => g.id === id ? { ...g, value } : g));
  };

  const handleRemoveGene = (id) => {
    setGenes(genes.filter(g => g.id !== id));
  };

  const handleToggleGene = (id) => {
    setGenes(genes.map(g => g.id === id ? { ...g, active: !g.active } : g));
  };

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden" style={{
      background: 'radial-gradient(1200px 800px at 20% 15%, rgba(0, 217, 255, 0.08), transparent 55%), radial-gradient(1000px 700px at 80% 25%, rgba(124, 58, 237, 0.08), transparent 55%), radial-gradient(1100px 900px at 50% 90%, rgba(16, 185, 129, 0.05), transparent 60%), linear-gradient(165deg, #030508 0%, #050a12 35%, #020406 100%)'
    }}>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 217, 255, 0.08) 0.8px, transparent 1px), radial-gradient(circle at 2px 2px, rgba(124, 58, 237, 0.06) 0.6px, transparent 1px)',
        backgroundSize: '50px 50px, 80px 80px'
      }}></div>
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 217, 255, 0.03) 50%, transparent 100%)'
      }}></div>
      {/* Enhanced Header */}
      <header className="relative z-10 flex items-center justify-between px-10 py-5 bg-[#080c14]/85 backdrop-blur-xl border-b border-[#00d9ff]/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-8">
          <nav className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.name} 
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 bg-transparent border border-transparent rounded-lg text-xs font-semibold uppercase tracking-widest cursor-pointer transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#00d9ff]/10 before:to-[#7c3aed]/10 before:opacity-0 before:transition-opacity before:duration-300 hover:text-[#00d9ff] hover:border-[#00d9ff]/30 hover:before:opacity-100 ${
                    activeTab === tab.name 
                      ? 'text-[#00d9ff] border-[#00d9ff]/50 bg-[#00d9ff]/[0.08] before:opacity-100' 
                      : 'text-gray-500'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] text-gray-400 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]/30 hover:text-[#00d9ff] hover:-translate-y-0.5">
            <Upload size={16} />
          </button>
          <button className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] text-gray-400 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]/30 hover:text-[#00d9ff] hover:-translate-y-0.5">
            <Download size={16} />
          </button>
          <button className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] text-gray-400 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]/30 hover:text-[#00d9ff] hover:-translate-y-0.5">
            <Save size={16} />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-[#00d9ff] to-[#00a8cc] border-0 rounded-lg text-black text-[0.8rem] font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(0,217,255,0.3)] relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,217,255,0.5)] hover:before:opacity-100">
            <Play size={14} />
            <span>Run Simulation</span>
          </button>
        </div>
      </header>

      <div className="relative z-[1] flex flex-1 overflow-hidden">
        {/* Reconstruction Tab - Full Width */}
        {activeTab === 'Reconstruction' ? (
          <ReconstructionPanel />
        ) : activeTab === 'Evolution' ? (
          <EvolutionPanel />
        ) : activeTab === 'Disease Chat' ? (
          <DiseaseChatPanel />
        ) : (
          <>
        {/* Left Panel: DNA & Gene Controls */}
        <div className="w-[45%] flex flex-col p-8 gap-6 overflow-y-auto border-r border-white/5">
          {/* DNA Visualization */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-gray-200 text-sm font-semibold uppercase tracking-widest">DNA Sequence</h3>
              <div className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-[0.625rem] font-semibold uppercase tracking-wider animate-pulse">Live</div>
            </div>
            <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-black/40 to-[#00d9ff]/[0.05] border border-[#00d9ff]/15 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <DNAHelix3D />
            </div>
          </div>

          {/* Gene Search */}
          <div className="relative flex items-center gap-4">
            <Search size={18} className="absolute left-5 text-gray-500 pointer-events-none" />
            <input 
              type="text"
              className="flex-1 py-3.5 px-5 pl-12 bg-white/[0.03] border border-[#00d9ff]/20 rounded-xl text-gray-200 text-sm outline-none transition-all duration-300 placeholder:text-gray-500 focus:bg-[#00d9ff]/[0.05] focus:border-[#00d9ff]/50 focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
              placeholder="Search gene sequences..."
            />
            <button className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00d9ff]/20 to-[#7c3aed]/20 border border-[#00d9ff]/30 text-[#00d9ff] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gradient-to-br hover:from-[#00d9ff]/30 hover:to-[#7c3aed]/30 hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,217,255,0.3)]">
              <Plus size={16} />
            </button>
          </div>

          {/* Timeline Controls */}
          <div className="flex items-center gap-3 p-4 bg-black/30 border border-white/5 rounded-xl overflow-x-auto">
            <button className="px-4 py-2 bg-gradient-to-br from-[#00d9ff]/20 to-[#7c3aed]/20 border border-[#00d9ff]/50 rounded-lg text-[#00d9ff] text-xs font-medium uppercase tracking-wider cursor-pointer transition-all duration-200 whitespace-nowrap">
              <span>Current</span>
            </button>
            <ChevronRight size={14} className="text-gray-600" />
            <button className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-400 text-xs font-medium uppercase tracking-wider cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]/30 hover:text-[#00d9ff]">Gen 1</button>
            <ChevronRight size={14} className="text-gray-600" />
            <button className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-400 text-xs font-medium uppercase tracking-wider cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]/30 hover:text-[#00d9ff]">Gen 2</button>
            <ChevronRight size={14} className="text-gray-600" />
            <button className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-400 text-xs font-medium uppercase tracking-wider cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]/30 hover:text-[#00d9ff]">Gen 5</button>
          </div>
        </div>

        {/* Right Panel: Species Visualization */}
        <div className="flex-1 flex flex-col p-8 gap-6 bg-gradient-to-br from-black/20 to-[#00d9ff]/[0.03]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-light tracking-[0.15em] bg-gradient-to-br from-[#00d9ff] to-[#7c3aed] bg-clip-text text-transparent mb-2">Species Morphology</h2>
              <p className="text-gray-400 text-sm font-normal tracking-wider">Real-time 3D reconstruction</p>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col gap-1 px-5 py-3 bg-[#00d9ff]/[0.05] border border-[#00d9ff]/20 rounded-xl">
                <span className="text-gray-500 text-[0.625rem] font-semibold uppercase tracking-widest">Accuracy</span>
                <span className="text-[#00d9ff] text-xl font-bold font-mono">94.2%</span>
              </div>
              <div className="flex flex-col gap-1 px-5 py-3 bg-[#00d9ff]/[0.05] border border-[#00d9ff]/20 rounded-xl">
                <span className="text-gray-500 text-[0.625rem] font-semibold uppercase tracking-widest">Confidence</span>
                <span className="text-[#00d9ff] text-xl font-bold font-mono">High</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative rounded-2xl bg-gradient-to-br from-black/50 to-[#00d9ff]/[0.05] border border-[#00d9ff]/15 overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/60 to-[#00d9ff]/[0.03]">
            </div>
            
            {/* Overlay Controls */}
            <div className="absolute top-6 left-6 flex gap-3 z-10">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-black/60 backdrop-blur-md border border-[#00d9ff]/30 rounded-lg text-[#00d9ff] text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-[#00d9ff]/15 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,217,255,0.3)]">
                <Activity size={16} />
                <span>Health Scan</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button className="flex items-center gap-3 px-10 py-4 bg-gradient-to-br from-[#00d9ff] to-[#00a8cc] border-0 rounded-xl text-black text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 shadow-[0_8px_32px_rgba(0,217,255,0.4)] relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-transparent before:-translate-x-full before:transition-transform before:duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,217,255,0.6)] hover:before:translate-x-full">
              <Zap size={18} />
              <span>Generate Visualization</span>
            </button>
            <p className="text-gray-500 text-xs text-center">
              Based on {genes.filter(g => g.active).length} active gene sequences
            </p>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}