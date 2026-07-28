import React from 'react';
import { Target, Flame, Dumbbell, Activity, Trophy, Sun, ShieldCheck } from 'lucide-react';

const GOAL_TYPES = [
  { id: 'muscle_gain', label: 'Hypertrophy & Muscle Gain', description: 'Maximize muscle growth, strength, and physical density.', icon: 'Dumbbell' },
  { id: 'fat_loss', label: 'Fat Loss & Definition', description: 'High metabolic output and caloric deficit management.', icon: 'Flame' },
  { id: 'endurance', label: 'Stamina & Athletic Conditioning', description: 'VO2 max enhancement, stamina, and cardiovascular resilience.', icon: 'Activity' },
  { id: 'strength', label: 'Powerlifting & Maximal Strength', description: 'Heavy compound strength development and maximal loads.', icon: 'Trophy' },
  { id: 'rehab', label: 'Rehabilitation & Longevity', description: 'Post-injury recovery, mobility restoration, and joint health.', icon: 'ShieldCheck' }
];

export function GoalSetting({ currentGoal, onChange }) {
  const icons = { Flame, Dumbbell, Activity, Trophy, Sun, ShieldCheck };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {GOAL_TYPES.map((goal) => {
        const isSel = currentGoal === goal.id;
        const IconComponent = icons[goal.icon] || Target;
        return (
          <button
            type="button"
            key={goal.id}
            onClick={() => onChange(goal.id)}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
              isSel
                ? 'bg-cyan-950/60 border-cyan-500 text-slate-100 shadow-xl ring-1 ring-cyan-500'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <IconComponent className="w-4 h-4" />
              </div>
              {isSel && <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold text-[9px] uppercase">Active Target</span>}
            </div>
            <h4 className="text-sm font-bold text-slate-100">{goal.label}</h4>
            <p className="text-xs text-slate-400 leading-normal">{goal.description}</p>
          </button>
        );
      })}
    </div>
  );
}
