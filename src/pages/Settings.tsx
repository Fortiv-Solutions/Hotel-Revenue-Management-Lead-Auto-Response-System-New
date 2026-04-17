import DashboardLayout from "@/components/DashboardLayout";
import { Settings as SettingsIcon, Sparkles } from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="settings-blob settings-blob-1" />
          <div className="settings-blob settings-blob-2" />
          <div className="settings-blob settings-blob-3" />
        </div>

        {/* Glassmorphism Card */}
        <div className="relative z-10 flex flex-col items-center text-center p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl max-w-md w-full settings-card-entrance">
          {/* Animated icon ring */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center settings-icon-pulse">
              <SettingsIcon className="w-9 h-9 text-primary settings-icon-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
            Settings Coming Soon
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            We're crafting a powerful settings experience for you. Property configuration, team management, and integrations — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Property Config", "Team Roles", "Integrations", "Notifications"].map((feat) => (
              <span
                key={feat}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/15"
              >
                {feat}
              </span>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="w-full mt-8">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
              <span>Development Progress</span>
              <span className="font-semibold text-primary">72%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 settings-progress-animate"
                style={{ width: "72%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scoped animations */}
      <style>{`
        .settings-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .settings-blob-1 {
          width: 300px; height: 300px;
          background: hsl(var(--primary));
          top: 10%; left: 15%;
          animation: settingsFloat 12s ease-in-out infinite;
        }
        .settings-blob-2 {
          width: 250px; height: 250px;
          background: hsl(142 71% 45%);
          bottom: 15%; right: 10%;
          animation: settingsFloat 15s ease-in-out infinite reverse;
        }
        .settings-blob-3 {
          width: 200px; height: 200px;
          background: hsl(38 92% 50%);
          top: 50%; left: 60%;
          animation: settingsFloat 10s ease-in-out infinite 2s;
        }
        @keyframes settingsFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .settings-icon-spin {
          animation: settingsSpin 8s linear infinite;
        }
        @keyframes settingsSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .settings-icon-pulse {
          animation: settingsPulse 3s ease-in-out infinite;
        }
        @keyframes settingsPulse {
          0%, 100% { box-shadow: 0 0 0 0 hsla(var(--primary), 0.15); }
          50% { box-shadow: 0 0 0 12px hsla(var(--primary), 0); }
        }
        .settings-card-entrance {
          animation: settingsCardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes settingsCardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .settings-progress-animate {
          animation: settingsProgressGrow 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }
        @keyframes settingsProgressGrow {
          from { width: 0%; }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Settings;
