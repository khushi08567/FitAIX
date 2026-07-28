import React from 'react';
import { Check } from 'lucide-react';

export function EquipmentSelector({ selected = [], onChange }) {
  const allEquipment = [
    { id: 'barbell', label: 'Barbell & Plates' },
    { id: 'dumbbell', label: 'Dumbbells' },
    { id: 'cable', label: 'Cable Machine' },
    { id: 'machine', label: 'Gym Machines' },
    { id: 'rack', label: 'Squat Power Rack' },
    { id: 'bench', label: 'Adjustable Bench' },
    { id: 'kettlebell', label: 'Kettlebells' },
    { id: 'resistance_band', label: 'Resistance Bands' },
    { id: 'pull_up_bar', label: 'Pull-Up Bar' },
    { id: 'bodyweight_only', label: 'Bodyweight Only' }
  ];

  const toggleEq = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
      {allEquipment.map((eq) => {
        const isSel = selected.includes(eq.id);
        return (
          <button
            type="button"
            key={eq.id}
            onClick={() => toggleEq(eq.id)}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              isSel
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-400 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500'
            }`}
          >
            <span className="truncate">{eq.label}</span>
            {isSel && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
