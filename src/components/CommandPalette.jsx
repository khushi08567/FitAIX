import React, { useState, useEffect } from 'react';
import { Search, Dumbbell, GitCommit, Network, Calendar, HeartPulse, Utensils, Clock, ShieldAlert, Sparkles, X } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onSelectTab, onTriggerAction }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectTab('command-open');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectTab]);

  if (!isOpen) return null;

  const commands = [
    { id: 'nav-dash', title: 'Go to Dashboard', category: 'Navigation', icon: Clock, action: () => { onSelectTab('dashboard'); onClose(); } },
    { id: 'nav-studio', title: 'Open Adaptive Workout Studio', category: 'Navigation', icon: Dumbbell, action: () => { onSelectTab('studio'); onClose(); } },
    { id: 'nav-vcs', title: 'Open Workout Version Control', category: 'Navigation', icon: GitCommit, action: () => { onSelectTab('vcs'); onClose(); } },
    { id: 'nav-graph', title: 'View Exercise & Dependency Graph', category: 'Navigation', icon: Network, action: () => { onSelectTab('graph'); onClose(); } },
    { id: 'nav-calendar', title: 'Open Smart Calendar & Scenarios', category: 'Navigation', icon: Calendar, action: () => { onSelectTab('calendar'); onClose(); } },
    { id: 'nav-recovery', title: 'AI Recovery & Fatigue Calculator', category: 'Navigation', icon: HeartPulse, action: () => { onSelectTab('recovery'); onClose(); } },
    { id: 'nav-meals', title: 'Meal Planner & Grocery Budget', category: 'Navigation', icon: Utensils, action: () => { onSelectTab('meals'); onClose(); } },
    { id: 'nav-timeline', title: 'View AI Memory Timeline', category: 'Navigation', icon: Clock, action: () => { onSelectTab('timeline'); onClose(); } },
    { id: 'act-sim-20', title: 'Simulate 20-Min Home Workout', category: 'Quick Action', icon: Sparkles, action: () => { onTriggerAction('sim-20-home'); onClose(); } },
    { id: 'act-streak', title: 'Activate 5-Min Streak Saver', category: 'Quick Action', icon: ShieldAlert, action: () => { onTriggerAction('streak-saver'); onClose(); } },
  ];

  const filtered = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-md transition-all">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-teal-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command, search workouts, or jump to tab... (ESC to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none font-mono"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-teal-500/10 hover:border hover:border-teal-500/30 group transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-teal-500/20 text-teal-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-teal-300">
                        {cmd.title}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {cmd.category}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 font-mono group-hover:text-teal-400">
                    Jump ↵
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-500 text-sm font-mono">
              No matching commands found for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Navigation: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Ctrl+K</kbd></span>
          <span>FitAI X Command Palette v1.0</span>
        </div>
      </div>
    </div>
  );
}
