import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Activity } from 'lucide-react';

const DEFAULT_CONDITIONS = [
  { id: 'c1', name: 'Hypertension', category: 'Cardiovascular' },
  { id: 'c2', name: 'Type 2 Diabetes', category: 'Metabolic' },
  { id: 'c3', name: 'Knee ACL Tear (Post-Op)', category: 'Orthopedic' },
  { id: 'c4', name: 'Lower Back Sciatica', category: 'Spine/Nerve' },
  { id: 'c5', name: 'Shoulder Impingement', category: 'Orthopedic' },
  { id: 'c6', name: 'Asthma', category: 'Respiratory' },
  { id: 'c7', name: 'Cervical Spondylosis', category: 'Orthopedic' },
  { id: 'c8', name: 'Plantars Fasciitis', category: 'Podiatry' }
];

export function ConditionAutocomplete({
  selectedConditions = [],
  onChange,
  onSelectCondition,
  onRemoveCondition
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef();

  const filtered = query.trim() === ''
    ? DEFAULT_CONDITIONS
    : DEFAULT_CONDITIONS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cond) => {
    if (onSelectCondition) {
      onSelectCondition(cond);
    } else if (onChange) {
      const condName = typeof cond === 'string' ? cond : cond.name;
      if (!selectedConditions.some(s => (typeof s === 'string' ? s : s.name) === condName)) {
        onChange([...selectedConditions, condName]);
      }
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (cond) => {
    if (onRemoveCondition) {
      onRemoveCondition(cond);
    } else if (onChange) {
      const condName = typeof cond === 'string' ? cond : cond.name;
      onChange(selectedConditions.filter(s => (typeof s === 'string' ? s : s.name) !== condName));
    }
  };

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          placeholder="e.g. ACL, Sciatica, Rotator Cuff, Hypertension..."
          className="w-full p-3 pl-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
      </div>

      {isOpen && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-1 p-2">
          {filtered.length > 0 ? (
            filtered.map((cond) => {
              const isSelected = selectedConditions.some(s => (typeof s === 'string' ? s : s.name) === cond.name);
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => handleSelect(cond)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-400 font-bold'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{cond.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {cond.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-slate-500">
              No matching condition found.
            </div>
          )}
        </div>
      )}

      {selectedConditions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedConditions.map((cond, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <span>{typeof cond === 'string' ? cond : cond.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(cond)}
                className="p-0.5 hover:text-rose-400 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
