import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../redux/slices/authSlice';
import { User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const result = await dispatch(registerUser({ name, email, password }));
    if (!result.error) {
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create Your Account</h1>
          <p className="text-xs text-slate-400">Join FitAI to initialize your fitness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Full Name</label>
            <div className="relative mt-1">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full p-3 pl-10 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium focus:border-cyan-500 focus:outline-none"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full p-3 pl-10 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium focus:border-cyan-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative mt-1">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-3 pl-10 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium focus:border-cyan-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
