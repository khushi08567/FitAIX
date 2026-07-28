import React, { useState } from 'react';
import { Calendar, CloudRain, Hotel, Zap, ShieldAlert, CheckCircle2, ArrowRight, Sparkles, Clock, RefreshCw } from 'lucide-react';

export default function SmartCalendarScenarios({ selectedUser, onTriggerStreakProtection }) {
  const [activeScenario, setActiveScenario] = useState('normal'); // normal, travel, rain, busy
  const [selectedDay, setSelectedDay] = useState('Monday');

  const daysOfWeek = [
    { day: 'Mon', full: 'Monday', workout: 'Upper Body Hypertrophy', status: 'completed', duration: '45m' },
    { day: 'Tue', full: 'Tuesday', workout: 'Lower Body Strength (Knee Adapted)', status: 'scheduled', duration: '50m' },
    { day: 'Wed', full: 'Wednesday', workout: 'Active Recovery & Core', status: 'scheduled', duration: '30m' },
    { day: 'Thu', full: 'Thursday', workout: 'Push Volume & Delts', status: 'scheduled', duration: '45m' },
    { day: 'Fri', full: 'Friday', workout: 'Pull Volume & Lats', status: 'scheduled', duration: '45m' },
    { day: 'Sat', full: 'Saturday', workout: 'Zone 2 Cardio Tempo', status: 'scheduled', duration: '40m' },
    { day: 'Sun', full: 'Sunday', workout: 'Rest & Full Recovery', status: 'rest', duration: '0m' }
  ];

  const scenarioWorkouts = {
    normal: { title: "Standard Periodized Plan", desc: "Full gym access with loaded barbells & dumbbells." },
    travel: { title: "Hotel Room Workout (Bodyweight + Band)", desc: "No gym access. Exercises adjusted to 0-equipment high-density tempo movements." },
    rain: { title: "Indoor Home Cardio & Mobility Circuit", desc: "Rainy outdoor weather detected. Outdoor tempo runs converted to indoor Shadow-Boxing & Burpee intervals." },
    busy: { title: "5-Minute Micro-Streak Saver", desc: "User has only 5 minutes. High-efficiency micro-workout to preserve 14-day streak." }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-100">Smart Calendar & Scenario Planner</h2>
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-mono rounded-full border border-cyan-500/30">
                  Dynamic Reschedule
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono mt-0.5">
                Drag or shift workouts across days. Real-time muscle dependency & recovery shift calculation.
              </p>
            </div>
          </div>

          <button
            onClick={onTriggerStreakProtection}
            className="flex items-center space-x-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-md"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Trigger 5-Min Streak Saver</span>
          </button>
        </div>
      </div>

      {/* Scenario Mode Trigger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveScenario('normal')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeScenario === 'normal'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-slate-100 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-mono text-cyan-400 font-semibold">Standard Plan</div>
          <div className="text-sm font-bold mt-1">Full Gym Access</div>
          <div className="text-[11px] text-slate-400 mt-1">Default routine</div>
        </button>

        <button
          onClick={() => setActiveScenario('travel')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeScenario === 'travel'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-slate-100 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-mono text-indigo-400 font-semibold flex items-center gap-1">
            <Hotel className="w-3.5 h-3.5" /> Travel / Hotel
          </div>
          <div className="text-sm font-bold mt-1">No Gym Mode</div>
          <div className="text-[11px] text-slate-400 mt-1">Bodyweight focus</div>
        </button>

        <button
          onClick={() => setActiveScenario('rain')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeScenario === 'rain'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-slate-100 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-mono text-sky-400 font-semibold flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5" /> Weather Shift
          </div>
          <div className="text-sm font-bold mt-1">Rainy Day Swap</div>
          <div className="text-[11px] text-slate-400 mt-1">Indoor cardio</div>
        </button>

        <button
          onClick={() => setActiveScenario('busy')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeScenario === 'busy'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-slate-100 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Busy Day
          </div>
          <div className="text-sm font-bold mt-1">5-Min Streak Saver</div>
          <div className="text-[11px] text-slate-400 mt-1">Micro workout</div>
        </button>
      </div>

      {/* Active Scenario Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase">Active Scenario Mode</span>
          <h3 className="text-base font-bold text-slate-100">{scenarioWorkouts[activeScenario].title}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{scenarioWorkouts[activeScenario].desc}</p>
        </div>
        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono rounded-xl">
          Auto-Recalculating Load
        </span>
      </div>

      {/* Weekly Interactive Calendar Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 font-mono">
          Weekly Schedule & Shift Timeline ({selectedUser})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {daysOfWeek.map((d, i) => (
            <div
              key={i}
              onClick={() => setSelectedDay(d.full)}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                selectedDay === d.full
                  ? 'bg-cyan-500/20 border-cyan-500/50 shadow-md'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="font-bold text-slate-200">{d.day}</span>
                  <span>{d.duration}</span>
                </div>
                <div className="text-xs text-slate-300 font-medium leading-snug line-clamp-2">
                  {activeScenario === 'busy' ? '5-Min Micro Workout' : activeScenario === 'travel' ? 'Hotel Bodyweight' : d.workout}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                {d.status === 'completed' ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="text-slate-500">Scheduled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
