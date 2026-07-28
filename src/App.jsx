import React, { useState, useEffect, useMemo } from 'react';
import { usersDatabase } from './mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { 
  EyeOff, Eye, AlertTriangle, Award, Calendar, Search, Trash2, Edit2, 
  CheckCircle2, Moon, Sun, PlusCircle, Brain, RefreshCw, ChevronDown, 
  ChevronUp, Heart, Dumbbell, Zap, Target, Sparkles, Check, X, ShieldAlert,
  Layers, User, GitCommit, Network, HeartPulse, Utensils, Sliders, Play, RotateCcw, Clock
} from 'lucide-react';

import CommandPalette from './components/CommandPalette';
import AICoachDrawer from './components/AICoachDrawer';
import WorkoutVersionControl from './components/WorkoutVersionControl';
import ExerciseGraphView from './components/ExerciseGraphView';
import RecoveryCalculator from './components/RecoveryCalculator';
import MealGroceryPlanner from './components/MealGroceryPlanner';
import SmartCalendarScenarios from './components/SmartCalendarScenarios';

const USER_AVATARS = {
  "Sarah Jenkins": "🏃‍♀️",
  "Marcus Chen": "🏋️‍♂️",
  "Elena Rostova": "🥗",
  "David Kim": "🧘‍♂️",
  "Aisha Bello": "💪"
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState("Sarah Jenkins");
  const [userData, setUserData] = useState(usersDatabase);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // UI Drawers & Modals
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Workout Studio Simulation States
  const [simDuration, setSimDuration] = useState('45'); // 20, 30, 45
  const [simLocation, setSimLocation] = useState('gym'); // gym, home

  // Dynamic user data handles
  const activeUser = userData[selectedUser];
  const entries = activeUser.entries;
  const derivedScoresState = activeUser.scores;
  const recoveryHistory = activeUser.recoveryHistory;
  const consistencyData = activeUser.consistencyData;

  const activeGoal = useMemo(() => {
    const goalEvent = entries.slice().reverse().find(e => e.type === 'GOAL_CHANGED' && e.visibility !== 'user-hidden');
    return goalEvent ? goalEvent.details.newGoal : activeUser.goal;
  }, [entries, activeUser]);

  const activeInjury = useMemo(() => {
    return entries.find(e => e.type === "INJURY_REPORTED" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
  }, [entries]);

  // Timeline Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [inferredOnly, setInferredOnly] = useState(false);
  const [userConfirmedOnly, setUserConfirmedOnly] = useState(false);

  // Chat Histories
  const [coachChatHistories, setCoachChatHistories] = useState({
    "Sarah Jenkins": [
      { id: "msg-1", sender: "coach", text: "Hi Sarah! I'm Rachel, your AI coach. Yesterday's sleep drop (4.5 hrs) was low, so I proactively shifted Monday's leg volume to protect your left knee. Ready for today's daily briefing?", time: "9:00 AM" }
    ],
    "Marcus Chen": [
      { id: "msg-1", sender: "coach", text: "Hello Marcus! Rachel here. Yesterday was huge: you locked in that 200kg Deadlift PR! Your neural recovery is at 74% from the fatigue. We'll monitor wrist strain today.", time: "9:00 AM" }
    ],
    "Elena Rostova": [
      { id: "msg-1", sender: "coach", text: "Hi Elena! Outstanding progress on your fat loss trend (-1.2kg). I detected a late evening calorie pattern; I suggest shifting your afternoon snack. Want a weekly recap?", time: "9:00 AM" }
    ],
    "David Kim": [
      { id: "msg-1", sender: "coach", text: "Hi David! I'm tracking your knee mobility rehab. Swelling was reported, so heavy squats are bypassed. Recovery is up at 88%. Ready for mobility?", time: "9:00 AM" }
    ],
    "Aisha Bello": [
      { id: "msg-1", sender: "coach", text: "Good day Aisha! Rachel here. Great job on the pull-up volume milestone (+5 reps). We'll keep elbow tendonitis loading light today.", time: "9:00 AM" }
    ]
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  const handleSendMessage = (text) => {
    const userMsg = { id: Date.now(), sender: "user", text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setCoachChatHistories(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), userMsg]
    }));

    setTimeout(() => {
      const aiReply = {
        id: Date.now() + 1,
        sender: "coach",
        text: `Got it! Based on ${selectedUser}'s active data (${activeUser.recovery}% recovery), I've adjusted your workload parameters in real time.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCoachChatHistories(prev => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), aiReply]
      }));
    }, 1000);
  };

  const handleCommandTabSelect = (tabKey) => {
    if (tabKey === 'command-open') setIsCommandOpen(true);
    else setActiveTab(tabKey);
  };

  const handleQuickAction = (actionKey) => {
    if (actionKey === 'sim-20-home') {
      setActiveTab('studio');
      setSimDuration('20');
      setSimLocation('home');
    } else if (actionKey === 'streak-saver') {
      setActiveTab('calendar');
    }
  };

  const filteredTimelineEntries = useMemo(() => {
    return entries.filter(e => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSummary = e.summary.toLowerCase().includes(query);
        const matchesTags = e.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSummary && !matchesTags) return false;
      }
      if (selectedTypes.length > 0 && !selectedTypes.includes(e.type)) return false;
      if (inferredOnly && e.source !== 'inferred') return false;
      if (userConfirmedOnly && e.source !== 'user') return false;
      return true;
    });
  }, [entries, searchQuery, selectedTypes, inferredOnly, userConfirmedOnly]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950 pb-16">
      
      {/* Top Header Controls Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-xl px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-black text-xl tracking-tighter">
            F
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100 font-mono tracking-tight">FitAI X</h1>
              <span className="px-2 py-0.2 bg-teal-500/20 text-teal-300 text-[10px] font-mono rounded-full border border-teal-500/30">
                v2.4 Production
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Adaptive Fitness Ecosystem</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-mono transition-all cursor-pointer"
            >
              <span>{USER_AVATARS[selectedUser]}</span>
              <span className="font-semibold text-slate-200">{selectedUser}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-mono text-slate-500 px-2 py-1 uppercase">Switch User Persona</div>
                {Object.keys(usersDatabase).map(uName => (
                  <button
                    key={uName}
                    onClick={() => {
                      setSelectedUser(uName);
                      setIsUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
                      selectedUser === uName ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{USER_AVATARS[uName]}</span>
                      <span>{uName}</span>
                    </span>
                    {selectedUser === uName && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-mono text-slate-300 transition-all cursor-pointer"
            title="Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Ctrl+K</span>
          </button>

          <button
            onClick={() => setIsCoachOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold rounded-xl text-xs font-mono shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Coach (Rachel)</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 px-4 lg:px-8 py-2 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Target },
            { id: 'studio', label: 'Adaptive Workout Studio', icon: Dumbbell },
            { id: 'vcs', label: 'Workout Version Control', icon: GitCommit },
            { id: 'graph', label: 'AI Exercise Graph', icon: Network },
            { id: 'calendar', label: 'Smart Calendar & Scenarios', icon: Calendar },
            { id: 'recovery', label: 'AI Recovery Calculator', icon: HeartPulse },
            { id: 'meals', label: 'Meal & Grocery Budget', icon: Utensils },
            { id: 'timeline', label: 'AI Memory & Analytics', icon: Clock }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Recovery Score</span>
                  <HeartPulse className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-emerald-400">{activeUser.recovery}%</div>
                <div className="text-xs text-slate-400 font-mono">Optimal capacity • Sleep: 7.5 hrs</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Active Goal</span>
                  <Target className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-sm font-bold text-slate-100 truncate">{activeGoal}</div>
                <div className="text-xs text-teal-400 font-mono">Full AI plan recalculation active</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Streak Protection</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-300">14 Days Active</div>
                <button onClick={() => handleQuickAction('streak-saver')} className="text-[11px] text-amber-400 hover:underline font-mono cursor-pointer">
                  Trigger 5-min micro workout ➔
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Injury Guardrail</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-sm font-bold text-slate-100">{activeInjury ? activeInjury.summary : 'No active injuries'}</div>
                <div className="text-xs text-slate-400 font-mono">{activeInjury ? 'Safety swaps enforced' : '100% load clearance'}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Dumbbell className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-slate-100 text-lg">Today's Best Workout ({selectedUser})</h3>
                </div>
                <button onClick={() => setActiveTab('studio')} className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-mono transition-all cursor-pointer">
                  Launch Simulator Studio ➔
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs font-mono text-slate-400">Primary Exercise 1</div>
                  <div className="font-bold text-slate-200">{activeInjury?.details?.affectedArea === 'knee' ? 'Leg Press (Knee Safe)' : 'Barbell Back Squats'}</div>
                  <div className="text-xs font-mono text-teal-400">4 sets × 10-12 reps</div>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs font-mono text-slate-400">Primary Exercise 2</div>
                  <div className="font-bold text-slate-200">Romanian Deadlift</div>
                  <div className="text-xs font-mono text-teal-400">3 sets × 10 reps</div>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs font-mono text-slate-400">Core & Recovery</div>
                  <div className="font-bold text-slate-200">Hanging Knee Raises</div>
                  <div className="text-xs font-mono text-teal-400">3 sets × 15 reps</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'studio' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    <span>Workout Simulator Studio</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Instantly simulate duration & location. AI regenerates exercise parameters without breaking periodization.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-slate-800 p-1 rounded-xl flex space-x-1 text-xs font-mono">
                    {['20', '30', '45'].map(d => (
                      <button key={d} onClick={() => setSimDuration(d)} className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${simDuration === d ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                        {d}m
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-800 p-1 rounded-xl flex space-x-1 text-xs font-mono">
                    {[{ id: 'gym', label: '🏋️ Gym' }, { id: 'home', label: '🏠 Home' }].map(l => (
                      <button key={l.id} onClick={() => setSimLocation(l.id)} className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${simLocation === l.id ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeInjury && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs font-mono text-amber-300">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Conflict Warning Active: {activeInjury.summary}. Contraindicated exercises automatically replaced.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
                Simulated Plan ({simDuration} mins • {simLocation.toUpperCase()})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: simLocation === 'home' ? 'Bodyweight Bulgarian Split Squats' : (activeInjury?.details?.affectedArea === 'knee' ? 'Leg Press Machine' : 'Barbell Back Squat'), sets: simDuration === '20' ? 2 : 4, reps: '12-15', rest: '60s', note: activeInjury?.details?.affectedArea === 'knee' ? 'Substituted to protect left knee tendonitis' : 'Optimal progressive overload' },
                  { name: simLocation === 'home' ? 'Dumbbell Romanian Deadlifts' : 'Barbell Romanian Deadlift', sets: 3, reps: '10', rest: '90s', note: 'Posterior chain focus' },
                  { name: 'Hanging Knee Raises / Plank', sets: 3, reps: '15', rest: '45s', note: 'Core stability' }
                ].map((ex, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-sm">{ex.name}</span>
                      <span className="text-xs font-mono text-teal-400">{ex.sets} sets × {ex.reps}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">Rest: {ex.rest}</div>
                    <div className="text-[11px] text-teal-300/80 font-mono p-2 bg-slate-950 rounded-lg border border-slate-800">💡 {ex.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vcs' && (
          <WorkoutVersionControl selectedUser={selectedUser} onRollback={(ver) => console.log('Rolled back to', ver)} />
        )}

        {activeTab === 'graph' && (
          <ExerciseGraphView selectedUser={selectedUser} activeInjury={activeInjury} />
        )}

        {activeTab === 'calendar' && (
          <SmartCalendarScenarios selectedUser={selectedUser} onTriggerStreakProtection={() => alert("5-Minute Streak Protection Micro-Workout Triggered!")} />
        )}

        {activeTab === 'recovery' && (
          <RecoveryCalculator selectedUser={selectedUser} currentScore={activeUser.recovery} onUpdateRecovery={(score) => {
            setUserData(prev => ({ ...prev, [selectedUser]: { ...prev[selectedUser], recovery: score } }));
            alert(`Updated recovery score for ${selectedUser} to ${score}%!`);
          }} />
        )}

        {activeTab === 'meals' && (
          <MealGroceryPlanner selectedUser={selectedUser} />
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input type="text" placeholder="Search memory nodes or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 font-mono focus:outline-none focus:border-teal-500" />
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" checked={inferredOnly} onChange={(e) => setInferredOnly(e.target.checked)} className="accent-teal-500" />
                    <span>AI Inferred Only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTimelineEntries.map(entry => (
                <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 bg-teal-500/10 text-teal-300 rounded border border-teal-500/30">{entry.type}</span>
                    <span className="text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">{entry.summary}</h4>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {entry.tags && entry.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded font-mono">#{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onSelectTab={handleCommandTabSelect} onTriggerAction={handleQuickAction} />
      <AICoachDrawer isOpen={isCoachOpen} onClose={() => setIsCoachOpen(false)} selectedUser={selectedUser} chatHistory={coachChatHistories[selectedUser] || []} onSendMessage={handleSendMessage} activeInjury={activeInjury} recoveryScore={activeUser.recovery} />
    </div>
  );
}
