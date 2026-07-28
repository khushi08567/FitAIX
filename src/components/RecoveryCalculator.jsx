import React, { useState } from 'react';
import { HeartPulse, Sliders, Activity, AlertTriangle, ShieldCheck, Zap, Thermometer, Moon, Droplets, Smile, Dumbbell } from 'lucide-react';

export default function RecoveryCalculator({ selectedUser, currentScore, onUpdateRecovery }) {
  const [sleepHours, setSleepHours] = useState(7.5);
  const [hydrationLiters, setHydrationLiters] = useState(2.8);
  const [stressLevel, setStressLevel] = useState(4); // 1-10
  const [sorenessLevel, setSorenessLevel] = useState(3); // 1-10
  const [restingHR, setRestingHR] = useState(58); // bpm

  // Dynamic formula calculation
  const computedScore = Math.round(
    Math.min(100, Math.max(10, 
      (sleepHours / 9) * 45 + 
      (hydrationLiters / 3.5) * 20 + 
      ((10 - stressLevel) / 10) * 15 + 
      ((10 - sorenessLevel) / 10) * 15 + 
      ((75 - restingHR) / 35) * 5
    ))
  );

  const fatigueRisk = computedScore < 50 ? 'HIGH' : computedScore < 75 ? 'MODERATE' : 'LOW';

  const getRecommendation = () => {
    if (computedScore < 50) return 'AI recommends deload / light mobility walk. High fatigue detected.';
    if (computedScore < 75) return 'AI recommends moderate intensity. Avoid 1RM heavy power movements.';
    return 'Full recovery confirmed! Ready for progressive overload and maximal volume.';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-100">AI Recovery & Fatigue Calculator</h2>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs font-mono rounded-full border border-rose-500/30">
                  Biometric Engine
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono mt-0.5">
                Adjust daily biometric sliders to predict live recovery score % and fatigue risk in real time.
              </p>
            </div>
          </div>

          <button
            onClick={() => onUpdateRecovery(computedScore)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold rounded-xl text-xs font-mono shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            Apply {computedScore}% to {selectedUser} Profile
          </button>
        </div>
      </div>

      {/* Main Grid: Sliders on Left, Live Score Gauge on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Interactive Sliders */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-semibold text-slate-200 font-mono flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Biometric Input Parameters</span>
          </h3>

          {/* Sleep Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep Duration
              </span>
              <span className="text-indigo-400 font-bold">{sleepHours} Hours</span>
            </div>
            <input
              type="range"
              min="3"
              max="11"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Hydration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Daily Hydration
              </span>
              <span className="text-cyan-400 font-bold">{hydrationLiters} Liters</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={hydrationLiters}
              onChange={(e) => setHydrationLiters(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Stress Level Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-400" /> Subjective Stress (1 = Low, 10 = Severe)
              </span>
              <span className="text-amber-400 font-bold">Level {stressLevel} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Soreness Level Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" /> Muscle Soreness Rating (1-10)
              </span>
              <span className="text-rose-400 font-bold">Level {sorenessLevel} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={sorenessLevel}
              onChange={(e) => setSorenessLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>

          {/* Resting Heart Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" /> Resting Heart Rate (bpm)
              </span>
              <span className="text-emerald-400 font-bold">{restingHR} BPM</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              step="1"
              value={restingHR}
              onChange={(e) => setRestingHR(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Right Side: Live Calculated Score Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 text-center">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Calculated Recovery Score</span>
            <div className="relative inline-flex items-center justify-center mt-4">
              <div className="text-5xl font-black text-slate-100 font-mono tracking-tight">
                {computedScore}%
              </div>
            </div>

            <div className="mt-3">
              <span className={`px-3 py-1 text-xs font-mono rounded-full border ${
                computedScore >= 75
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : computedScore >= 50
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                Fatigue Risk: {fatigueRisk}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-left text-xs font-mono space-y-2">
            <div className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Workout Workload Recommendation</span>
            </div>
            <p className="text-slate-300 font-sans">{getRecommendation()}</p>
          </div>
        </div>

      </div>

    </div>
  );
}
