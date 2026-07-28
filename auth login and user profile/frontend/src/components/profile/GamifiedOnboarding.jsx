import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import { EquipmentSelector } from './EquipmentSelector';
import { GoalSetting } from './GoalSetting';
import { ConditionAutocomplete } from './ConditionAutocomplete';
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const ARCHETYPES = [
  {
    id: 'juggernaut',
    name: 'Strength Juggernaut',
    tagline: 'Heavy Overload & Raw Power',
    desc: 'Specialized in progressive weightlifting, compound movements, and maximal strength development.',
    color: '#3B82F6',
    bonusStats: { strength: 15, endurance: 5, mobility: 0, consistency: 10, recovery: 5 }
  },
  {
    id: 'sentinel',
    name: 'Endurance Sentinel',
    tagline: 'High Stamina & Aerobic Resilience',
    desc: 'Designed for marathon runners, rowers, and high-volume stamina athletes.',
    color: '#10B981',
    bonusStats: { strength: 5, endurance: 15, mobility: 10, consistency: 10, recovery: 5 }
  },
  {
    id: 'monk',
    name: 'Mobility Monk',
    tagline: 'Joint Health & Movement Control',
    desc: 'Focused on functional movement, yoga, bodyweight mastery, and longevity.',
    color: '#8B5CF6',
    bonusStats: { strength: 5, endurance: 5, mobility: 20, consistency: 10, recovery: 10 }
  }
];

export function GamifiedOnboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    archetype: ARCHETYPES[0],
    profile: {
      age: 26,
      gender: 'male',
      height: 175,
      weight: 72,
      bodyFatPercentage: 18,
      fitnessLevel: 'intermediate',
      activityLevel: 'moderate'
    },
    equipment: ['barbell', 'dumbbell', 'bench'],
    goal: 'muscle_gain',
    dietType: 'omnivore',
    chronicConditions: [],
    allergies: []
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const payload = {
        onboardingCompleted: true,
        profile: formData.profile,
        equipment: formData.equipment,
        currentGoal: { type: formData.goal, startValue: formData.profile.weight },
        preferences: { dietType: formData.dietType },
        gamification: { archetype: formData.archetype },
        healthProfile: {
          chronicConditions: formData.chronicConditions.map(c => typeof c === 'string' ? { condition: c } : c),
          allergies: formData.allergies
        }
      };

      const res = await dispatch(updateProfile(payload));
      setSubmitting(false);

      if (!res.error) {
        toast.success('Onboarding complete! Welcome aboard.');
        navigate('/profile');
      } else {
        toast.error(res.payload || 'Failed to complete onboarding');
      }
    } catch (err) {
      setSubmitting(false);
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 font-sans">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase">Step {step} of 4</span>
          <h2 className="text-xl font-bold text-slate-100">
            {step === 1 && 'Select Your Fitness Archetype'}
            {step === 2 && 'Physical Biometrics & Activity'}
            {step === 3 && 'Available Equipment & Target Goal'}
            {step === 4 && 'Health Profile & Dietary Preference'}
          </h2>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`w-8 h-2 rounded-full transition-all ${s <= step ? 'bg-cyan-500' : 'bg-slate-800'}`} />
          ))}
        </div>
      </div>

      {/* Step 1: Archetype */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">Choose your core training focus to initialize custom stat bonuses.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ARCHETYPES.map((arch) => {
              const isSel = formData.archetype?.id === arch.id;
              return (
                <button
                  type="button"
                  key={arch.id}
                  onClick={() => setFormData({ ...formData, archetype: arch })}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    isSel ? 'bg-cyan-950/60 border-cyan-500 text-slate-100 ring-1 ring-cyan-500' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-5 h-5 text-cyan-400" />
                    {isSel && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">{arch.name}</h3>
                  <p className="text-[11px] text-cyan-400 font-medium mb-2">{arch.tagline}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{arch.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Biometrics */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Age</label>
              <input
                type="number"
                value={formData.profile.age}
                onChange={e => setFormData({ ...formData, profile: { ...formData.profile, age: Number(e.target.value) } })}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Height (cm)</label>
              <input
                type="number"
                value={formData.profile.height}
                onChange={e => setFormData({ ...formData, profile: { ...formData.profile, height: Number(e.target.value) } })}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Weight (kg)</label>
              <input
                type="number"
                value={formData.profile.weight}
                onChange={e => setFormData({ ...formData, profile: { ...formData.profile, weight: Number(e.target.value) } })}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Fitness Level</label>
              <select
                value={formData.profile.fitnessLevel}
                onChange={e => setFormData({ ...formData, profile: { ...formData.profile, fitnessLevel: e.target.value } })}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:border-cyan-500 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="athlete">Athlete</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Activity Level</label>
              <select
                value={formData.profile.activityLevel}
                onChange={e => setFormData({ ...formData, profile: { ...formData.profile, activityLevel: e.target.value } })}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:border-cyan-500 focus:outline-none"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Equipment & Goals */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Available Equipment</h4>
            <EquipmentSelector
              selected={formData.equipment}
              onChange={(eq) => setFormData({ ...formData, equipment: eq })}
            />
          </div>

          <div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Target Fitness Goal</h4>
            <GoalSetting
              currentGoal={formData.goal}
              onChange={(g) => setFormData({ ...formData, goal: g })}
            />
          </div>
        </div>
      )}

      {/* Step 4: Health Profile */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Medical Conditions or Injury History</h4>
            <ConditionAutocomplete
              selectedConditions={formData.chronicConditions}
              onChange={(conds) => setFormData({ ...formData, chronicConditions: conds })}
            />
          </div>

          <div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Dietary Preference</h4>
            <select
              value={formData.dietType}
              onChange={e => setFormData({ ...formData, dietType: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:border-cyan-500 focus:outline-none"
            >
              <option value="omnivore">Omnivore</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
            </select>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={step === 1}
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-30 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            Next Step <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? 'Saving Profile...' : 'Complete Onboarding'}
          </button>
        )}
      </div>
    </div>
  );
}
