import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, TrendingUp, Phone, X } from "lucide-react";

interface Notification {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    title: "OTA Commission Alert",
    description: "OTA commission leakage exceeded ₹50K this week. Consider boosting direct channel.",
    time: "12 min ago",
    unread: true,
  },
  {
    id: "2",
    icon: TrendingUp,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    title: "Revenue Milestone",
    description: "Monthly revenue crossed ₹12L — 18% above last month.",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: "3",
    icon: Phone,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    title: "AI Call Completed",
    description: "Follow-up call to Infosys corporate contact completed successfully.",
    time: "3 hrs ago",
    unread: false,
  },
  {
    id: "4",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    title: "Booking Confirmed",
    description: "Suite reservation #4821 confirmed via MakeMyTrip.",
    time: "5 hrs ago",
    unread: false,
  },
];

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label="Notifications"
        id="notification-bell"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full px-1 notif-badge-pop">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] bg-card rounded-2xl border border-border shadow-2xl z-50 notif-panel-enter overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.map((notif, idx) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/50 ${
                  notif.unread ? "bg-primary/[0.03]" : ""
                } ${idx < notifications.length - 1 ? "border-b border-border/50" : ""}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`w-9 h-9 rounded-xl ${notif.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <notif.icon className={`w-4 h-4 ${notif.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{notif.title}</p>
                    {notif.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border text-center">
            <button className="text-xs font-medium text-primary hover:underline">
              View all activity
            </button>
          </div>
        </div>
      )}

      <style>{`
        .notif-badge-pop {
          animation: notifBadgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes notifBadgePop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .notif-panel-enter {
          animation: notifPanelIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes notifPanelIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;
