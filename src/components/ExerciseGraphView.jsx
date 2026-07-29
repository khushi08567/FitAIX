import React, { useState } from 'react';
import { Network, Activity, Zap, AlertTriangle, ShieldCheck, Dumbbell, Info, ArrowRight, CornerDownRight } from 'lucide-react';

export default function ExerciseGraphView({ selectedUser, activeInjury }) {
  const [selectedNode, setSelectedNode] = useState('Bench Press');

  const exerciseNodes = [
    {
      id: 'Bench Press',
      category: 'Compound Chest',
      primaryMuscles: ['Pectoralis Major', 'Anterior Deltoids'],
      secondaryMuscles: ['Triceps Brachii', 'Serratus Anterior'],
      fatigueImpact: 'High Upper Body Push Neural Fatigue',
      contraindications: ['Shoulder Impingement', 'Right Wrist Strain'],
      dependencies: ['Floor Press', 'Incline DB Press'],
      status: activeInjury?.details?.affectedArea === 'wrist' ? 'restricted' : 'optimal'
    },
    {
      id: 'Barbell Back Squat',
      category: 'Compound Quadriceps',
      primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
      secondaryMuscles: ['Adductor Magnus', 'Soleus', 'Erector Spinae'],
      fatigueImpact: 'Very High Axial Lumbar & Systemic Fatigue',
      contraindications: ['Left Knee Tendonitis', 'Lumbar Disc Herniation'],
      dependencies: ['Goblet Squat', 'Leg Press'],
      status: activeInjury?.details?.affectedArea === 'knee' ? 'restricted' : 'optimal'
    },
    {
      id: 'Barbell Deadlift',
      category: 'Posterior Chain',
      primaryMuscles: ['Hamstrings', 'Gluteus Maximus', 'Erector Spinae'],
      secondaryMuscles: ['Latissimus Dorsi', 'Trapezius', 'Forearm Flexors'],
      fatigueImpact: 'Extreme Neural Fatigue & Heavy Spinal Compression',
      contraindications: ['Acute Low Back Pain'],
      dependencies: ['Romanian Deadlift', 'Rack Pulls'],
      status: 'optimal'
    },
    {
      id: 'Pull-Ups',
      category: 'Compound Back',
      primaryMuscles: ['Latissimus Dorsi', 'Teres Major'],
      secondaryMuscles: ['Biceps Brachii', 'Brachialis', 'Rhomboids'],
      fatigueImpact: 'Moderate Upper Body Pull Fatigue',
      contraindications: ['Right Elbow Tendonitis'],
      dependencies: ['Lat Pulldowns', 'Inverted Rows'],
      status: activeInjury?.details?.affectedArea === 'elbow' ? 'restricted' : 'optimal'
    },
    {
      id: 'Overhead Shoulder Press',
      category: 'Vertical Push',
      primaryMuscles: ['Anterior Deltoid', 'Lateral Deltoid'],
      secondaryMuscles: ['Triceps Brachii', 'Upper Trapezius'],
      fatigueImpact: 'High Shoulder Joint Loading',
      contraindications: ['Rotator Cuff Strain', 'Right Wrist Strain'],
      dependencies: ['DB Shoulder Press', 'Landmine Press'],
      status: activeInjury?.details?.affectedArea === 'wrist' ? 'restricted' : 'optimal'
    }
  ];

  const currentNode = exerciseNodes.find(n => n.id === selectedNode) || exerciseNodes[0];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-100">AI Exercise & Dependency Graph</h2>
                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs font-mono rounded-full border border-violet-500/30">
                  Node Graph Engine
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono mt-0.5">
                Graph-thinking architecture connecting exercises, muscle engagement, fatigue propagation, and injury contraindications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Exercise Node Selection list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider px-2">
            Select Exercise Node ({exerciseNodes.length})
          </div>

          <div className="space-y-2">
            {exerciseNodes.map(node => {
              const isSelected = node.id === selectedNode;
              const isRestricted = node.status === 'restricted';

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-violet-500/20 border-violet-500/50 text-slate-100 shadow-md'
                      : isRestricted
                      ? 'bg-rose-500/10 border-rose-500/30 text-slate-300 hover:bg-rose-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isRestricted ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-violet-400'
                    }`}>
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{node.id}</div>
                      <div className="text-xs text-slate-500 font-mono">{node.category}</div>
                    </div>
                  </div>

                  {isRestricted ? (
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-mono rounded-full border border-rose-500/40">
                      Restricted
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded-full border border-emerald-500/30">
                      Optimal
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Graph Propagation & Detailed Node Map */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Node Detail Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase">Inspecting Graph Node</span>
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <span>{currentNode.id}</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded-lg border border-slate-700">
                    {currentNode.category}
                  </span>
                </h3>
              </div>

              {currentNode.status === 'restricted' && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Contraindicated for {selectedUser}'s active injury</span>
                </div>
              )}
            </div>

            {/* Muscle Engagement Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Primary Muscles */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Primary Target Muscles (Direct Load)</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentNode.primaryMuscles.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Secondary Muscles */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono text-teal-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Secondary Synergist Muscles (Synergy Load)</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentNode.secondaryMuscles.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs rounded-lg font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fatigue & Propagation Flow */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-violet-400" />
                <span>Fatigue Propagation & Dependency Chain</span>
              </div>
              <p className="text-slate-300">{currentNode.fatigueImpact}</p>

              <div className="pt-2 flex items-center space-x-2 text-slate-400">
                <span>Direct Substitutes / Fallbacks:</span>
                <div className="flex items-center space-x-2">
                  {currentNode.dependencies.map((dep, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-800 text-violet-300 rounded border border-slate-700">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
