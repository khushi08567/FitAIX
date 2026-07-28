import React, { useState } from 'react';
import { GitCommit, GitBranch, RotateCcw, Eye, ArrowRight, ShieldCheck, Dumbbell, Sparkles, Check, ChevronRight, Layers, FileDiff } from 'lucide-react';

export default function WorkoutVersionControl({ selectedUser, onRollback }) {
  const [selectedV1, setSelectedV1] = useState('v1');
  const [selectedV2, setSelectedV2] = useState('v3');
  const [rollbackSuccess, setRollbackSuccess] = useState(false);

  // Version database mock per user
  const versionHistory = [
    {
      version: 'v3',
      title: 'v3.0 - AI Injury Adaptation',
      timestamp: '2026-07-28 08:30 AM',
      author: 'FitAI Engine (v2.4)',
      summary: 'Replaced Barbell Back Squats with Leg Press & increased core volume.',
      reason: 'Left knee tendonitis reported yesterday (Pain score 6/10). Recovery score 48%.',
      diffCount: { added: 2, removed: 1, modified: 2 },
      exercises: [
        { name: 'Leg Press', sets: 4, reps: '12-15', weight: '140kg', status: 'added' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', weight: '80kg', status: 'unmodified' },
        { name: 'Bulgarian Split Squats (Bodyweight)', sets: 3, reps: '12/leg', weight: 'BW', status: 'modified' },
        { name: 'Seated Calf Raises', sets: 4, reps: '15', weight: '45kg', status: 'added' },
        { name: 'Hanging Knee Raises', sets: 3, reps: '15', weight: 'BW', status: 'unmodified' }
      ]
    },
    {
      version: 'v2',
      title: 'v2.0 - Progressive Overload Volume Bump',
      timestamp: '2026-07-21 07:00 AM',
      author: 'FitAI Engine (v2.3)',
      summary: 'Increased squat volume by +1 set and bumped Romanian Deadlift load +5kg.',
      reason: 'User achieved 100% adherence over 14 days and recovery score was 88%.',
      diffCount: { added: 1, removed: 0, modified: 2 },
      exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: '8-10', weight: '100kg', status: 'modified' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', weight: '80kg', status: 'modified' },
        { name: 'Walking Lunges', sets: 3, reps: '12/leg', weight: '20kg DBs', status: 'unmodified' },
        { name: 'Hanging Knee Raises', sets: 3, reps: '15', weight: 'BW', status: 'added' }
      ]
    },
    {
      version: 'v1',
      title: 'v1.0 - Initial Baseline Plan',
      timestamp: '2026-07-14 06:00 AM',
      author: 'Baseline Prompt Generator',
      summary: 'Initial hyper-personalized baseline workout created from user onboarding goal.',
      reason: 'User onboarded with goal: Marathon Preparation & Core Strength.',
      diffCount: { added: 3, removed: 0, modified: 0 },
      exercises: [
        { name: 'Barbell Back Squat', sets: 3, reps: '10', weight: '90kg', status: 'unmodified' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', weight: '75kg', status: 'unmodified' },
        { name: 'Walking Lunges', sets: 3, reps: '12/leg', weight: '20kg DBs', status: 'unmodified' }
      ]
    }
  ];

  const getVerData = (ver) => versionHistory.find(v => v.version === ver) || versionHistory[0];
  const v1Data = getVerData(selectedV1);
  const v2Data = getVerData(selectedV2);

  const handleRollback = (ver) => {
    onRollback(ver);
    setRollbackSuccess(true);
    setTimeout(() => setRollbackSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-100">Workout Version Control</h2>
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-xs font-mono rounded-full border border-teal-500/30">
                  Immutable Commit Graph
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono mt-0.5">
                Every generated workout is revisioned like Git code commits. View diffs & rollback safely.
              </p>
            </div>
          </div>

          {rollbackSuccess && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-mono animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Rolled back to {selectedV1}! Today's workout updated.</span>
            </div>
          )}
        </div>
      </div>

      {/* Version Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Version A Dropdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="text-xs font-mono text-slate-400 block mb-2">Base Version (v1)</label>
          <select
            value={selectedV1}
            onChange={(e) => setSelectedV1(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-teal-500"
          >
            {versionHistory.map(v => (
              <option key={v.version} value={v.version}>{v.title} ({v.timestamp})</option>
            ))}
          </select>
        </div>

        {/* Version B Dropdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="text-xs font-mono text-slate-400 block mb-2">Target Version (v2)</label>
          <select
            value={selectedV2}
            onChange={(e) => setSelectedV2(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-teal-500"
          >
            {versionHistory.map(v => (
              <option key={v.version} value={v.version}>{v.title} ({v.timestamp})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-By-Side Git Diff Inspection Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-2">
            <FileDiff className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-slate-200">
              Diff Comparison: <span className="text-teal-400 font-mono">{v1Data.version}</span> vs <span className="text-emerald-400 font-mono">{v2Data.version}</span>
            </h3>
          </div>

          <button
            onClick={() => handleRollback(v1Data.version)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-slate-700 hover:border-teal-500/40 rounded-lg text-xs font-mono transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rollback Active Workout to {v1Data.version}</span>
          </button>
        </div>

        {/* Side by side diff grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Version A Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-200 font-mono">{v1Data.title}</span>
              <span className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md font-mono">{v1Data.author}</span>
            </div>
            <p className="text-xs text-slate-400 font-sans">{v1Data.summary}</p>
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
              <span className="text-slate-500 block text-[10px] mb-0.5">AI Commit Rationale:</span>
              {v1Data.reason}
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Exercise Roster</div>
              {v1Data.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs font-mono">
                  <span className="text-slate-200 font-medium">{ex.name}</span>
                  <span className="text-slate-400">{ex.sets} sets × {ex.reps} @ {ex.weight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Version B Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-teal-300 font-mono">{v2Data.title}</span>
              <span className="text-[11px] px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-md font-mono border border-teal-500/30">{v2Data.author}</span>
            </div>
            <p className="text-xs text-slate-400 font-sans">{v2Data.summary}</p>
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-teal-300/90 font-mono">
              <span className="text-slate-500 block text-[10px] mb-0.5">AI Commit Rationale:</span>
              {v2Data.reason}
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Exercise Roster</span>
                <span className="text-[10px] text-teal-400">
                  +{v2Data.diffCount.added} Added • {v2Data.diffCount.modified} Modified
                </span>
              </div>
              {v2Data.exercises.map((ex, idx) => {
                let badgeClass = "border-slate-800 text-slate-300";
                if (ex.status === 'added') badgeClass = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
                if (ex.status === 'modified') badgeClass = "border-amber-500/40 bg-amber-500/10 text-amber-300";
                return (
                  <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono ${badgeClass}`}>
                    <div className="flex items-center space-x-2">
                      {ex.status === 'added' && <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 rounded text-[9px]">NEW</span>}
                      {ex.status === 'modified' && <span className="px-1.5 py-0.2 bg-amber-500/30 text-amber-300 rounded text-[9px]">DIFF</span>}
                      <span className="font-medium">{ex.name}</span>
                    </div>
                    <span className="opacity-90">{ex.sets} sets × {ex.reps} @ {ex.weight}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Commit History Timeline Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 font-mono mb-4 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-teal-400" />
          <span>Full Version Commit Graph (Chronological)</span>
        </h3>

        <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {versionHistory.map((ver) => (
            <div key={ver.version} className="relative pl-10 group">
              <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-teal-400 group-hover:bg-teal-400 transition-colors" />
              
              <div className="bg-slate-950/60 border border-slate-800/80 hover:border-teal-500/40 rounded-xl p-4 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-teal-300">{ver.version}</span>
                    <span className="text-xs font-semibold text-slate-200">{ver.title}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{ver.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-sans">{ver.summary}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Author: {ver.author}</span>
                  <button
                    onClick={() => handleRollback(ver.version)}
                    className="text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Rollback</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
