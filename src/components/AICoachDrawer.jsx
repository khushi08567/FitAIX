import React, { useState, useEffect, useRef } from 'react';
import { Brain, Volume2, VolumeX, Send, Sparkles, X, User, Bot, CheckCircle, RefreshCw } from 'lucide-react';

export default function AICoachDrawer({ isOpen, onClose, selectedUser, chatHistory, onSendMessage, activeInjury, recoveryScore }) {
  const [inputText, setInputText] = useState('');
  const [voiceMode, setVoiceMode] = useState('calm'); // calm, energetic, robotic
  const [isMuted, setIsMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, chatHistory]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isThinking) return;
    const msg = inputText;
    setInputText('');
    setIsThinking(true);

    // Call parent handler which appends user message & simulates streaming AI reply
    onSendMessage(msg, voiceMode);
    setTimeout(() => {
      setIsThinking(false);
    }, 800);
  };

  const quickPrompts = [
    `Why was my workout modified for ${selectedUser}?`,
    `How does my ${recoveryScore}% recovery impact today's volume?`,
    `Generate a hotel gym workout scenario for me`,
    `Explain the exercise dependency graph`
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 border-l border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Rachel</span>
              <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-300 text-[10px] font-mono rounded-full border border-teal-500/30">
                AI Coach
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Context: {selectedUser} • {recoveryScore}% Rec
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Voice Mode Selector */}
          <select
            value={voiceMode}
            onChange={(e) => setVoiceMode(e.target.value)}
            className="bg-slate-800 text-slate-300 text-xs font-mono rounded-lg px-2 py-1 border border-slate-700 focus:outline-none"
          >
            <option value="calm">🎙️ Calm Voice</option>
            <option value="energetic">⚡ Energetic</option>
            <option value="robotic">🤖 Analytical</option>
          </select>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-lg border transition-colors ${isMuted ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
            title={isMuted ? "Unmute Coach Voice" : "Mute Coach Voice"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Context Banner */}
      {activeInjury && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Active Context: {activeInjury.summary}
          </span>
          <span className="text-[10px] text-amber-400/80">Guardrail Active</span>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {chatHistory && chatHistory.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id || idx}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                isUser
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isUser ? selectedUser : 'Rachel (AI)'}
                  </span>
                  <span>{msg.time || 'Just now'}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-line text-sm">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-bl-none px-4 py-3 text-slate-400 flex items-center space-x-2 text-xs font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span>Rachel is analyzing context & generating response...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-[11px] text-slate-400 font-mono mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span>Quick Prompts</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(p);
              }}
              className="text-[11px] bg-slate-800/70 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 px-2.5 py-1 rounded-lg border border-slate-700/50 hover:border-teal-500/30 transition-all font-mono text-left truncate max-w-full"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center space-x-2">
        <input
          type="text"
          placeholder={`Ask Rachel about your ${selectedUser} workouts...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/60 font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-teal-500/20 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
