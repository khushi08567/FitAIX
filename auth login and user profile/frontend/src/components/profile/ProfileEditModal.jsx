import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const GOAL_TYPE_OPTIONS = [
  { id: 'muscle_gain', label: 'Muscle Gain', unit: 'kg' },
  { id: 'weight_loss', label: 'Weight Loss', unit: 'kg' },
  { id: 'endurance', label: 'Endurance', unit: 'km' },
  { id: 'strength', label: 'Strength', unit: 'kg' },
  { id: 'general_fitness', label: 'General Fitness', unit: '' }
];

export function ProfileEditModal({ user, onClose }) {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    age: user?.profile?.age ?? '',
    gender: user?.profile?.gender || 'male',
    height: user?.profile?.height ?? '',
    weight: user?.profile?.weight ?? '',
    bodyFatPercentage: user?.profile?.bodyFatPercentage ?? '',
    fitnessLevel: user?.profile?.fitnessLevel || 'intermediate',
    activityLevel: user?.profile?.activityLevel || 'moderate'
  });

  const [goal, setGoal] = useState({
    type: user?.currentGoal?.type || 'muscle_gain',
    targetValue: user?.currentGoal?.targetValue ?? '',
    startValue: user?.currentGoal?.startValue ?? '',
    unit: user?.currentGoal?.unit || 'kg',
    deadline: user?.currentGoal?.deadline ? user.currentGoal.deadline.split('T')[0] : ''
  });

  const [preferences, setPreferences] = useState({
    dietType: user?.preferences?.dietType || 'omnivore',
    budget: user?.preferences?.budget || 'medium',
    cookingSkill: user?.preferences?.cookingSkill || 'intermediate'
  });

  const [allergies, setAllergies] = useState((user?.healthProfile?.allergies || []).join(', '));

  const handleSave = async () => {
    setSaving(true);
    const numeric = (v) => (v === '' || v === null ? undefined : Number(v));
    const result = await dispatch(updateProfile({
      profile: {
        age: numeric(profile.age),
        gender: profile.gender,
        height: numeric(profile.height),
        weight: numeric(profile.weight),
        bodyFatPercentage: numeric(profile.bodyFatPercentage),
        fitnessLevel: profile.fitnessLevel,
        activityLevel: profile.activityLevel
      },
      currentGoal: {
        type: goal.type,
        targetValue: numeric(goal.targetValue),
        startValue: numeric(goal.startValue),
        unit: goal.unit,
        deadline: goal.deadline ? new Date(goal.deadline) : undefined
      },
      preferences,
      healthProfile: {
        allergies: allergies.split(',').map(a => a.trim()).filter(Boolean)
      }
    }));

    setSaving(false);
    if (!result.error) {
      toast.success('Profile updated successfully');
      onClose();
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <h3 className="text-lg font-bold text-slate-100">Edit User Profile</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Biometrics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Physical Metrics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={e => setProfile({ ...profile, age: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400">Height (cm)</label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={e => setProfile({ ...profile, height: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400">Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={e => setProfile({ ...profile, weight: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Fitness & Activity Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400">Fitness Level</label>
              <select
                value={profile.fitnessLevel}
                onChange={e => setProfile({ ...profile, fitnessLevel: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:border-cyan-500 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="athlete">Athlete</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400">Activity Level</label>
              <select
                value={profile.activityLevel}
                onChange={e => setProfile({ ...profile, activityLevel: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:border-cyan-500 focus:outline-none"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
          </div>

          {/* Current Goal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Goal Configuration</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400">Goal Type</label>
                <select
                  value={goal.type}
                  onChange={e => {
                    const opt = GOAL_TYPE_OPTIONS.find(o => o.id === e.target.value);
                    setGoal({ ...goal, type: e.target.value, unit: opt?.unit || 'kg' });
                  }}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:border-cyan-500 focus:outline-none"
                >
                  {GOAL_TYPE_OPTIONS.map(o => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400">Target Value</label>
                <input
                  type="number"
                  value={goal.targetValue}
                  onChange={e => setGoal({ ...goal, targetValue: e.target.value })}
                  placeholder={`e.g. 75 ${goal.unit}`}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
