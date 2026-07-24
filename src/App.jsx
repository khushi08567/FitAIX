import React, { useState, useEffect, useMemo } from 'react';
import { usersDatabase } from './mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { 
  EyeOff, Eye, AlertTriangle, Award, Calendar, Search, Trash2, Edit2, 
  CheckCircle2, Moon, Sun, PlusCircle, Brain, RefreshCw, ChevronDown, 
  ChevronUp, Heart, Dumbbell, Zap, Target, Sparkles, Check, X, ShieldAlert,
  Layers, User
} from 'lucide-react';

// Color token helpers
const COLORS = {
  gold: { dark: '#E8C77E', light: '#B8862A' },
  teal: { dark: '#5FE3C9', light: '#1FA98D' },
  lime: { dark: '#BEF264', light: '#5E9A26' },
  amber: { dark: '#FBBF77', light: '#C97D1E' },
  rose: { dark: '#FF8FA0', light: '#D94F66' },
  violet: { dark: '#B79CF7', light: '#8B6FDB' },
  textDim: { dark: '#8B96A3', light: '#6B7178' },
  bgCard: { dark: '#0A0F16', light: '#FFFFFF' }
};

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
  const [userFilter, setUserFilter] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Retrieve current user data pointers
  const activeUser = userData[selectedUser];
  const entries = activeUser.entries;
  const derivedScoresState = activeUser.scores;
  const nodeExplanationNotes = activeUser.explanationNotes;
  const recoveryHistory = activeUser.recoveryHistory;
  const consistencyData = activeUser.consistencyData;

  const activeGoal = useMemo(() => {
    const goalEvent = entries.slice().reverse().find(e => e.type === 'GOAL_CHANGED' && e.visibility !== 'user-hidden');
    return goalEvent ? goalEvent.details.newGoal : "Body Recomposition";
  }, [entries]);

  const activeInjury = useMemo(() => {
    return entries.find(e => e.type === "INJURY_REPORTED" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
  }, [entries]);

  // Custom proxy updater for entries to work with usersDatabase state map
  const setEntries = (updater) => {
    setUserData(prev => {
      const currentUserData = prev[selectedUser];
      const nextEntries = typeof updater === 'function' ? updater(currentUserData.entries) : updater;
      
      // Dynamic score adjustment based on active injury presence
      let nextScores = [...currentUserData.scores];
      const hasActiveInjury = nextEntries.some(e => e.type === "INJURY_REPORTED" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
      
      if (!hasActiveInjury) {
        nextScores = nextScores.map(s => s.id === 'score-injury' ? { ...s, value: 20, trend: 'improving' } : s);
      } else {
        nextScores = nextScores.map(s => s.id === 'score-injury' ? { ...s, value: 65, trend: 'watch' } : s);
      }

      return {
        ...prev,
        [selectedUser]: {
          ...currentUserData,
          entries: nextEntries,
          scores: nextScores
        }
      };
    });
  };

  // Custom proxy updater for derivedScoresState
  const setDerivedScoresState = (updater) => {
    setUserData(prev => {
      const currentUserData = prev[selectedUser];
      const nextScores = typeof updater === 'function' ? updater(currentUserData.scores) : updater;
      return {
        ...prev,
        [selectedUser]: {
          ...currentUserData,
          scores: nextScores
        }
      };
    });
  };
  
  // Timeline Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [inferredOnly, setInferredOnly] = useState(false);
  const [userConfirmedOnly, setUserConfirmedOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // UI States
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [editForm, setEditForm] = useState({ summary: '', tags: '', visibility: 'used-for-planning' });
  const [liveSignals, setLiveSignals] = useState([
    { time: "10:45 AM", text: "AI scanned new activity logs; streak status validated." },
    { time: "09:30 AM", text: "PostgreSQL database synced user memory payload mem-11." },
    { time: "08:15 AM", text: "Context engine refreshed planning parameters for active goal." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  // AI Coach (Rachel) States
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachVoice, setCoachVoice] = useState('calm'); // calm, energetic, robotic
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [coachInputText, setCoachInputText] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [coachFollowUpState, setCoachFollowUpState] = useState(null); // stores context for follow up questions
  const [hoveredNode, setHoveredNode] = useState(null);

  // Persisted chat history per user
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

  // Toggle Theme Class on Body
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

  // Derived calculations are now retrieved dynamically from the active user's profile state.

  // Color mapping based on status/trend
  const getScoreColor = (trend, val) => {
    const isLight = theme === 'light';
    if (trend === 'improving') return isLight ? COLORS.teal.light : COLORS.teal.dark;
    if (trend === 'stable' || val > 80) return isLight ? COLORS.lime.light : COLORS.lime.dark;
    if (trend === 'watch' || val > 50) return isLight ? COLORS.amber.light : COLORS.amber.dark;
    return isLight ? COLORS.rose.light : COLORS.rose.dark;
  };

  const getScoreStatusBadge = (trend) => {
    if (trend === 'improving') return 'improving';
    if (trend === 'stable') return 'on track';
    if (trend === 'watch') return 'watch';
    return 'at risk';
  };

  const getStatusBadgeColor = (status) => {
    if (status === 'improving') return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    if (status === 'on track') return 'bg-lime-500/10 text-lime-400 border-lime-500/30';
    if (status === 'watch') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  // Timeline filters computation
  const filteredTimelineEntries = useMemo(() => {
    return entries.filter(e => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSummary = e.summary.toLowerCase().includes(query);
        const matchesTags = e.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSummary && !matchesTags) return false;
      }
      
      // 2. Entry Types (Multi-select)
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(e.type)) return false;
      }

      // 3. Date range
      if (dateFrom) {
        const f = new Date(dateFrom);
        if (new Date(e.timestamp) < f) return false;
      }
      if (dateTo) {
        const t = new Date(dateTo);
        if (new Date(e.timestamp) > t) return false;
      }

      // 4. Inferred / Confirmed Toggles
      if (inferredOnly && e.source !== 'inferred') return false;
      if (userConfirmedOnly && e.source !== 'user') return false;

      return true;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [entries, searchQuery, selectedTypes, dateFrom, dateTo, inferredOnly, userConfirmedOnly]);

  // Group entries by month for timeline view
  const groupedEntriesByMonth = useMemo(() => {
    const groups = {};
    filteredTimelineEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(entry);
    });
    return groups;
  }, [filteredTimelineEntries]);

  // 70 Random star background coordinates
  const starCoords = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 75; i++) {
      stars.push({
        x: Math.floor(Math.random() * 400),
        y: Math.floor(Math.random() * 400),
        r: Math.random() * 1.2 + 0.4,
        twinkle: i % 7 === 0
      });
    }
    return stars;
  }, []);

  // Handler: Edit Entry Modal opener
  const handleEditClick = (entry) => {
    setEditEntry(entry);
    setEditForm({
      summary: entry.summary,
      tags: entry.tags.join(', '),
      visibility: entry.visibility
    });
  };

  // Handler: Save Edited Entry
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editEntry) return;

    setEntries(prev => prev.map(entry => {
      if (entry.id === editEntry.id) {
        return {
          ...entry,
          summary: editForm.summary,
          tags: editForm.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
          visibility: editForm.visibility
        };
      }
      return entry;
    }));

    // Log live signal feed
    addLiveSignal(`User updated memory payload ${editEntry.id} settings.`);
    setEditEntry(null);
  };

  // Handler: Toggle visibility (Hide from AI)
  const handleToggleHideFromAI = (id) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const nextVisibility = entry.visibility === 'user-hidden' ? 'used-for-planning' : 'user-hidden';
        addLiveSignal(`Memory ${id} planning visibility set to: ${nextVisibility}.`);
        return { ...entry, visibility: nextVisibility };
      }
      return entry;
    }));
  };

  // Handler: Mark Resolved (For Injuries)
  const handleMarkResolved = (id) => {
    setEntries(prev => {
      const target = prev.find(e => e.id === id);
      if (!target || target.type !== 'INJURY_REPORTED') return prev;

      // Add a resolution marker and update original status
      const updated = prev.map(entry => {
        if (entry.id === id) {
          return {
            ...entry,
            details: {
              ...entry.details,
              status: "resolved",
              resolvedAt: new Date().toISOString()
            },
            status: "achieved" // changes derived timeline status
          };
        }
        return entry;
      });

      // Insert resolution event record into database
      const resolutionId = `mem-res-${Date.now()}`;
      const resolutionEntry = {
        id: resolutionId,
        userId: target.userId,
        timestamp: new Date().toISOString(),
        type: "PLAN_ADJUSTMENT_REASON",
        summary: `Injury Resolution: Left ${target.details.affectedArea} recovered`,
        details: {
          resolvedEntryId: target.id,
          resolutionAction: `Safety constraint lifted for ${target.details.affectedArea}. Full load patterns restored.`
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["recovery-log", `${target.details.affectedArea}-resolved`]
      };

      addLiveSignal(`Injury ${id} marked as resolved. Created constraint release log ${resolutionId}.`);
      return [...updated, resolutionEntry];
    });
  };

  // Handler: Correct Inference flow
  const handleCorrectInference = (id) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        addLiveSignal(`User corrected AI inference ${id}. Source changed to user-confirmed.`);
        return {
          ...entry,
          source: 'user',
          confidence: 1.0
        };
      }
      return entry;
    }));
  };

  const addLiveSignal = (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLiveSignals(prev => [{ time, text }, ...prev].slice(0, 10));
  };

  // Chat Simulator matching logic
  const handleProcessChat = () => {
    const text = chatInput.trim();
    if (!text) return;

    setIsProcessingChat(true);
    setChatInput('');

    // Simulate database write lag
    setTimeout(() => {
      const lower = text.toLowerCase();
      let newEvent = null;

      if (lower.includes('back') || lower.includes('spine') || lower.includes('strain')) {
        // Injury event
        newEvent = {
          id: `mem-${Date.now()}`,
          userId: "fit-user-01",
          timestamp: new Date().toISOString(),
          type: "INJURY_REPORTED",
          summary: "Lower Back Strain reported via Chat",
          details: {
            affectedArea: "lower-back",
            laterality: "center",
            symptom: text,
            severity: "high",
            status: "active",
            restrictedMovements: ["deadlift", "back-squat", "bent-over-rows"]
          },
          source: "user",
          confidence: 1.0,
          visibility: "used-for-planning",
          tags: ["lumbar-sprain", "chat-logged"]
        };
      } else if (lower.includes('goal') || lower.includes('marathon') || lower.includes('run')) {
        // Goal changed
        newEvent = {
          id: `mem-${Date.now()}`,
          userId: "fit-user-01",
          timestamp: new Date().toISOString(),
          type: "GOAL_CHANGED",
          summary: "Goal changed: Marathon Prep (Aerobic Conditioning)",
          details: {
            previousGoal: "Body Recomposition",
            newGoal: "Marathon Cardio Base",
            targetValue: "10k Aerobic Endurance",
            timeframeWeeks: 12
          },
          source: "user",
          confidence: 1.0,
          visibility: "used-for-planning",
          tags: ["endurance", "run-habit"]
        };
      } else {
        // Default milestone
        newEvent = {
          id: `mem-${Date.now()}`,
          userId: "fit-user-01",
          timestamp: new Date().toISOString(),
          type: "MILESTONE_ACHIEVED",
          summary: `Milestone Logged: ${text}`,
          details: {
            metric: "User Input Log",
            value: text
          },
          source: "user",
          confidence: 1.0,
          visibility: "used-for-planning",
          tags: ["milestone-chat"]
        };
      }

      setEntries(prev => [...prev, newEvent]);
      addLiveSignal(`Extracted new timeline entry ${newEvent.id} from user chat input.`);
      setIsProcessingChat(false);
    }, 1200);
  };

  // ==========================================
  // 🎙️ RACHEL — AI COACH INTERACTIVE ACTIONS
  // ==========================================

  // Text-To-Speech (TTS) engine utilizing native Web Speech Synthesis API
  const speakText = (text) => {
    if (!window.speechSynthesis || isMuted) return;
    
    // Stop any active speech (Interrupt-to-stop)
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurable voice personality selectors
    if (coachVoice === 'energetic') {
      utterance.pitch = 1.15;
      utterance.rate = 1.1;
    } else if (coachVoice === 'calm') {
      utterance.pitch = 0.95;
      utterance.rate = 0.85;
    } else {
      // robotic
      utterance.pitch = 0.55;
      utterance.rate = 0.95;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Stop speech synthesis immediately (Interrupt-to-stop)
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speech-to-Text (STT) utilizing native webkitSpeechRecognition API
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback simulated dictation typing effect
      setIsListening(true);
      stopSpeaking();
      setTimeout(() => {
        setCoachInputText("My knee feels a bit sore today during leg press");
        setIsListening(false);
        addLiveSignal("STT Fallback: Voice transcribed mock input.");
      }, 1500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      stopSpeaking();
      addLiveSignal("Microphone active: listening to user voice input...");
    };

    recognition.onresult = (event) => {
      const speechToTextResult = event.results[0][0].transcript;
      setCoachInputText(speechToTextResult);
      addLiveSignal(`STT: Voice recognized: "${speechToTextResult}"`);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Parse user text message and respond contextually, mutating state directly
  const getResponseAndExecuteActions = (userText) => {
    const lower = userText.toLowerCase();
    let replyText = "";

    // Find body parts in text
    const getBodyPart = (text) => {
      if (text.includes("knee")) return "knee";
      if (text.includes("wrist")) return "wrist";
      if (text.includes("elbow")) return "elbow";
      if (text.includes("shoulder")) return "shoulder";
      if (text.includes("ankle")) return "ankle";
      if (text.includes("back") || text.includes("spine")) return "lower-back";
      return null;
    };

    const getSide = (text) => {
      if (text.includes("left")) return "left";
      if (text.includes("right")) return "right";
      return null;
    };

    const activeInjuries = entries.filter(e => e.type === "INJURY_REPORTED" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
    const part = getBodyPart(lower);
    const side = getSide(lower);

    // Intent 1: Resolve Injury
    const isResolveIntent = lower.includes("remove") || lower.includes("resolve") || lower.includes("clear") || lower.includes("heal") || lower.includes("better") || lower.includes("fine") || lower.includes("resolved") || lower.includes("no pain") || lower.includes("okay now");

    if (isResolveIntent && (lower.includes("injury") || lower.includes("pain") || lower.includes("soreness") || lower.includes("sprain") || part)) {
      const targetPart = part || (activeInjuries.length === 1 ? activeInjuries[0].details.affectedArea : null);
      
      if (!targetPart) {
        if (activeInjuries.length === 0) {
          replyText = "I couldn't find any active injuries in your profile to resolve.";
        } else {
          replyText = "Which active injury would you like me to resolve? (e.g. knee, wrist, shoulder)";
        }
      } else {
        const matchingInjuries = activeInjuries.filter(e => e.details.affectedArea === targetPart);
        
        if (matchingInjuries.length === 0) {
          replyText = `I couldn't find an active ${targetPart.toUpperCase()} injury in your current profile.`;
        } else {
          const isMultipleExplicit = lower.includes("multiple") || lower.includes("all") || lower.includes("every") || lower.includes("duplicate") || lower.includes("times");
          
          if (matchingInjuries.length > 1 && !isMultipleExplicit && !side) {
            // Ambiguity: multiple matching entries, ask for clarification
            const options = matchingInjuries.map(e => {
              const l = e.details.laterality && e.details.laterality !== 'none' ? `${e.details.laterality} ` : '';
              return `${l}${e.details.affectedArea}`;
            }).join(" and ");
            replyText = `You have multiple active ${targetPart.toUpperCase()} injuries (${options}). Which specific one would you like me to mark as resolved, or should I clear all of them?`;
          } else {
            // Unambiguous or user explicitly said to resolve multiple or user specified the side
            let targetsToResolve = [];
            if (isMultipleExplicit) {
              targetsToResolve = matchingInjuries;
            } else if (side) {
              targetsToResolve = matchingInjuries.filter(e => e.details.laterality === side);
            } else {
              // Exactly one active matching injury, or we just resolve the first one
              targetsToResolve = [matchingInjuries[0]];
            }

            if (targetsToResolve.length === 0) {
              replyText = `I couldn't find an active ${side ? side.toUpperCase() + ' ' : ''}${targetPart.toUpperCase()} injury in your profile.`;
            } else {
              const targetIds = targetsToResolve.map(t => t.id);
              setEntries(prev => prev.map(e => targetIds.includes(e.id) ? { ...e, details: { ...e.details, status: "resolved" } } : e));
              
              if (targetsToResolve.length > 1) {
                replyText = `Got it — I've marked all active ${targetPart.toUpperCase()} injuries as resolved as of today. They'll stay in your timeline as history, just no longer active.`;
                addLiveSignal(`Rachel resolved all active ${targetPart} injuries.`);
              } else {
                const target = targetsToResolve[0];
                const sidePrefix = target.details.laterality && target.details.laterality !== 'none' ? `${target.details.laterality} ` : '';
                replyText = `Got it — I've marked your active ${sidePrefix.toUpperCase()}${targetPart.toUpperCase()} injury as resolved as of today. It'll stay in your timeline as history, just no longer active.`;
                addLiveSignal(`Rachel resolved active ${sidePrefix}${targetPart} injury.`);
              }
            }
          }
        }
      }
    }
    
    // 2. Log New Symptom / Injury Action
    else if (lower.includes("hurt") || lower.includes("pain") || lower.includes("sore") || lower.includes("sprain") || lower.includes("injury") || lower.includes("symptom")) {
      const targetPart = part;
      if (targetPart) {
        const targetSide = side || "left"; // Default to left if not specified
        const newEntry = {
          id: `coach-logged-${Date.now()}`,
          userId: selectedUser.toLowerCase().replace(/ /g, '-'),
          timestamp: new Date().toISOString(),
          type: "INJURY_REPORTED",
          summary: `${targetPart.charAt(0).toUpperCase() + targetPart.slice(1)} Pain logged via Coach Chat`,
          details: { 
            affectedArea: targetPart, 
            laterality: targetSide, 
            status: "active", 
            severity: "MEDIUM", 
            symptom: userText,
            restrictedMovements: targetPart === "knee" ? ["heavy-squats", "running"] : targetPart === "wrist" ? ["heavy-presses"] : []
          },
          source: "user",
          confidence: 1.0,
          visibility: "used-for-planning",
          tags: ["injury-reported", targetPart, "coach-log"]
        };
        setEntries(prev => [...prev, newEntry]);
        replyText = `Got it — I've logged a new active ${targetSide.toUpperCase()} ${targetPart.toUpperCase()} injury entry as of today. We'll adjust your recovery trend scores and implement safety load limits immediately.`;
        addLiveSignal(`Rachel logged injury entry: active ${targetSide} ${targetPart} soreness.`);
      } else {
        replyText = `I heard that you are experiencing discomfort, but I didn't catch the body part. Could you clarify where the pain or symptom is located?`;
      }
    }

    // 3. Switch Goal Action
    else if (lower.includes("goal") && (lower.includes("switch") || lower.includes("change") || lower.includes("set") || lower.includes("to"))) {
      let newGoal = "";
      if (lower.includes("marathon")) newGoal = "Marathon Preparation & Core Strength";
      else if (lower.includes("strength") || lower.includes("powerlifting")) newGoal = "Powerlifting Max Strength";
      else if (lower.includes("fat") || lower.includes("loss") || lower.includes("endurance")) newGoal = "Fat Loss & Endurance";
      else if (lower.includes("muscle") || lower.includes("gain") || lower.includes("hypertrophy")) newGoal = "Upper Body Hypertrophy & Muscle Gain";
      else if (lower.includes("mobility") || lower.includes("health")) newGoal = "General Health & Knee Mobility";
      
      if (newGoal) {
        const newEntry = {
          id: `coach-logged-${Date.now()}`,
          userId: selectedUser.toLowerCase().replace(/ /g, '-'),
          timestamp: new Date().toISOString(),
          type: "GOAL_CHANGED",
          summary: `Goal Switched to ${newGoal}`,
          details: { previousGoal: activeGoal, newGoal: newGoal, reason: userText },
          source: "user",
          confidence: 1.0,
          visibility: "used-for-planning",
          tags: ["goal-change", newGoal.toLowerCase().replace(/ /g, '-')]
        };
        setEntries(prev => [...prev, newEntry]);
        replyText = `Got it — I have successfully switched your goal to "${newGoal}" on your memory timeline. All calculations and scheduling parameters will update to support this.`;
        addLiveSignal(`Rachel switched goal to: ${newGoal}`);
      } else {
        replyText = `I couldn't match that to one of our target goals (Marathon, Powerlifting, Fat Loss, Muscle Gain, or Mobility). Which goal would you like to set?`;
      }
    }

    // 4. Missed Workout / Skips Follow-up Response
    else if (coachFollowUpState === 'ask-skipped-reason') {
      setCoachFollowUpState(null);
      if (lower.includes('pain') || lower.includes('knee') || lower.includes('hurt') || lower.includes('wrist') || lower.includes('elbow') || lower.includes('sore')) {
        replyText = `Understood. I have logged that constraint in your memory timeline logs. We'll adjust your recovery trend scores and implement safety load limits immediately. Let's make sure we stay within safe bounds today.`;
        const constraintEntry = {
          id: `coach-logged-${Date.now()}`,
          userId: selectedUser.toLowerCase().replace(/ /g, '-'),
          timestamp: new Date().toISOString(),
          type: "CONSTRAINT_CHANGED",
          summary: "Missed session due to joint soreness",
          details: { factor: "soreness", restrictedIntensity: "high-impact", status: "active", severity: "MEDIUM" },
          source: "user",
          confidence: 1.0,
          visibility: "used-for-planning",
          tags: ["workout-missed", "pain-constraint"]
        };
        setEntries(prev => [...prev, constraintEntry]);
        addLiveSignal(`Rachel logged constraint: missed session due to joint soreness.`);
      } else {
        replyText = `Got it. I've logged this as deficit-fatigue constraint. I'll automatically adjust your consistency indexes. I think this matches your weekend pattern, correct me if I'm wrong!`;
        const constraintEntry = {
          id: `coach-logged-${Date.now()}`,
          userId: selectedUser.toLowerCase().replace(/ /g, '-'),
          timestamp: new Date().toISOString(),
          type: "CONSTRAINT_CHANGED",
          summary: "Missed session due to sleep/fatigue",
          details: { factor: "fatigue", restrictedIntensity: "low", status: "active", severity: "LOW" },
          source: "user",
          confidence: 1.0,
          visibility: "used-for-planning",
          tags: ["workout-missed", "fatigue"]
        };
        setEntries(prev => [...prev, constraintEntry]);
        addLiveSignal(`Rachel logged constraint: missed session due to fatigue.`);
      }
    }

    // 5. Daily Briefing Request
    else if (lower.includes('briefing') || lower.includes('yesterday') || lower.includes('today')) {
      if (selectedUser === 'Sarah Jenkins') {
        replyText = "Here's how yesterday went: Your sleep was low (4.5 hrs) due to Sunday prep stress, so I proactively shifted Monday's leg volume to protect your left knee. Your recovery score is stable at 82%. Ready to tackle our low-impact run today?";
      } else if (selectedUser === 'Marcus Chen') {
        replyText = "Yesterday was massive! You achieved your 200kg Deadlift PR! Adherence is at 92%, but recovery is down to 74% from heavy neural fatigue. I recommend board or floor presses today to shield your wrist.";
      } else if (selectedUser === 'Elena Rostova') {
        replyText = "Excellent progress last week—you hit your fat loss milestone (-1.2kg). However, I detected a pattern of late evening meals past 9 PM. Let's advance your afternoon snack to prevent cravings.";
      } else if (selectedUser === 'David Kim') {
        replyText = "We monitored your knee rehab. Swelling was reported, so heavy squats are bypassed. Recovery is up at 88% due to active mobility compliance. Ready for mobility drills today?";
      } else {
        replyText = "Good morning Aisha! Great job on pull-ups (+5 reps). We are managing elbow tendonitis, so dumbbell curls are restricted. Adherence is strong at 89%. Let's keep upper body volume moderate today.";
      }
    }

    // 6. Exercise Explainer / Why adjustments?
    else if (lower.includes('why') || lower.includes('explain') || lower.includes('changed') || lower.includes('adjusted')) {
      if (selectedUser === 'Sarah Jenkins') {
        replyText = "I moved leg volume because of the left knee tendonitis you reported on July 9, combined with Sunday's sleep deprivation. Let's prevent training under high injury risk.";
      } else if (selectedUser === 'Marcus Chen') {
        replyText = "I substituted bench press with floor press because of your active Right Wrist Strain reported on July 17. Floor presses limit wrist extension under load.";
      } else if (selectedUser === 'Elena Rostova') {
        replyText = "I switched your HIIT circuit to LISS recovery walks because of the high fatigue logs on July 15. This maintains calorie expenditure without overload.";
      } else if (selectedUser === 'David Kim') {
        replyText = "I bypassed barbell squats to protect your left knee sprain flare-up reported on July 14. We want to avoid deep knee flexion until swelling resolves.";
      } else {
        replyText = "I switched barbell rows to chest-supported rows to lower your lumbar loading parameters because of the right elbow tendonitis flare-up on July 16.";
      }
    }

    // 7. Short Workout / Plan simulator trigger
    else if (lower.includes('15 minutes') || lower.includes('15 min') || lower.includes('short') || lower.includes('no time') || lower.includes('busy')) {
      replyText = "Got it! I will trigger a plan regeneration to fit a 15-minute window today. Calling workout simulator... Done! I've regenerated a 15-minute mobility and core stabilization routine.";
      const planEntry = {
        id: `coach-logged-${Date.now()}`,
        userId: selectedUser.toLowerCase().replace(/ /g, '-'),
        timestamp: new Date().toISOString(),
        type: "PLAN_ADJUSTMENT_REASON",
        summary: "Regenerated 15-Minute Workout due to time constraint",
        details: { durationMinutes: 15, scalingReason: "User reported busy time constraint", actionTaken: "Scale barbell work to quick mobility routine" },
        source: "AI",
        confidence: 0.95,
        visibility: "used-for-planning",
        tags: ["plan-adapt", "time-limit"]
      };
      setEntries(prev => [...prev, planEntry]);
      addLiveSignal(`Rachel triggered simulator: scaled plan to 15 mins due to busy time constraints.`);
    }

    // 8. Correct Inferences
    else if (lower.includes('travel') || lower.includes('vacation') || lower.includes('business') || lower.includes('work trip')) {
      const inferredPattern = entries.find(e => e.type === "HABIT_PATTERN_DETECTED" && e.source === 'inferred');
      if (inferredPattern) {
        handleCorrectInference(inferredPattern.id);
        replyText = `My apologies! I have corrected my inference regarding your misses. I've updated the memory entry ${inferredPattern.id} to USER CONFIRMED and marked it as a travel constraint instead of a routine skipping habit.`;
      } else {
        replyText = "Logged. I will record travel as a planning constraint in your timeline logs to prevent unnecessary workout adherence drop calculations.";
      }
    }

    // 9. Missed Workout / Skips
    else if (lower.includes('skipped') || lower.includes('missed') || lower.includes('did not') || lower.includes('no workout')) {
      replyText = "I see you missed a session. To log this correctly in your planning memory, was it due to joint pain or was it just fatigue?";
      setCoachFollowUpState('ask-skipped-reason');
    }

    // Default Fallback
    else {
      replyText = `I hear you! As Rachel, your AI coach, I'm here to analyze your training logs. I think you're making steady progress, but correct me if I'm wrong! Note: I provide supportive advice based on your timeline context, but I am not a licensed trainer or medical professional.`;
    }

    return replyText;
  };

  const handleCoachInputSubmit = (e) => {
    if (e) e.preventDefault();
    const userText = coachInputText.trim();
    if (!userText) return;

    setCoachInputText('');
    stopSpeaking();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: `msg-${Date.now()}`, sender: "user", text: userText, time: timestamp };
    
    setCoachChatHistories(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), userMsg]
    }));

    setIsCoachThinking(true);

    setTimeout(() => {
      const replyText = getResponseAndExecuteActions(userText);

      const coachReplyMsg = { 
        id: `msg-${Date.now()}`, 
        sender: "coach", 
        text: replyText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };

      setCoachChatHistories(prev => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), coachReplyMsg]
      }));

      setIsCoachThinking(false);
      speakText(replyText);
    }, 1500);
  };

  // Handle Quick Reply chips click
  const handleQuickReplyClick = (label, text) => {
    stopSpeaking();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: `msg-${Date.now()}`, sender: "user", text: text, time: timestamp };
    
    setCoachChatHistories(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), userMsg]
    }));
    
    setIsCoachThinking(true);
    
    setTimeout(() => {
      const replyText = getResponseAndExecuteActions(text);
      
      const coachReplyMsg = { 
        id: `msg-${Date.now()}`, 
        sender: "coach", 
        text: replyText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };

      setCoachChatHistories(h => ({
        ...h,
        [selectedUser]: [...(h[selectedUser] || []), coachReplyMsg]
      }));

      setIsCoachThinking(false);
      speakText(replyText);
    }, 1500);

    setCoachInputText('');
  };

  // Recharts custom values over time for Recovery Line Chart
  const recoveryLineChartData = useMemo(() => {
    return recoveryHistory.map(h => {
      const isInjured = entries.some(e => e.type === "INJURY_REPORTED" && e.details.status !== "resolved" && e.visibility !== "user-hidden" && e.details.affectedArea === activeUser.injuredArea);
      return {
        ...h,
        injury: isInjured && h.label ? h.label : false
      };
    });
  }, [recoveryHistory, entries, activeUser]);

  // GitHub style 84 days adherence heatmap matrix
  const heatmapData = useMemo(() => {
    const matrix = [];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Check if ankle sprain is active (April 30 onwards)
    const isAnkleInjured = entries.some(e => e.type === "INJURY_REPORTED" && e.details.affectedArea === "ankle" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
    
    // Generate 12 weeks of cells
    for (let row = 0; row < 7; row++) {
      const dayName = weekdays[row];
      const cells = [];
      
      for (let col = 0; col < 12; col++) {
        // Base value: weekends lower, week higher
        let baseVal = 70;
        if (row === 4) baseVal = 40; // Friday drop pattern
        if (row === 5 || row === 6) baseVal = 20; // Weekends off
        
        // Add random variance
        let compliance = baseVal + Math.floor(Math.random() * 20);
        
        // If ankle is injured, decrease workout completion in last 3 weeks (cols 9, 10, 11)
        if (isAnkleInjured && col >= 9) {
          compliance = Math.max(10, compliance - 40);
        }

        cells.push({ col, compliance });
      }
      matrix.push({ dayName, cells });
    }
    return matrix;
  }, [entries]);

  // Stepper Goals
  const stepperGoals = useMemo(() => {
    const goalsList = [];
    const goalEvents = entries.filter(e => e.type === 'GOAL_CHANGED' && e.visibility !== 'user-hidden');
    
    goalEvents.forEach((e, idx) => {
      let status = "achieved";
      if (e.details.newGoal.includes("10k") || e.details.newGoal.includes("Marathon")) {
        // If ankle sprain exists, mark it as aborted/unachieved
        const hasSprain = entries.some(entry => entry.type === "INJURY_REPORTED" && entry.details.status !== "resolved" && new Date(entry.timestamp) > new Date(e.timestamp));
        status = hasSprain ? "unachieved" : "active";
      } else if (idx === goalEvents.length - 1) {
        status = "active";
      }
      
      goalsList.push({
        id: e.id,
        name: e.details.newGoal,
        date: new Date(e.timestamp).toLocaleDateString([], { month: 'short', year: '2-digit' }),
        status
      });
    });
    return goalsList;
  }, [entries]);
  const graphNodes = useMemo(() => {
    const recoveryScore = derivedScoresState.find(s => s.id === 'score-recovery')?.value || 78;
    const streakScore = derivedScoresState.find(s => s.id === 'score-streak')?.value || 95;
    const habitScore = derivedScoresState.find(s => s.id === 'score-habit')?.value || 82;
    const progressScore = derivedScoresState.find(s => s.id === 'score-progress')?.value || 48;
    const injuryScore = derivedScoresState.find(s => s.id === 'score-injury')?.value || 65;
    const workoutsScore = derivedScoresState.find(s => s.id === 'score-workouts')?.value || 86;

    const activeInjury = entries.find(e => e.type === "INJURY_REPORTED" && e.details.status !== "resolved" && e.visibility !== "user-hidden");

    return [
      {
        id: "score-recovery",
        x: 160, y: 105,
        name: "Sleep",
        fullName: "Sleep Quality Tracking (7.5 hrs)",
        sub: "Sleep Tracker",
        icon: "moon",
        val: recoveryScore,
        color: recoveryScore > 80 ? COLORS.teal : COLORS.amber,
        status: recoveryScore > 80 ? "good" : "watch",
        trend: recoveryScore > 80 ? "↑" : "→",
        size: 18,
        type: "input"
      },
      {
        id: "score-streak",
        x: 130, y: 180,
        name: "Stress",
        fullName: "Mental & Neural Stress (Low)",
        sub: streakScore > 80 ? "LOW STRESS" : "HIGH FATIGUE",
        icon: "heart",
        val: streakScore,
        color: streakScore > 80 ? COLORS.teal : COLORS.rose,
        status: streakScore > 80 ? "good" : "at risk",
        trend: streakScore > 80 ? "↑" : "↓",
        size: 16,
        type: "input"
      },
      {
        id: "score-habit",
        x: 165, y: 260,
        name: "Habits",
        fullName: "Friday evening workout dropout trend detected",
        sub: "HABIT DETECTED",
        icon: "refresh",
        val: habitScore,
        color: COLORS.amber,
        status: "watch",
        trend: "↓",
        size: 15,
        type: "input"
      },
      {
        id: "score-progress",
        x: 300, y: 60,
        name: "Goal",
        fullName: `Goal: ${activeGoal}`,
        sub: activeGoal.length > 20 ? activeGoal.slice(0, 18) + "..." : activeGoal,
        icon: "target",
        val: progressScore,
        color: COLORS.gold,
        status: "good",
        trend: "↑",
        size: 20,
        type: "goal"
      },
      {
        id: "score-injury",
        x: 440, y: 105,
        name: activeInjury ? "Injury" : "No Injury",
        fullName: activeInjury ? `Active Injury: Left ${activeInjury.details.affectedArea.toUpperCase()} Sprain` : "Healthy Joint Baselines",
        sub: activeInjury ? `Mild Left ${activeInjury.details.affectedArea.toUpperCase()}` : "INJURY",
        icon: "alert",
        val: injuryScore,
        color: activeInjury ? COLORS.rose : COLORS.teal,
        status: activeInjury ? "at risk" : "good",
        trend: activeInjury ? "↓" : "↑",
        size: activeInjury ? 21 : 16,
        isActiveInjury: !!activeInjury,
        type: "output"
      },
      {
        id: "score-workouts",
        x: 470, y: 180,
        name: "Preference",
        fullName: "User Preference: Evening training sessions",
        sub: "Evening Sessions",
        icon: "dumbbell",
        val: workoutsScore,
        color: COLORS.teal,
        status: "good",
        trend: "→",
        size: 15,
        type: "output"
      },
      {
        id: "score-workouts-adaptive",
        x: 440, y: 260,
        name: "Adaptive Workout",
        fullName: activeInjury ? `Adaptive Plan: Knee Friendly Leg Press` : "Full Intensity Adaptive Workout",
        sub: activeInjury ? "Knee Friendly Lift" : "Full Intensity",
        icon: "sparkles",
        val: workoutsScore,
        color: activeInjury ? COLORS.lime : COLORS.teal,
        status: "good",
        trend: "→",
        size: 18,
        type: "output"
      }
    ];
  }, [derivedScoresState, activeGoal, activeInjury]);

  const renderNodeIcon = (iconName, colorHex) => {
    const iconClass = "w-[18px] h-[18px]";
    if (iconName === 'moon') return <Moon className={iconClass} style={{ color: colorHex }} />;
    if (iconName === 'heart') return <Heart className={iconClass} style={{ color: colorHex }} />;
    if (iconName === 'refresh') return <RefreshCw className={iconClass} style={{ color: colorHex }} />;
    if (iconName === 'target') return <Target className={iconClass} style={{ color: colorHex }} />;
    if (iconName === 'alert') return <ShieldAlert className={iconClass} style={{ color: colorHex }} />;
    if (iconName === 'dumbbell') return <Dumbbell className={iconClass} style={{ color: colorHex }} />;
    return <Sparkles className={iconClass} style={{ color: colorHex }} />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-fitbg text-fittext' : 'bg-fitbg text-fittext'}`}>
      
      {/* Dynamic Embedded CSS Animations to support center origin and twinkle */}
      <style>{`
        .spin-slow {
          transform-origin: 50% 50%;
          animation: spin-cw 140s linear infinite;
        }
        .spin-slow-reverse {
          transform-origin: 50% 50%;
          animation: spin-ccw 190s linear infinite;
        }
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .spin-slow, .spin-slow-reverse, .spark-line, animateMotion {
            animation: none !important;
            stroke-dasharray: none !important;
          }
        }
        @keyframes soundWave {
          0%, 100% { height: 6px; }
          50% { height: 28px; }
        }
        .animate-wave-1 { animation: soundWave 0.6s ease-in-out infinite alternate; }
        .animate-wave-2 { animation: soundWave 0.8s ease-in-out infinite alternate; }
        .animate-wave-3 { animation: soundWave 0.5s ease-in-out infinite alternate; }
        .animate-wave-4 { animation: soundWave 0.7s ease-in-out infinite alternate; }
        .animate-wave-5 { animation: soundWave 0.9s ease-in-out infinite alternate; }
        .animate-wave-6 { animation: soundWave 0.6s ease-in-out infinite alternate; }
        .animate-wave-7 { animation: soundWave 0.8s ease-in-out infinite alternate; }
      `}</style>

      {/* App Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 font-sans">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b pb-6 border-white/10 dark:border-white/5 light:border-black/5">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              {/* Constellation brand icon glyph */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fitteal/20 to-fitviolet/20 border border-solid border-fitteal/35 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-fitteal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                  <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                  <circle cx="19" cy="5" r="1.5" fill="currentColor" />
                  <circle cx="19" cy="19" r="1.5" fill="currentColor" />
                  <circle cx="5" cy="19" r="1.5" fill="currentColor" />
                  <line x1="5" y1="5" x2="12" y2="12" strokeWidth="1.2" strokeDasharray="2, 2" />
                  <line x1="19" y1="5" x2="12" y2="12" strokeWidth="1.2" strokeDasharray="2, 2" />
                  <line x1="19" y1="19" x2="12" y2="12" strokeWidth="1.2" strokeDasharray="2, 2" />
                  <line x1="5" y1="19" x2="12" y2="12" strokeWidth="1.2" strokeDasharray="2, 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-display italic font-medium tracking-tight text-fittext">FitAI X</h1>
                <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-fittextdim">AI Memory & Context Dashboard</p>
              </div>
            </div>

            {/* Vertical separator */}
            <div className="hidden sm:block w-px h-8 bg-white/10 dark:bg-white/5"></div>

            {/* User Dropdown Selector (First Picture Specification) */}
            <div className="relative">
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-solid border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/3 backdrop-blur-[6px] text-xs font-mono font-medium outline-none cursor-pointer hover:border-fitgold text-fittext transition-all"
              >
                <span className="text-sm">{USER_AVATARS[selectedUser] || "👤"}</span>
                <span className="font-display italic text-sm font-medium tracking-tight">{selectedUser}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-fittextdim transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-[#0A0F16]/95 dark:bg-[#0A0F16]/95 light:bg-white/95 rounded-2xl border border-solid border-white/10 dark:border-white/5 shadow-2xl p-3 z-50 backdrop-blur-xl">
                  {/* Filter users input */}
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-fittextdim" />
                    <input 
                      type="text" 
                      placeholder="Filter users..."
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="w-full bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-xs focus:outline-none focus:border-fitviolet font-mono text-fittext"
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </div>
                  
                  {/* Filtered user list */}
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    {Object.keys(userData)
                      .filter(name => name.toLowerCase().includes(userFilter.toLowerCase()))
                      .map(name => {
                        const isSelected = name === selectedUser;
                        return (
                          <div 
                            key={name}
                            onClick={() => {
                              setSelectedUser(name);
                              setSelectedNodeId(null);
                              setIsUserDropdownOpen(false);
                              setUserFilter('');
                              addLiveSignal(`Switched context timeline to active profile: ${name}.`);
                            }}
                            className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-white/5 border border-white/12 shadow-sm ring-1 ring-fitgold/20' 
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="p-1.5 rounded bg-black/25 flex items-center justify-center text-sm w-8 h-8 flex-shrink-0">
                              {USER_AVATARS[name] || "👤"}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-display italic font-bold text-fittext leading-tight">{name}</h4>
                              <p className="text-[10px] text-fittextdim truncate font-sans mt-0.5 w-48 leading-relaxed">{userData[name].goal}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation & Toggle */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            {/* Pill-shaped Tab Segmented Control */}
            <div className="flex bg-black/15 dark:bg-black/35 p-1.5 rounded-full border border-solid border-white/10 dark:border-white/5 light:border-black/5 gap-1 select-none">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-250 cursor-pointer select-none outline-none appearance-none border-none ${activeTab === 'dashboard' ? 'bg-fitbg text-fittext font-semibold shadow-sm' : 'bg-transparent text-fittextdim hover:text-fittext hover:opacity-90'}`}
              >
                CONSTELLATION
              </button>
              <button 
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-250 cursor-pointer select-none outline-none appearance-none border-none ${activeTab === 'timeline' ? 'bg-fitbg text-fittext font-semibold shadow-sm' : 'bg-transparent text-fittextdim hover:text-fittext hover:opacity-90'}`}
              >
                MEMORY LOG
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-250 cursor-pointer select-none outline-none appearance-none border-none ${activeTab === 'analytics' ? 'bg-fitbg text-fittext font-semibold shadow-sm' : 'bg-transparent text-fittextdim hover:text-fittext hover:opacity-90'}`}
              >
                ANALYTICS
              </button>
            </div>

            {/* Pill-Shaped Glass Theme Toggle */}
            <button 
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-solid border-white/10 dark:border-white/5 light:border-black/10 bg-white/5 dark:bg-white/3 light:bg-black/5 backdrop-blur-[6px] text-xs font-mono font-medium outline-none cursor-pointer transition-all duration-250 hover:border-fitgold text-fittext"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-fitgold" />
                  <span>LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-fitviolet" />
                  <span>DARK</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Tab 1: Constellation Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Constellation Canvas Widget */}
            <div className="lg:col-span-2 glass-panel p-[22px] relative overflow-hidden flex flex-col items-center">
              
              {/* Starfield ambient background */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <svg className="w-full h-full opacity-60">
                  {starCoords.map((star, idx) => (
                    <circle 
                      key={idx} 
                      cx={`${star.x * 2.5}%`} 
                      cy={`${star.y * 2.5}%`} 
                      r={star.r} 
                      fill={theme === 'light' ? '#B8862A' : '#ffffff'} 
                      className={star.twinkle ? 'animate-twinkle' : 'opacity-40'} 
                    />
                  ))}
                </svg>
              </div>

              {/* Soft radial glow behind center node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-fitteal/10 dark:bg-fitteal/5 blur-[80px] pointer-events-none z-0"></div>

              <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-6 z-10 gap-2">
                <div>
                  <h2 className="text-lg font-display italic font-medium text-fittext">AI Memory State & Dependency Graph</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-mono text-fittextdim uppercase tracking-wider">Flow: Inputs (Left) &rarr; Processing (Center) &rarr; Outputs (Right)</span>
                  {/* Reset view as glass button */}
                  <button 
                    onClick={() => setSelectedNodeId(null)}
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-solid border-white/10 dark:border-white/5 light:border-black/10 bg-white/5 dark:bg-white/3 light:bg-black/5 backdrop-blur-[6px] text-xs font-mono font-medium outline-none cursor-pointer transition-all duration-200 hover:border-fitgold text-fittext"
                  >
                    RESET VIEW
                  </button>
                </div>
              </div>

              {/* Hand-Rolled SVG Dependency map */}
              <div className="relative w-full max-w-[600px] aspect-[5/3] my-6 z-10">
                <svg viewBox="0 0 600 360" className="w-full h-full overflow-visible">
                  
                  {/* SVG Definitions */}
                  <defs>
                    <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="4.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#5FE3C9" stopOpacity="0.15"/>
                      <stop offset="100%" stopColor="#5FE3C9" stopOpacity="0"/>
                    </radialGradient>
                  </defs>

                  {/* Ambient starry background inside SVG */}
                  <g className="opacity-40">
                    <circle cx="60" cy="50" r="1" fill="#ffffff" />
                    <circle cx="140" cy="230" r="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDuration: '4s' }} />
                    <circle cx="220" cy="40" r="1" fill="#ffffff" />
                    <circle cx="90" cy="310" r="1.2" fill="#ffffff" />
                    <circle cx="320" cy="30" r="1.5" fill="#ffffff" />
                    <circle cx="510" cy="50" r="1" fill="#ffffff" />
                    <circle cx="530" cy="290" r="1.2" fill="#ffffff" />
                    <circle cx="460" cy="190" r="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDuration: '3s' }} />
                  </g>

                  {/* Orbit paths */}
                  <circle cx="300" cy="180" r="140" fill="none" stroke="white" strokeWidth="0.8" strokeDasharray="3, 7" className="opacity-10" />
                  <circle cx="300" cy="180" r="80" fill="none" stroke="white" strokeWidth="0.6" strokeDasharray="1, 4" className="opacity-5" />

                  {/* Connectors & Spark flows */}
                  {graphNodes.map((node, index) => {
                    const nodeColor = theme === 'light' ? node.color.light : node.color.dark;
                    
                    // Determine spark path based on input/goal/output flow direction
                    let pathString = `M 300 180 L ${node.x} ${node.y}`; // Default outputs: Center -> Outward
                    if (node.type === 'input') {
                      pathString = `M ${node.x} ${node.y} L 300 180`; // Inputs: Outward -> Center
                    } else if (node.type === 'goal') {
                      pathString = `M 300 60 L 300 180`; // Goal: Top -> Center
                    }

                    return (
                      <g key={`${node.id}-${index}`}>
                        {/* Static connection line colored by node status */}
                        <line 
                          x1="300" 
                          y1="180" 
                          x2={node.x} 
                          y2={node.y} 
                          stroke={nodeColor} 
                          strokeWidth="1.5" 
                          className="opacity-[0.22]" 
                        />
                        {/* Animated traveling spark along connection (directional flow) */}
                        <circle r="3.5" fill={nodeColor} filter="url(#nodeGlow)">
                          <animateMotion 
                            path={pathString} 
                            dur={`${2.8 + index * 0.25}s`} 
                            repeatCount="indefinite" 
                          />
                        </circle>
                      </g>
                    );
                  })}

                  {/* Central User Star Node (Dotted outer ring + User Icon + details below) */}
                  <g 
                    onClick={() => setSelectedNodeId('center')}
                    className="cursor-pointer group select-none"
                  >
                    {/* Glowing outer progress tracks for Recovery health score */}
                    <circle cx="300" cy="180" r="28" fill="none" stroke="#1E293B" strokeWidth="3" className="opacity-30" />
                    <circle 
                      cx="300" 
                      cy="180" 
                      r="28" 
                      fill="none" 
                      stroke={theme === 'light' ? COLORS.teal.light : COLORS.teal.dark} 
                      strokeWidth="3.5" 
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - (derivedScoresState.find(s => s.id === 'score-recovery')?.value || 78) / 100)}
                      transform="rotate(-90 300 180)"
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />

                    {/* Node circle with breath pulse animation */}
                    <circle cx="300" cy="180" r="21" fill={theme === 'light' ? '#FFFFFF' : '#0E1724'} stroke={theme === 'light' ? COLORS.gold.light : COLORS.gold.dark} strokeWidth="2.5" className="transition-all duration-300 group-hover:scale-105" />
                    {/* User Icon inside */}
                    <foreignObject x="289" y="169" width="22" height="22" className="pointer-events-none">
                      <div className="flex items-center justify-center w-full h-full text-fittext">
                        <User className="w-[16px] h-[16px]" />
                      </div>
                    </foreignObject>
                    
                    {/* Stacked label text below node circle (Fraunces Display name) */}
                    <text x="300" y="232" textAnchor="middle" className="font-display italic text-[15px] font-semibold fill-fittext tracking-tight">{selectedUser}</text>
                    <text x="300" y="246" textAnchor="middle" className="font-mono text-[9px] tracking-[0.08em] fill-fittextdim uppercase">
                      Recovery: {derivedScoresState.find(s => s.id === 'score-recovery')?.value || 78}%
                    </text>
                  </g>

                  {/* Outer Orbiting score nodes */}
                  {graphNodes.map((node, index) => {
                    const nodeColor = theme === 'light' ? node.color.light : node.color.dark;
                    const isSelected = selectedNodeId === node.id;

                    return (
                      <g 
                        key={`${node.id}-outer-${index}`}
                        onClick={() => setSelectedNodeId(node.id)}
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer group select-none transition-all duration-300"
                      >
                        {/* High Severity Pulse Halo Ring */}
                        {node.isActiveInjury && (
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r={node.size + 7} 
                            fill="none" 
                            stroke={nodeColor} 
                            strokeWidth="1.5" 
                            className="animate-ping" 
                            style={{ transformOrigin: `${node.x}px ${node.y}px`, opacity: 0.4 }} 
                          />
                        )}

                        {/* Selected halo */}
                        {isSelected && (
                          <circle cx={node.x} cy={node.y} r={node.size + 8} fill="none" stroke={nodeColor} strokeWidth="1.2" strokeDasharray="3, 3" className="animate-spin" style={{ transformOrigin: `${node.x}px ${node.y}px`, animationDuration: '7s' }} />
                        )}

                        {/* Solid node circle with size based on importance */}
                        <circle 
                          cx={node.x} 
                          cy={node.y} 
                          r={node.size} 
                          fill={theme === 'light' ? '#FFFFFF' : '#0A0F16'} 
                          stroke={nodeColor} 
                          strokeWidth="2.5" 
                          filter="url(#nodeGlow)"
                          className="transition-all duration-300 group-hover:scale-110" 
                        />
                        {/* Icon inside circle */}
                        <foreignObject x={node.x - 9} y={node.y - 9} width="18" height="18" className="pointer-events-none">
                          <div className="flex items-center justify-center w-full h-full">
                            {renderNodeIcon(node.icon, nodeColor)}
                          </div>
                        </foreignObject>
                        
                        {/* Floating Labels below node circle */}
                        <text x={node.x} y={node.y + 32} textAnchor="middle" className="font-sans text-[10px] font-medium fill-fittext">{node.name}</text>
                        <text x={node.x} y={node.y + 44} textAnchor="middle" className="font-mono text-[8px] tracking-[0.05em] fill-fittextdim uppercase">
                          {node.sub} {node.trend}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Hover detail tooltip card overlay */}
                {hoveredNode && (
                  <div 
                    className="absolute bg-[#0E1724]/95 border border-solid border-white/10 rounded-2xl p-3 shadow-2xl z-30 pointer-events-none transition-all duration-200 backdrop-blur-xl w-48 text-[10px]"
                    style={{
                      left: `${(hoveredNode.x / 600) * 100}%`,
                      top: `${(hoveredNode.y / 360) * 100 - 18}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="font-display italic font-bold text-fittext text-[11px] mb-1">{hoveredNode.fullName}</div>
                    <div className="flex justify-between items-center mt-1 text-[9px] font-mono">
                      <span className="text-fittextdim">Value:</span>
                      <span className="text-white font-bold">{hoveredNode.val}% {hoveredNode.trend}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-fittextdim">Status:</span>
                      <span className={`font-bold ${
                        hoveredNode.status === 'good' ? 'text-fitlime' : hoveredNode.status === 'watch' ? 'text-fitgold' : 'text-fitrose'
                      }`}>{hoveredNode.status.toUpperCase()}</span>
                    </div>
                  </div>
                )}

                {/* Simulated empty / loading state */}
                {entries.length === 0 && (
                  <div className="absolute inset-0 bg-[#0A0F16]/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20 rounded-2xl">
                    <Brain className="w-12 h-12 text-fittextdim animate-pulse mb-3" />
                    <h3 className="text-sm font-semibold text-fittext mb-1">Constellation Map Offline</h3>
                    <p className="text-xs text-fittextdim max-w-xs">No active memory entries detected. Add a log below or switch profiles to load data.</p>
                  </div>
                )}
              </div>

              {/* Legend (wrapping flex row) */}
              <div className="w-full flex flex-wrap gap-[22px] justify-center items-center border-t border-white/10 dark:border-white/5 pt-4 mt-4 text-[10px] font-mono text-fittextdim z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme === 'light' ? COLORS.violet.light : COLORS.violet.dark }}></span>
                  <span>INPUTS (LEFT)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme === 'light' ? COLORS.gold.light : COLORS.gold.dark }}></span>
                  <span>GOALS (TOP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme === 'light' ? COLORS.teal.light : COLORS.teal.dark }}></span>
                  <span>OUTPUTS (RIGHT)</span>
                </div>
                <div className="ml-auto text-[9px] opacity-75 font-sans">
                  * Dynamic dependency path flows active
                </div>
              </div>
            </div>

            {/* Sidebar Details Panels */}
            <div className="flex flex-col gap-6">
              
              {/* Detail/Overview Panel */}
              <div className="glass-panel p-[22px] flex-grow">
                {selectedNodeId === 'center' || !selectedNodeId ? (
                  // Overall overview panel
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-4 h-4 text-fitgold" />
                      <h3 className="text-xs font-mono uppercase tracking-wider text-fittextdim">User Star Overview</h3>
                    </div>
                    <h2 className="text-xl font-display italic font-medium mb-3 text-fittext">{selectedUser}</h2>
                    
                    <div className="space-y-3 mt-4 text-xs font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-fittextdim">Streak Active:</span>
                        <span className="text-fitlime font-bold">128 Days</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-fittextdim">Current Goal:</span>
                        <span className="text-fitviolet font-semibold">{activeGoal}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-fittextdim">Active Injuries:</span>
                        <span className="text-fitrose font-medium text-right">
                          {(() => {
                            const activeInjuryEntries = entries.filter(e => 
                              e.type === "INJURY_REPORTED" && 
                              e.details.status !== "resolved" && 
                              e.visibility !== "user-hidden"
                            );
                            if (activeInjuryEntries.length === 0) return "None";

                            // Group by bodyPart (affectedArea) and side (laterality)
                            const grouped = [];
                            activeInjuryEntries.forEach(entry => {
                              const side = entry.details.laterality && entry.details.laterality !== 'none' ? entry.details.laterality : null;
                              const bodyPart = entry.details.affectedArea;
                              const label = `${side ? side.toUpperCase() + ' ' : ''}${bodyPart.toUpperCase()}`;
                              
                              let group = grouped.find(g => g.label === label);
                              if (!group) {
                                group = { label, entries: [] };
                                grouped.push(group);
                              }
                              group.entries.push(entry);
                            });

                            // Sort group entries by timestamp desc
                            grouped.forEach(g => {
                              g.entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                              g.mostRecent = g.entries[0];
                              g.count = g.entries.length;
                            });

                            return (
                              <span className="inline-flex flex-wrap gap-x-1.5 justify-end">
                                {grouped.map((g, idx) => (
                                  <span key={g.label} className="relative group cursor-pointer border-b border-dashed border-fitrose/75 hover:border-fitrose select-none inline-block">
                                    {g.label}{g.count > 1 ? ` ×${g.count}` : ''}
                                    {idx < grouped.length - 1 && <span className="text-fittextdim select-none pointer-events-none ml-1.5">/</span>}
                                    
                                    {/* Tooltip detail box */}
                                    <span className="absolute bottom-6 right-0 translate-y-[-4px] hidden group-hover:block bg-[#0E1724]/98 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 w-72 text-left font-sans text-fittext leading-relaxed font-normal normal-case pointer-events-none backdrop-blur-xl">
                                      <div className="font-display italic font-bold text-fitrose mb-1.5 text-[13px] tracking-wide">
                                        {g.mostRecent.summary || `${g.label} Injury`}
                                      </div>
                                      <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-1.5 mb-2 text-fittextdim">
                                        <span>Severity: <strong className="text-fitrose">{g.mostRecent.details.severity?.toUpperCase()}</strong></span>
                                        <span>{new Date(g.mostRecent.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                      </div>
                                      <div className="text-fittext text-[11px] mb-2 font-medium">
                                        <span className="text-fittextdim block text-[10px] font-mono uppercase tracking-wider mb-0.5">Symptom:</span>
                                        {g.mostRecent.details.symptom}
                                      </div>
                                      {g.mostRecent.details.restrictedMovements && g.mostRecent.details.restrictedMovements.length > 0 && (
                                        <div className="text-[10px] text-fitrose bg-fitrose/5 border border-fitrose/10 rounded-lg p-2 font-mono mt-2 leading-snug">
                                          <span className="font-bold block text-[9px] uppercase tracking-wider mb-1">Restricted Movements:</span>
                                          {g.mostRecent.details.restrictedMovements.map(m => m.replace(/-/g, ' ')).join(', ')}
                                        </div>
                                      )}
                                      {g.count > 1 && (
                                        <div className="text-[9px] text-fittextdim font-mono mt-3 text-right">
                                          Showing most recent of {g.count} active logs
                                        </div>
                                      )}
                                    </span>
                                  </span>
                                ))}
                              </span>
                            );
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-fittextdim">Timeline Database size:</span>
                        <span className="text-fittext">{entries.length} Memory Records</span>
                      </div>
                    </div>
                    <p className="text-xs text-fittextdim mt-6 leading-relaxed font-sans">
                      Select any of the dependency graph nodes to view the derived aspects calculated from your timeline memories.
                    </p>
                  </div>
                ) : (
                  // orbiting aspect node details
                  <div>
                    {(() => {
                      const targetId = selectedNodeId === 'score-workouts-adaptive' ? 'score-workouts' : selectedNodeId;
                      const score = derivedScoresState.find(s => s.id === targetId);
                      const explanation = nodeExplanationNotes[targetId];
                      if (!score || !explanation) return null;

                      const status = getScoreStatusBadge(score.trend);
                      const badgeClass = getStatusBadgeColor(status);

                      return (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-mono uppercase tracking-wider text-fittextdim">Aspect Metrics</span>
                            <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-full uppercase font-semibold ${badgeClass}`}>
                              {status}
                            </span>
                          </div>
                          
                          <h2 className="text-xl font-display italic font-medium mb-1 text-fittext">{score.name}</h2>
                          <div className="text-3xl font-display italic font-medium mt-2 mb-6" style={{ color: getScoreColor(score.trend, score.value) }}>
                            {score.value}%
                          </div>

                          <div className="bg-black/10 dark:bg-black/20 border border-white/5 rounded-xl p-3 mb-6">
                            <p className="text-xs leading-relaxed text-fittext font-sans">
                              {explanation.explanation}
                            </p>
                          </div>

                          <div className="text-xs font-mono">
                            <span className="text-fittextdim block mb-3 font-semibold uppercase tracking-wider">BASIS LOG ENTRIES:</span>
                            <div className="space-y-2 max-h-[140px] overflow-y-auto">
                              {score.basis.map(entryId => {
                                const matched = entries.find(e => e.id === entryId);
                                if (!matched) return null;
                                return (
                                  <div 
                                    key={entryId}
                                    onClick={() => {
                                      setActiveTab('timeline');
                                      setExpandedEntryId(entryId);
                                    }}
                                    className="bg-white/5 dark:bg-white/5 border border-white/5 hover:border-fitviolet p-2 rounded-lg cursor-pointer transition-all flex justify-between items-center text-[10px] text-fittext"
                                  >
                                    <span className="truncate max-w-[70%] font-sans">{matched.summary}</span>
                                    <span className="text-[9px] text-fittextdim">{new Date(matched.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Chat Preset Simulator Widget */}
              <div className="glass-panel p-[22px] flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <PlusCircle className="w-4 h-4 text-fitviolet" />
                    <h3 className="text-sm font-display italic font-medium text-fittext">Simulator Terminal</h3>
                  </div>
                  <p className="text-xs text-fittextdim leading-relaxed font-sans">
                    Type an event update to simulate the live AI processing engine extracting new timeline memory logs.
                  </p>
                </div>

                {/* Pre-set clickers */}
                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => setChatInput("My lower back feels strained during squats")}
                    className="text-left text-[10px] font-mono border border-solid border-white/10 dark:border-white/5 hover:border-fitrose/50 bg-white/5 dark:bg-white/3 hover:bg-fitrose/10 p-2.5 rounded-lg text-fittext cursor-pointer transition-all"
                  >
                    ⚠️ TRIGGER: "My lower back feels strained"
                  </button>
                  <button 
                    onClick={() => setChatInput("Switch my goal to Marathon running prep")}
                    className="text-left text-[10px] font-mono border border-solid border-white/10 dark:border-white/5 hover:border-fitviolet/50 bg-white/5 dark:bg-white/3 hover:bg-fitviolet/10 p-2.5 rounded-lg text-fittext cursor-pointer transition-all"
                  >
                    🎯 TRIGGER: "Switch goal to Marathon"
                  </button>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type constraint or symptom..." 
                    className="flex-grow bg-black/20 dark:bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fitviolet font-mono"
                  />
                  <button 
                    onClick={handleProcessChat}
                    disabled={isProcessingChat || !chatInput}
                    className="bg-fitviolet text-white hover:opacity-90 px-4 py-2 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all border-none cursor-pointer"
                  >
                    {isProcessingChat ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>SEND</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Signal Feed Widget */}
              <div className="glass-panel p-[22px] flex flex-col h-[240px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-display italic font-medium text-fittext">Live Signal Feed</h3>
                  <span className="w-2 h-2 rounded-full bg-fitlime animate-pulse"></span>
                </div>
                <div className="space-y-3 overflow-y-auto flex-grow pr-1 font-mono text-[10px] text-fittextdim">
                  {liveSignals.map((signal, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-2 last:border-0">
                      <span className="text-fitgold mr-1.5 font-semibold">{signal.time}</span>
                      <span className="text-fittext leading-normal">{signal.text}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Timeline List View */}
        {activeTab === 'timeline' && (
          <div className="flex flex-col gap-6">
            
            {/* Filter controls panel */}
            <div className="glass-panel p-[22px]">
              <h2 className="text-sm font-mono uppercase tracking-[0.08em] text-fittextdim mb-5">Memory Query Engine</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Search summary + tags */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-fittextdim" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs & tags..." 
                    className="w-full bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-fitviolet font-mono text-fittext"
                  />
                </div>

                {/* Date range controls */}
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:border-fitviolet font-mono text-fittext" 
                  />
                  <span className="text-xs text-fittextdim font-mono">TO</span>
                  <input 
                    type="date" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:border-fitviolet font-mono text-fittext" 
                  />
                </div>

                {/* Multi-select source types */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <button 
                    onClick={() => setInferredOnly(prev => !prev)}
                    className={`px-3 py-1.5 rounded-lg border border-solid text-[10px] font-mono transition-all cursor-pointer ${inferredOnly ? 'bg-fitviolet/15 border-fitviolet text-fitviolet' : 'border-white/10 text-fittextdim hover:text-fittext'}`}
                  >
                    AI-Inferred Only
                  </button>
                  <button 
                    onClick={() => setUserConfirmedOnly(prev => !prev)}
                    className={`px-3 py-1.5 rounded-lg border border-solid text-[10px] font-mono transition-all cursor-pointer ${userConfirmedOnly ? 'bg-fitviolet/15 border-fitviolet text-fitviolet' : 'border-white/10 text-fittextdim hover:text-fittext'}`}
                  >
                    User-Confirmed Only
                  </button>
                </div>

                {/* Reset Filters button */}
                <div className="flex justify-end items-center">
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTypes([]);
                      setInferredOnly(false);
                      setUserConfirmedOnly(false);
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="w-full md:w-auto text-xs border border-solid border-white/10 hover:border-fitviolet px-4 py-2 rounded-lg font-mono text-center hover:bg-white/5 transition-all cursor-pointer text-fittext bg-transparent"
                  >
                    CLEAR FILTERS
                  </button>
                </div>
              </div>

              {/* Multi-select filter chips by event type */}
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/5">
                <span className="text-[10px] font-mono text-fittextdim flex items-center uppercase mr-2">Types:</span>
                {["GOAL_CHANGED", "INJURY_REPORTED", "MILESTONE_ACHIEVED", "HABIT_PATTERN_DETECTED", "PREFERENCE_LEARNED", "CONSTRAINT_CHANGED", "PLAN_ADJUSTMENT_REASON"].map(type => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                      }}
                      className={`text-[9px] font-mono px-2.5 py-1.5 rounded-md border border-solid uppercase transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-fitviolet/20 border-fitviolet text-white' 
                          : 'border-white/5 bg-white/5 text-fittextdim hover:text-fittext'
                      }`}
                    >
                      {type.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edit Entry Form Modal Overlay */}
            {editEntry && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass-panel p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-display italic font-medium">Edit Memory Entry</h3>
                    <button 
                      onClick={() => setEditEntry(null)}
                      className="p-1 rounded-lg hover:bg-white/10 border-none cursor-pointer bg-transparent"
                    >
                      <X className="w-4 h-4 text-fittextdim" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
                    <div>
                      <label className="block text-fittextdim mb-1">SUMMARY</label>
                      <input 
                        type="text"
                        value={editForm.summary}
                        onChange={(e) => setEditForm(prev => ({ ...prev, summary: e.target.value }))}
                        className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fitviolet font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-fittextdim mb-1">TAGS (comma separated)</label>
                      <input 
                        type="text"
                        value={editForm.tags}
                        onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fitviolet font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-fittextdim mb-1">PLANNING VISIBILITY</label>
                      <select 
                        value={editForm.visibility}
                        onChange={(e) => setEditForm(prev => ({ ...prev, visibility: e.target.value }))}
                        className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fitviolet font-mono"
                      >
                        <option value="private">Private (Not used in derived scores)</option>
                        <option value="used-for-planning">Used for Planning (Active)</option>
                        <option value="user-hidden">User Hidden (Muted from AI context)</option>
                      </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button 
                        type="button"
                        onClick={() => setEditEntry(null)}
                        className="px-4 py-2 border border-solid border-white/10 hover:bg-white/5 rounded-lg text-fittext font-mono cursor-pointer bg-transparent"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-fitviolet text-white font-bold rounded-lg border-none cursor-pointer"
                      >
                        SAVE CHANGES
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Timeline scroll list */}
            <div className="space-y-8">
              {Object.keys(groupedEntriesByMonth).length === 0 ? (
                <div className="glass-panel p-8 text-center text-fittextdim font-mono text-sm">
                  No memory logs match the active query constraints.
                </div>
              ) : (
                Object.keys(groupedEntriesByMonth).map(month => (
                  <div key={month} className="space-y-4">
                    
                    {/* Month Heading */}
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-display italic font-medium text-fitgold">{month}</h3>
                      <div className="flex-grow h-px bg-white/10 dark:bg-white/5"></div>
                    </div>

                    {/* Timeline logs */}
                    <div className="space-y-3">
                      {groupedEntriesByMonth[month].map(entry => {
                        const isExpanded = expandedEntryId === entry.id;
                        
                        // Icon mapping
                        const iconColor = theme === 'light' ? 'text-[#8B6FDB]' : 'text-[#B79CF7]';
                        let typeIcon = <Target className={`w-4 h-4 ${iconColor}`} />;
                        if (entry.type === 'INJURY_REPORTED') typeIcon = <AlertTriangle className="w-4 h-4 text-fitrose" />;
                        if (entry.type === 'MILESTONE_ACHIEVED') typeIcon = <Award className="w-4 h-4 text-fitlime" />;
                        if (entry.type === 'HABIT_PATTERN_DETECTED') typeIcon = <Calendar className="w-4 h-4 text-fitamber" />;

                        // Filter cross-reference adjustments
                        const adjustmentDecisions = entries.filter(
                          adj => adj.type === 'PLAN_ADJUSTMENT_REASON' && adj.details.triggeringEntryId === entry.id
                        );

                        return (
                          <div 
                            key={entry.id} 
                            className={`glass-panel overflow-hidden transition-all duration-300 border border-solid ${
                              entry.visibility === 'user-hidden' 
                                ? 'opacity-40 border-dashed border-red-500/30' 
                                : isExpanded 
                                ? 'border-fitviolet ring-1 ring-fitviolet/35 shadow-lg shadow-violet-500/5' 
                                : 'border-white/10 dark:border-white/5 hover:border-white/15'
                            }`}
                          >
                            {/* Summary row */}
                            <div 
                              onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                              className="p-[22px] flex flex-col gap-4 cursor-pointer select-none"
                            >
                              {/* Top row: Logged time left, badges right */}
                              <div className="flex justify-between items-center w-full">
                                <span className="text-[10px] font-mono tracking-wider text-fittextdim uppercase">
                                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                
                                <div className="flex items-center gap-1.5">
                                  {/* Severity badge if available */}
                                  {entry.details.severity && (
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider border border-solid ${
                                      entry.details.severity === 'HIGH' 
                                        ? 'bg-fitrose/10 border-fitrose/30 text-fitrose' 
                                        : entry.details.severity === 'MEDIUM'
                                        ? 'bg-fitamber/10 border-fitamber/30 text-fitamber'
                                        : 'bg-fitteal/10 border-fitteal/30 text-fitteal'
                                    }`}>
                                      {entry.details.severity}
                                    </span>
                                  )}
                                  
                                  {/* Status badge if available */}
                                  {entry.details.status && (
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider border border-solid ${
                                      entry.details.status === 'active' 
                                        ? 'bg-fitrose/10 border-fitrose/30 text-fitrose animate-pulse' 
                                        : 'bg-fitlime/10 border-fitlime/30 text-fitlime'
                                    }`}>
                                      {entry.details.status.toUpperCase()}
                                    </span>
                                  )}

                                  {entry.source === 'inferred' && (
                                    <span className="bg-violet-500/10 border border-solid border-violet-500/30 text-[#B79CF7] text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                                      Inferred ({(entry.confidence * 100).toFixed(0)}%)
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Middle row: Icon and content */}
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-black/25 dark:bg-black/45 border border-solid border-white/5 flex-shrink-0">
                                    {typeIcon}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold tracking-wide text-fittext">{entry.summary}</h4>
                                    <span className="uppercase text-fittextdim text-[8px] font-mono font-bold tracking-widest mt-1 block">
                                      {entry.type.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {entry.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="hidden sm:inline-block bg-white/5 px-2 py-0.5 rounded text-[9px] font-mono text-fittextdim border border-solid border-white/5">#{tag}</span>
                                  ))}
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-fittextdim" /> : <ChevronDown className="w-4 h-4 text-fittextdim" />}
                                </div>
                              </div>
                            </div>

                            {/* Expanded details container */}
                            {isExpanded && (
                              <div className="border-t border-solid border-white/10 dark:border-white/5 p-[22px] bg-black/10 dark:bg-black/25 animate-in slide-in-from-top duration-200">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                                  
                                  {/* Left col: Structured details */}
                                  <div>
                                    <h5 className="text-[10px] uppercase text-fittextdim mb-3 font-bold tracking-wider border-b border-solid border-white/5 pb-1">STRUCTURED MEMORY PAYLOAD</h5>
                                    <div className="space-y-1.5 text-fittext">
                                      <div className="flex"><span className="w-24 text-fittextdim font-semibold">ENTRY ID:</span><span>{entry.id}</span></div>
                                      <div className="flex"><span className="w-24 text-fittextdim font-semibold">SOURCE:</span><span className="capitalize">{entry.source}</span></div>
                                      <div className="flex"><span className="w-24 text-fittextdim font-semibold">VISIBILITY:</span><span className="uppercase text-fitgold">{entry.visibility.replace(/-/g, ' ')}</span></div>
                                      
                                      {/* Parse type-specific detail values */}
                                      <div className="mt-4 bg-black/35 border border-solid border-white/5 rounded-xl p-3 space-y-1.5 text-[11px]">
                                        <p className="text-[9px] text-[#B79CF7] font-bold uppercase mb-1">Payload Fields:</p>
                                        {Object.keys(entry.details).map(key => (
                                          <div key={key} className="flex">
                                            <span className="w-36 text-fittextdim truncate">{key}:</span>
                                            <span className="text-slate-200 truncate">
                                              {Array.isArray(entry.details[key]) ? entry.details[key].length + " array items" : String(entry.details[key])}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right col: Adjustments & Actions */}
                                  <div className="flex flex-col justify-between gap-6">
                                    <div>
                                      <h5 className="text-[10px] uppercase text-fittextdim mb-3 font-bold tracking-wider border-b border-solid border-white/5 pb-1">DECISION TRACEABILITY</h5>
                                      {adjustmentDecisions.length > 0 ? (
                                        <div className="space-y-2">
                                          <p className="text-fittext font-sans text-xs">
                                            This log triggered the following plan adjustments:
                                          </p>
                                          {adjustmentDecisions.map(adj => (
                                            <div 
                                              key={adj.id}
                                              onClick={() => {
                                                setExpandedEntryId(adj.id);
                                              }}
                                              className="border border-solid border-[#BEF264]/20 bg-[#BEF264]/5 hover:bg-[#BEF264]/10 p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between"
                                            >
                                              <span className="text-[10px] font-sans text-slate-200 truncate">{adj.summary}</span>
                                              <span className="text-[9px] font-mono text-[#BEF264] font-semibold">VIEW ADJUSTMENT</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-fittextdim font-sans text-xs italic">
                                          No active planning adjustments references traced to this memory ID.
                                        </p>
                                      )}
                                    </div>

                                    {/* Action button controls */}
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-solid border-white/5">
                                      <button 
                                        onClick={() => handleEditClick(entry)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-solid border-white/10 hover:border-fitviolet text-fittext font-mono cursor-pointer transition-all"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>EDIT</span>
                                      </button>

                                      <button 
                                        onClick={() => handleToggleHideFromAI(entry.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border border-solid font-mono cursor-pointer transition-all ${
                                          entry.visibility === 'user-hidden' 
                                            ? 'bg-fitamber/20 border-fitamber/40 text-fitamber hover:bg-fitamber/30' 
                                            : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-fitamber'
                                        }`}
                                      >
                                        {entry.visibility === 'user-hidden' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        <span>{entry.visibility === 'user-hidden' ? "UNHIDE FROM AI" : "HIDE FROM AI"}</span>
                                      </button>

                                      {entry.type === 'INJURY_REPORTED' && entry.details.status === 'active' && (
                                        <button 
                                          onClick={() => handleMarkResolved(entry.id)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-fitlime/10 border border-solid border-fitlime/35 text-fitlime hover:bg-fitlime/20 transition-all font-mono font-bold cursor-pointer"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>MARK RESOLVED</span>
                                        </button>
                                      )}

                                      {entry.source === 'inferred' && (
                                        <button 
                                          onClick={() => handleCorrectInference(entry.id)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-fitviolet/10 border border-solid border-fitviolet/35 text-[#B79CF7] hover:bg-fitviolet/20 transition-all font-mono font-bold cursor-pointer"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>CORRECT INFERENCE</span>
                                        </button>
                                      )}
                                    </div>

                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Tab 3: Analytics Panel */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recovery Line Chart (2 cols span) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <div className="glass-panel p-[22px]">
                <div className="mb-6">
                  <h2 className="text-lg font-display italic font-medium text-fittext">Recovery & Soreness Timeline</h2>
                  <p className="text-xs font-mono text-fittextdim">Score correlation over time with active injury events</p>
                </div>

                <div className="h-[250px] w-full mt-2 font-mono text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={recoveryLineChartData}
                      margin={{ top: 10, right: 30, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0A0F16', 
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#B79CF7" 
                        strokeWidth={2.5}
                        activeDot={{ r: 6 }} 
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          if (payload.injury) {
                            return (
                              <g key={cx}>
                                <circle cx={cx} cy={cy} r={6} fill="#FF8FA0" stroke="#05080C" strokeWidth={1.5} />
                                <path d={`M ${cx - 3} ${cy + 2} L ${cx + 3} ${cy + 2} L ${cx} ${cy - 3} Z`} fill="#ffffff" />
                              </g>
                            );
                          }
                          return <circle key={cx} cx={cx} cy={cy} r={3} fill="#B79CF7" />;
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend indicator notes */}
                <div className="flex items-center gap-4 mt-4 justify-center text-[10px] font-mono text-fittextdim">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#B79CF7]"></span>
                    <span>Recovery Score (%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF8FA0] flex items-center justify-center text-[8px] text-white">⚠️</span>
                    <span>Injury Event Marker</span>
                  </div>
                </div>
              </div>

              {/* Heatmap & Habits row */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* Heatmap Widget (3 cols) */}
                <div className="md:col-span-3 glass-panel p-[22px] flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-base font-display italic font-medium text-fittext">Consistency Heatmap</h3>
                    <p className="text-[10px] font-mono text-fittextdim">84-day workout & nutrition compliance grid</p>
                  </div>

                  {/* Adherence Grid */}
                  <div className="flex flex-col gap-1 my-4 overflow-x-auto pr-1">
                    <div className="flex min-w-[320px] justify-between text-[9px] font-mono text-fittextdim mb-1.5 px-7">
                      <span>Wk 1</span>
                      <span>Wk 3</span>
                      <span>Wk 5</span>
                      <span>Wk 7</span>
                      <span>Wk 9</span>
                      <span>Wk 12 (NOW)</span>
                    </div>

                    <div className="flex flex-col gap-1 min-w-[320px]">
                      {heatmapData.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex items-center gap-2">
                          <span className="w-6 text-[9px] font-mono text-fittextdim text-right">{row.dayName}</span>
                          <div className="flex-grow grid grid-cols-12 gap-1">
                            {row.cells.map((cell, colIdx) => {
                              let color = 'bg-slate-800/40';
                              if (cell.compliance > 80) color = 'bg-fitlime';
                              else if (cell.compliance > 50) color = 'bg-fitteal';
                              else if (cell.compliance > 25) color = 'bg-fitviolet/40';
                              
                              return (
                                <div 
                                  key={colIdx} 
                                  className={`aspect-square w-full rounded-[2px] transition-all hover:ring-1 hover:ring-white/40 cursor-help ${color}`}
                                  title={`Compliance: ${cell.compliance}%`}
                                  style={{
                                    opacity: cell.compliance > 25 ? (cell.compliance / 100) : 0.25
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-fittextdim border-t border-solid border-white/5 pt-3">
                    <span>Missed / Rest</span>
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2.5 h-2.5 bg-slate-800/40 rounded"></div>
                      <div className="w-2.5 h-2.5 bg-[#B79CF7]/40 rounded"></div>
                      <div className="w-2.5 h-2.5 bg-[#5FE3C9]/60 rounded"></div>
                      <div className="w-2.5 h-2.5 bg-[#BEF264] rounded"></div>
                    </div>
                    <span>High Adherence</span>
                  </div>
                </div>

                {/* Weekday Habits (2 cols) */}
                <div className="md:col-span-2 glass-panel p-[22px] flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-base font-display italic font-medium text-fittext">Weekday Habits</h3>
                    <p className="text-[10px] font-mono text-fittextdim">Average schedule completion rates</p>
                  </div>

                  <div className="h-[140px] w-full text-[10px] font-mono flex flex-col justify-center">
                    <div className="space-y-3 mt-1">
                      {consistencyData.filter(d => ['Mon', 'Wed', 'Thu', 'Fri'].includes(d.name)).map(item => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-semibold text-fittext">
                            <span>{item.name}</span>
                            <span>{item.rate}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${item.rate}%`, 
                                backgroundColor: item.rate > 80 ? '#BEF264' : item.rate > 60 ? '#5FE3C9' : '#FF8FA0' 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right column widgets */}
            <div className="flex flex-col gap-6">
              
              {/* Injury body map */}
              <div className="glass-panel p-[22px] flex flex-col items-center">
                <div className="w-full mb-4">
                  <h3 className="text-sm font-mono uppercase tracking-[0.08em] text-fittextdim">Injury Body Map</h3>
                  <p className="text-xs font-sans text-fittextdim">Anatomical load restriction indicators</p>
                </div>

                {/* Body SVG */}
                <div className="w-[120px] aspect-[1/2] my-4 relative">
                  {(() => {
                    const shoulderActive = entries.some(e => e.type === "INJURY_REPORTED" && e.details.affectedArea === "shoulder" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
                    const ankleActive = entries.some(e => e.type === "INJURY_REPORTED" && e.details.affectedArea === "ankle" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
                    const lowerBackActive = entries.some(e => e.type === "INJURY_REPORTED" && e.details.affectedArea === "lower-back" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
                    const kneeActive = entries.some(e => e.type === "INJURY_REPORTED" && e.details.affectedArea === "knee" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
                    const wristActive = entries.some(e => e.type === "INJURY_REPORTED" && e.details.affectedArea === "wrist" && e.details.status !== "resolved" && e.visibility !== "user-hidden");
                    const elbowActive = entries.some(e => e.type === "INJURY_REPORTED" && e.details.affectedArea === "elbow" && e.details.status !== "resolved" && e.visibility !== "user-hidden");

                    return (
                      <svg viewBox="0 0 100 200" className="w-full h-full">
                        <defs>
                          <radialGradient id="injuryGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FF8FA0" stopOpacity="0.85" />
                            <stop offset="40%" stopColor="#D94F66" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#D94F66" stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Scanner diagnostic gridlines (High tech feel) */}
                        <g className="opacity-[0.08] dark:opacity-[0.05]" stroke="currentColor">
                          <line x1="0" y1="40" x2="100" y2="40" strokeWidth="0.5" strokeDasharray="1, 3" />
                          <line x1="0" y1="80" x2="100" y2="80" strokeWidth="0.5" strokeDasharray="1, 3" />
                          <line x1="0" y1="120" x2="100" y2="120" strokeWidth="0.5" strokeDasharray="1, 3" />
                          <line x1="0" y1="160" x2="100" y2="160" strokeWidth="0.5" strokeDasharray="1, 3" />
                          <line x1="30" y1="0" x2="30" y2="200" strokeWidth="0.5" strokeDasharray="1, 3" />
                          <line x1="50" y1="0" x2="50" y2="200" strokeWidth="0.5" strokeDasharray="1, 3" />
                          <line x1="70" y1="0" x2="70" y2="200" strokeWidth="0.5" strokeDasharray="1, 3" />
                        </g>

                        {/* High-Tech stylized wireframe body skeleton */}
                        {/* Head */}
                        <circle cx="50" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-slate-600/40 dark:text-slate-700/60" />
                        <circle cx="50" cy="20" r="3" fill="currentColor" className="text-slate-600/20 dark:text-slate-700/30" />
                        
                        {/* Spine */}
                        <line x1="50" y1="29" x2="50" y2="105" stroke="currentColor" strokeWidth="1.5" className="text-slate-600/40 dark:text-slate-700/60" />
                        
                        {/* Chest Ribcage contours */}
                        <path d="M 44 48 C 44 48, 50 54, 56 48 M 42 60 C 42 60, 50 67, 58 60 M 44 72 C 44 72, 50 78, 56 72" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-600/25 dark:text-slate-700/40" />
                        
                        {/* Shoulders */}
                        <line x1="32" y1="42" x2="68" y2="42" stroke="currentColor" strokeWidth="2.5" className="text-slate-600/45 dark:text-slate-700/65" />
                        {/* Hips */}
                        <line x1="38" y1="105" x2="62" y2="105" stroke="currentColor" strokeWidth="2.5" className="text-slate-600/45 dark:text-slate-700/65" />
                        
                        {/* Arms with elbow joints */}
                        <g stroke="currentColor" strokeWidth="1.5" className="text-slate-600/40 dark:text-slate-700/60">
                          {/* Left arm */}
                          <line x1="32" y1="42" x2="27" y2="66" />
                          <line x1="27" y1="66" x2="22" y2="90" />
                          <circle cx="27" cy="66" r="1.5" fill="currentColor" />
                          
                          {/* Right arm */}
                          <line x1="68" y1="42" x2="73" y2="66" />
                          <line x1="73" y1="66" x2="78" y2="90" />
                          <circle cx="73" cy="66" r="1.5" fill="currentColor" />
                        </g>

                        {/* Legs with knee joints */}
                        <g stroke="currentColor" strokeWidth="1.5" className="text-slate-600/40 dark:text-slate-700/60">
                          {/* Left leg */}
                          <line x1="38" y1="105" x2="36" y2="145" />
                          <line x1="36" y1="145" x2="34" y2="180" />
                          <circle cx="36" cy="145" r="1.5" fill="currentColor" />
                          
                          {/* Right leg */}
                          <line x1="62" y1="105" x2="64" y2="145" />
                          <line x1="64" y1="145" x2="66" y2="180" />
                          <circle cx="64" cy="145" r="1.5" fill="currentColor" />
                        </g>

                        {/* Joint Highlights for Injuries (Glowing pulses) */}
                        
                        {/* Shoulder Injury */}
                        {shoulderActive && (
                          <g className="cursor-help">
                            <circle cx="32" cy="42" r="14" fill="url(#injuryGlow)" className="animate-pulse" />
                            <circle cx="32" cy="42" r="4.5" fill="#FF8FA0" stroke="#FFFFFF" strokeWidth="1.2" />
                          </g>
                        )}

                        {/* Lower Back Injury */}
                        {lowerBackActive && (
                          <g className="cursor-help">
                            <circle cx="50" cy="80" r="14" fill="url(#injuryGlow)" className="animate-pulse" />
                            <circle cx="50" cy="80" r="4.5" fill="#FF8FA0" stroke="#FFFFFF" strokeWidth="1.2" />
                          </g>
                        )}

                        {/* Ankle Injury */}
                        {ankleActive && (
                          <g className="cursor-help">
                            <circle cx="34" cy="180" r="14" fill="url(#injuryGlow)" className="animate-pulse" />
                            <circle cx="34" cy="180" r="4.5" fill="#FF8FA0" stroke="#FFFFFF" strokeWidth="1.2" />
                          </g>
                        )}

                        {/* Knee Injury */}
                        {kneeActive && (
                          <g className="cursor-help">
                            <circle cx="36" cy="145" r="14" fill="url(#injuryGlow)" className="animate-pulse" />
                            <circle cx="36" cy="145" r="4.5" fill="#FF8FA0" stroke="#FFFFFF" strokeWidth="1.2" />
                          </g>
                        )}

                        {/* Wrist Injury */}
                        {wristActive && (
                          <g className="cursor-help">
                            <circle cx="78" cy="90" r="14" fill="url(#injuryGlow)" className="animate-pulse" />
                            <circle cx="78" cy="90" r="4.5" fill="#FF8FA0" stroke="#FFFFFF" strokeWidth="1.2" />
                          </g>
                        )}

                        {/* Elbow Injury */}
                        {elbowActive && (
                          <g className="cursor-help">
                            <circle cx="73" cy="66" r="14" fill="url(#injuryGlow)" className="animate-pulse" />
                            <circle cx="73" cy="66" r="4.5" fill="#FF8FA0" stroke="#FFFFFF" strokeWidth="1.2" />
                          </g>
                        )}
                      </svg>
                    );
                  })()}
                </div>

                <div className="w-full grid grid-cols-2 gap-2 text-[10px] font-mono text-fittextdim mt-4 border-t border-solid border-white/5 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-600/80"></span>
                    <span>Load Allowed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-fitrose animate-pulse"></span>
                    <span>Safety Ban ⚠️</span>
                  </div>
                </div>
              </div>

              {/* Goal Evolution Stepper */}
              <div className="glass-panel p-[22px] flex-grow">
                <div className="w-full mb-6">
                  <h3 className="text-base font-display italic font-medium text-fittext">Goal Evolution Stepper</h3>
                  <p className="text-xs font-mono text-fittextdim">Historical goal transition checkpoints</p>
                </div>

                {/* Stepper list */}
                <div className="flex flex-col gap-6 relative pl-3 mt-2">
                  <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-white/10 dark:bg-white/5"></div>
                  
                  {stepperGoals.map((step, idx) => {
                    let circleColor = 'border-slate-500 bg-slate-800';
                    let titleColor = 'text-fittextdim';
                    let iconNode = null;

                    if (step.status === "achieved") {
                      circleColor = 'border-fitlime bg-fitlime/10';
                      titleColor = 'text-fittext font-semibold';
                      iconNode = <Check className="w-2.5 h-2.5 text-fitlime" />;
                    } else if (step.status === "active") {
                      circleColor = 'border-fitviolet bg-fitviolet/15 ring-2 ring-fitviolet/30';
                      titleColor = 'text-fitviolet font-bold';
                      iconNode = <Sparkles className="w-2.5 h-2.5 text-fitviolet" />;
                    } else {
                      circleColor = 'border-fitrose bg-fitrose/10';
                      titleColor = 'text-fitrose line-through decoration-red-400/50';
                      iconNode = <X className="w-2.5 h-2.5 text-fitrose" />;
                    }

                    return (
                      <div key={step.id} className="flex gap-4 items-center z-10">
                        <div className={`w-6 h-6 rounded-full border-2 border-solid flex items-center justify-center text-[10px] ${circleColor}`}>
                          {iconNode}
                        </div>
                        <div className="font-mono text-xs">
                          <h4 className={`${titleColor}`}>{step.name}</h4>
                          <span className="text-[10px] text-fittextdim">{step.date} - Status: <span className="uppercase font-semibold">{step.status}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Future API hooks comments block */}
        <div className="mt-8 border-t border-solid border-white/5 pt-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-fittextdim uppercase tracking-widest">
            <Layers className="w-3 h-3" />
            <span>Futuristic API Core: /api/v1/ai/memory/extract & /api/v1/ai/memory/query hooks structured</span>
          </div>
        </div>

        {/* ==========================================
            🎙️ RACHEL — AI COACH ASSISTANT SIDEBAR
            ========================================== */}
        
        {/* Floating Bubble Launcher */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {!isCoachOpen && (
            <button 
              onClick={() => {
                setIsCoachOpen(true);
                // Trigger an initial greeting speak when opened if not muted
                const currentHistory = coachChatHistories[selectedUser] || [];
                if (currentHistory.length > 0) {
                  speakText(currentHistory[currentHistory.length - 1].text);
                }
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-fitviolet to-fitteal p-[2px] shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 relative group border-none outline-none"
            >
              <div className="w-full h-full rounded-full bg-[#0A0F16] flex items-center justify-center relative">
                <Brain className="w-6 h-6 text-fitteal group-hover:text-fitlime transition-colors" />
                {/* Glowing status badge */}
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-fitrose rounded-full border-2 border-solid border-[#0A0F16] flex items-center justify-center text-[9px] font-bold text-white leading-none">1</span>
              </div>
              <span className="absolute right-16 bg-[#0A0F16] border border-white/10 text-white font-mono text-[9.5px] px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-xl whitespace-nowrap">
                TALK TO RACHEL
              </span>
            </button>
          )}
        </div>

        {/* Collapsible Panel Drawer */}
        <div 
          className={`fixed top-0 right-0 h-full w-[380px] max-w-[95vw] bg-[#0A0F16]/95 border-l border-solid border-white/10 dark:border-white/5 shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out backdrop-blur-2xl ${
            isCoachOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header Panel */}
          <div className="p-4 border-b border-solid border-white/10 flex items-center justify-between bg-black/25">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fitviolet to-fitteal flex items-center justify-center text-lg shadow">
                   Rachel
                </div>
                {/* Speaking/listening status indicator */}
                {(isSpeaking || isListening) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-fitlime rounded-full border-2 border-solid border-[#0A0F16] animate-ping"></span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-display italic font-semibold text-fittext leading-tight">Rachel</h3>
                <p className="text-[9px] font-mono uppercase tracking-[0.08em] text-fitteal font-bold">AI Health & Performance Coach</p>
              </div>
            </div>

            {/* Voice selection & Mute controls */}
            <div className="flex items-center gap-2">
              {/* Voice select */}
              <select 
                value={coachVoice}
                onChange={(e) => setCoachVoice(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-fittext focus:outline-none cursor-pointer"
                title="Select Rachel's Voice Tone"
              >
                <option value="calm">Calm Voice</option>
                <option value="energetic">Energetic Voice</option>
                <option value="robotic">Cybernetic Voice</option>
              </select>

              {/* Mute speaker */}
              <button 
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (nextMute) stopSpeaking();
                }}
                className={`p-1.5 rounded-lg border border-solid transition-all cursor-pointer ${
                  isMuted 
                    ? 'bg-fitrose/10 border-fitrose/30 text-fitrose' 
                    : 'bg-white/5 border-white/10 text-fittextdim hover:text-fittext'
                }`}
                title={isMuted ? "Unmute Voice Output" : "Mute Voice Output"}
              >
                {isMuted ? <EyeOff className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsCoachOpen(false);
                  stopSpeaking();
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-fitrose text-fittextdim hover:text-fitrose transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Equalizer Visual Waveform Area */}
          <div className="h-10 bg-black/15 flex items-center justify-center gap-1 border-b border-solid border-white/5 px-4">
            <span className="text-[8px] font-mono text-fittextdim uppercase tracking-wider mr-2">
              {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Standby"}
            </span>
            <div className="flex items-center gap-1 h-6">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isListening 
                      ? 'bg-fitrose animate-wave-' + (i + 1) 
                      : isSpeaking 
                      ? 'bg-fitteal animate-wave-' + (i + 1) 
                      : 'bg-slate-700 h-1.5'
                  }`}
                  style={{
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Message History Scroll Container */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {(coachChatHistories[selectedUser] || []).map((msg) => {
              const isUser = msg.sender === 'user';
              
              const hasMedicalAlert = msg.text.toLowerCase().includes('professional') || msg.text.toLowerCase().includes('doctor');
              const hasPlanAdjustment = msg.text.toLowerCase().includes('regenerate') || msg.text.toLowerCase().includes('simulator');
              const hasInjuryReport = msg.text.toLowerCase().includes('log') && msg.text.toLowerCase().includes('injury');

              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
                  <div 
                    onClick={() => {
                      if (!isUser) stopSpeaking(); // Click coach message to interrupt speech
                    }}
                    className={`max-w-[85%] rounded-2xl p-3 border border-solid text-xs leading-relaxed transition-all ${
                      isUser 
                        ? 'bg-fitviolet/15 border-fitviolet/30 text-white rounded-br-none font-sans' 
                        : 'bg-white/5 border-white/10 text-slate-200 rounded-bl-none font-sans cursor-pointer hover:border-white/20'
                    }`}
                    title={!isUser ? "Click message to mute audio" : ""}
                  >
                    <p>{msg.text}</p>
                    
                    {/* Inline Widget/Chips inside chat bubble */}
                    {!isUser && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-solid border-white/5 pt-2 text-[8px] font-mono tracking-wider">
                        <span className="text-fittextdim">{msg.time}</span>
                        {hasMedicalAlert && (
                          <span className="bg-fitrose/10 border border-fitrose/25 text-fitrose px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                            ⚠️ Medical Caution Nudge
                          </span>
                        )}
                        {hasPlanAdjustment && (
                          <span className="bg-fitlime/10 border border-fitlime/25 text-fitlime px-1.5 py-0.5 rounded font-bold uppercase">
                            ⚙️ Simulator Invoked
                          </span>
                        )}
                        {hasInjuryReport && (
                          <span className="bg-fitamber/10 border border-fitamber/25 text-fitamber px-1.5 py-0.5 rounded font-bold uppercase">
                            📁 Timeline Mutated
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking Indicator */}
            {isCoachThinking && (
              <div className="flex justify-start w-full">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 rounded-bl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-fitviolet rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-fitteal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-fitlime rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick-reply chip list */}
          <div className="p-3 border-t border-solid border-white/5 bg-black/10">
            <p className="text-[8.5px] font-mono text-fittextdim uppercase mb-2">Suggested Responses:</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin select-none">
              
              {/* Daily Briefing Chip */}
              <button 
                onClick={() => handleQuickReplyClick("briefing", "Rachel, show my daily briefing summary.")}
                className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-solid border-white/10 rounded-full px-2.5 py-1 text-[9.5px] font-mono text-slate-200 cursor-pointer transition-all hover:border-fitteal"
              >
                📊 Show briefing
              </button>

              {/* Workout Explanation Chip */}
              <button 
                onClick={() => handleQuickReplyClick("explain", "Why was my workout plan changed?")}
                className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-solid border-white/10 rounded-full px-2.5 py-1 text-[9.5px] font-mono text-slate-200 cursor-pointer transition-all hover:border-fitteal"
              >
                ❓ Why this exercise?
              </button>

              {/* Soreness Logging Chip */}
              <button 
                onClick={() => handleQuickReplyClick("soreness", `I feel sore in my ${activeUser.injuredArea !== 'none' ? activeUser.injuredArea : 'shoulder'} today.`)}
                className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-solid border-white/10 rounded-full px-2.5 py-1 text-[9.5px] font-mono text-slate-200 cursor-pointer transition-all hover:border-fitrose"
              >
                💥 Log joint pain
              </button>

              {/* Injury Resolved Chip */}
              <button 
                onClick={() => handleQuickReplyClick("resolved", `My active ${activeUser.injuredArea !== 'none' ? activeUser.injuredArea : 'knee'} pain is resolved.`)}
                className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-solid border-white/10 rounded-full px-2.5 py-1 text-[9.5px] font-mono text-slate-200 cursor-pointer transition-all hover:border-fitlime"
              >
                ✅ Mark injury resolved
              </button>

              {/* Plan Regeneration Chip */}
              <button 
                onClick={() => handleQuickReplyClick("regenerate", "Regenerate my plan for a short 15 minute workout today.")}
                className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-solid border-white/10 rounded-full px-2.5 py-1 text-[9.5px] font-mono text-slate-200 cursor-pointer transition-all hover:border-fitgold"
              >
                ⚡ 15 min workout
              </button>
            </div>
          </div>

          {/* Chat input box */}
          <form onSubmit={handleCoachInputSubmit} className="p-4 border-t border-solid border-white/10 bg-black/25 flex gap-2 items-center">
            {/* Microphone Button */}
            <button 
              type="button"
              onClick={startSpeechRecognition}
              className={`p-2.5 rounded-xl border border-solid flex items-center justify-center cursor-pointer transition-all relative ${
                isListening 
                  ? 'bg-fitrose border-fitrose/40 text-white animate-pulse' 
                  : 'bg-white/5 border-white/10 text-fittextdim hover:text-fittext hover:border-fitteal'
              }`}
              title="Tap mic to dictate message"
            >
              <Brain className={`w-4 h-4 ${isListening ? 'animate-spin' : ''}`} />
            </button>

            {/* Text Input */}
            <input 
              type="text" 
              value={coachInputText}
              onChange={(e) => setCoachInputText(e.target.value)}
              placeholder="Ask Rachel about your workouts..."
              className="flex-grow bg-black/40 border border-solid border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-fitteal font-sans text-white placeholder-slate-500"
            />

            {/* Send Button */}
            <button 
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-tr from-fitviolet to-fitteal hover:from-fitviolet/90 hover:to-fitteal/90 text-white border-none cursor-pointer flex items-center justify-center"
            >
              <Zap className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
