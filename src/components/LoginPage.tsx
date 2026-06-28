import React, { useState } from "react";
import { Zap, Shield, Key, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onGoBack: () => void;
}

export default function LoginPage({ onLoginSuccess, onGoBack }: LoginPageProps) {
  const [email, setEmail] = useState("karthikmateti2007@gmail.com");
  const [password, setPassword] = useState("********");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API Auth verification
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        email,
        displayName: "Karthik Mateti",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80",
        uid: "pilot-user-123"
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050608] bg-radial-[at_top_right] from-[#1a1f2c] via-[#050608] to-[#050608] text-slate-100 flex flex-col justify-center items-center px-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/5 bg-[#0B0D11]/80 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-950/50 mb-4">
            <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Flight Deck Authorization</h2>
          <p className="mt-2 text-xs font-mono text-slate-500">
            SECURE ACCESS &bull; PROTOCOL ACTIVE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Pilot Identifier (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#12151C]/60 border border-white/5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
              required
              placeholder="pilot@deadlinepilot.ai"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Security Key (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#12151C]/60 border border-white/5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-sans pt-1">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition-colors">
              <input type="checkbox" defaultChecked className="rounded border-white/5 bg-[#12151C] text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
              Remember authorization
            </label>
            <span className="hover:text-slate-300 hover:underline cursor-pointer">Recover Key</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin"></span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Authorize Session
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3">
          <button
            onClick={onGoBack}
            className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300 transition-colors font-sans cursor-pointer"
          >
            &larr; Return to Runway Overview
          </button>
        </div>
      </div>
    </div>
  );
}
