import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { ProfileEditModal } from './ProfileEditModal';
import { EquipmentSelector } from './EquipmentSelector';
import { Trophy, Edit2, LogOut, ShieldAlert, Dumbbell, Activity, User, Heart, Settings } from 'lucide-react';

export function GamifiedProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showEdit, setShowEdit] = useState(false);

  const profile = user?.profile || {};
  const goal = user?.currentGoal || {};
  const gamification = user?.gamification || {};
  const archetype = gamification?.archetype || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100 font-sans p-4">
      {/* Header Profile Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xl overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">{user?.name || 'User Profile'}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-extrabold uppercase">
                {archetype?.name || 'Athlete'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEdit(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all border border-slate-700"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
          <button
            onClick={() => dispatch(logout())}
            className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs font-bold flex items-center gap-2 transition-all border border-rose-900/40"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Biometrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age</span>
          <p className="text-lg font-extrabold text-slate-100">{profile.age ? `${profile.age} yrs` : 'N/A'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Height</span>
          <p className="text-lg font-extrabold text-slate-100">{profile.height ? `${profile.height} cm` : 'N/A'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weight</span>
          <p className="text-lg font-extrabold text-slate-100">{profile.weight ? `${profile.weight} kg` : 'N/A'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fitness Level</span>
          <p className="text-lg font-extrabold text-cyan-400 capitalize">{profile.fitnessLevel || 'Intermediate'}</p>
        </div>
      </div>

      {/* Goal & Preferences */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Trophy className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm text-slate-100">Target Goal Configuration</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Goal Type</span>
            <p className="font-bold text-slate-100 capitalize mt-1">{goal.type?.replace('_', ' ') || 'Muscle Gain'}</p>
          </div>
          <div>
            <span className="text-slate-400">Target Value</span>
            <p className="font-bold text-slate-100 mt-1">{goal.targetValue ? `${goal.targetValue} ${goal.unit || ''}` : 'Not set'}</p>
          </div>
          <div>
            <span className="text-slate-400">Activity Level</span>
            <p className="font-bold text-slate-100 capitalize mt-1">{profile.activityLevel?.replace('_', ' ') || 'Moderate'}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && <ProfileEditModal user={user} onClose={() => setShowEdit(false)} />}
    </div>
  );
}
