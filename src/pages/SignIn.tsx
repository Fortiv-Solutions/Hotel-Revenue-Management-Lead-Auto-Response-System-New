import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Building2, Tags, CalendarCheck, TrendingUp, Users, BellRing } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8F9FC]">

      {/* ═══════════ LEFT PANEL — Hero Image + Overlay ═══════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden rounded-r-[40px]">
        {/* Background image */}
        <img
          src="/hotel-hero.png"
          alt="Luxury Hotel Lobby"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-slate-900/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white text-lg font-bold tracking-tight">Fortiv HotelOS</span>
              <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                Revenue Management Platform
              </p>
            </div>
          </div>

          {/* Center value prop */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/80 font-medium">Revenue dashboard synced in real-time</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Your complete
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                revenue command
              </span>
              <br />
              center awaits.
            </h2>

            <p className="text-base text-white/55 leading-relaxed max-w-md mb-10">
              Dynamic pricing engine, booking analytics, corporate account management, and upsell automation — everything you need to optimize ADR, occupancy, and total revenue.
            </p>

            {/* Feature modules available */}
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {[
                { icon: TrendingUp, text: "Revenue Dashboard" },
                { icon: Tags, text: "Pricing Engine" },
                { icon: CalendarCheck, text: "Booking Analytics" },
                { icon: Users, text: "Corporate Accounts" },
                { icon: TrendingUp, text: "Upsell & Upgrade" },
                { icon: BellRing, text: "Pre-arrival Alerts" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2.5 bg-white/6 backdrop-blur-xl border border-white/10 rounded-xl px-3.5 py-2.5">
                  <f.icon className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="text-xs text-white/65 font-semibold">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats strip */}
          <div className="flex gap-8 items-end">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">6</span>
              <span className="text-[10px] text-white/40 font-medium mt-0.5 uppercase tracking-wider">Modules</span>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">Real-time</span>
              <span className="text-[10px] text-white/40 font-medium mt-0.5 uppercase tracking-wider">Supabase Sync</span>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">AI</span>
              <span className="text-[10px] text-white/40 font-medium mt-0.5 uppercase tracking-wider">Powered Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL — Light Sign In Form ═══════════ */}


      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 relative bg-[#F8F9FC]">
        {/* Subtle ambient shapes */}
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-violet-200/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[250px] h-[250px] bg-blue-200/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-800 text-lg font-bold">Fortiv HotelOS</span>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sign In</h1>
              <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Secure SSL</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Enter your credentials to access the dashboard.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@hotel.com"
                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all hover:border-slate-300 shadow-sm"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Password</label>
                <button type="button" className="text-xs text-violet-500 font-semibold hover:text-violet-600 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all hover:border-slate-300 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-violet-200/60 hover:shadow-violet-300/60 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {isLoading ? (
                <div className="flex items-center gap-3 relative z-10">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  Sign in to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-350 mt-8 font-medium">
            Don't have an account?{" "}
            <button className="text-violet-500 hover:text-violet-600 font-semibold transition-colors">
              Request access
            </button>
          </p>

          <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-center gap-6 text-[11px] text-slate-400">
            <span>© 2026 Fortiv Solutions. All rights reserved.</span>
          </div>


        </div>
      </div>
    </div>
  );
};

export default SignIn;
