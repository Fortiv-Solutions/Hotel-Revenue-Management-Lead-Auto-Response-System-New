import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  Tags,
  Settings,
  CalendarCheck,
  Building2,
  TrendingUp,
  BellRing,
  LogOut,
} from "lucide-react";

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Tags, label: "Pricing Engine", path: "/pricing" },
  { icon: CalendarCheck, label: "Bookings", path: "/bookings" },
  { icon: Building2, label: "Corporate Accounts", path: "/corporate" },
  { icon: TrendingUp, label: "Upsell & Upgrade", path: "/upsell" },
  { icon: BellRing, label: "Pre-arrival", path: "/pre-arrival" },
];

export const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] min-h-screen bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-200/50">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold text-slate-800 tracking-tight leading-none">HotelOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-teal-500 rounded-r-full" />
              )}
              <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 space-y-0.5">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
            location.pathname === "/settings"
              ? "bg-teal-50 text-teal-700"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
