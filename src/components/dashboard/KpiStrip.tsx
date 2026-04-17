import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  CalendarCheck,
  DollarSign,
  Flame,
  BarChart3,
  ArrowUpRight,
  Zap,
  Target,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface KpiStripProps {
  dateRange: { from: Date; to: Date; label: string } | null;
}

const KpiStrip = ({ dateRange }: KpiStripProps) => {
  const [liveStats, setLiveStats] = useState({
    totalLeads: 0,
    hotLeads: 0,
    totalRev: 0,
    directPct: 0,
    totalBookings: 0,
    occupancyPct: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Fetch Leads
      let leadsQuery = supabase.from("leads").select("status", { count: "exact" });
      if (dateRange?.from && dateRange?.to) {
        leadsQuery = leadsQuery
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());
      }
      const { count: leadCount, data: leadData } = await leadsQuery;

      // Fetch Bookings for Revenue, Direct Booking %, and Occupancy
      let bookingsQuery = supabase.from("bookings").select("total_amount_inr, booking_source, status");
      if (dateRange?.from && dateRange?.to) {
        bookingsQuery = bookingsQuery
          .gte("check_in_date", dateRange.from.toISOString())
          .lte("check_in_date", dateRange.to.toISOString());
      }
      const { data: bookingData } = await bookingsQuery;

      const totalRev = (bookingData || []).reduce((sum, b) => sum + (Number(b.total_amount_inr) || 0), 0);
      const directCount = (bookingData || []).filter(
        (b) => b.booking_source?.toLowerCase().includes("direct")
      ).length;
      const totalBookings = (bookingData || []).length;
      const directPct = totalBookings > 0 ? Math.round((directCount / totalBookings) * 100) : 0;

      // Occupancy: checked-in + confirmed as % of total bookings
      const activeBookings = (bookingData || []).filter(
        (b) => b.status === "Checked-in" || b.status === "Confirmed"
      ).length;
      const occupancyPct = totalBookings > 0 ? Math.round((activeBookings / totalBookings) * 100) : 0;

      const hotLeads = (leadData || []).filter((l: any) => l.status === "HOT").length;

      setLiveStats({
        totalLeads: leadCount || 0,
        hotLeads,
        totalRev,
        directPct,
        totalBookings,
        occupancyPct,
      });
      setLoading(false);
    };

    fetchStats();
  }, [dateRange]);

  const fmtRevenue = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${n.toLocaleString("en-IN")}`;

  const hotLeadPct = liveStats.totalLeads > 0
    ? `${Math.round((liveStats.hotLeads / liveStats.totalLeads) * 100)}%`
    : "0%";

  const cards = [
    {
      label: "Total Leads",
      value: loading ? "..." : String(liveStats.totalLeads),
      icon: Users,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-600",
      borderAccent: "border-l-blue-500",
      link: "/leads",
    },
    {
      label: "Hot Leads",
      value: loading ? "..." : String(liveStats.hotLeads),
      icon: Flame,
      iconBg: "bg-red-500/15",
      iconColor: "text-red-500",
      borderAccent: "border-l-red-500",
      link: "/leads",
      highlight: true,
    },
    {
      label: "Total Bookings",
      value: loading ? "..." : String(liveStats.totalBookings),
      icon: CalendarCheck,
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-600",
      borderAccent: "border-l-violet-500",
      link: "/bookings",
    },
    {
      label: "Direct Booking",
      value: loading ? "..." : `${liveStats.directPct}%`,
      icon: Target,
      iconBg: "bg-teal-500/15",
      iconColor: "text-teal-600",
      borderAccent: "border-l-teal-500",
      link: "/bookings",
    },
    {
      label: dateRange?.label === "This Week" || !dateRange ? "This Week's Rev" : "Period Rev",
      value: loading ? "..." : fmtRevenue(liveStats.totalRev),
      icon: DollarSign,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-600",
      borderAccent: "border-l-emerald-500",
      link: "/revenue",
    },
    {
      label: "Occupancy",
      value: loading ? "..." : `${liveStats.occupancyPct}%`,
      icon: BarChart3,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-600",
      borderAccent: "border-l-amber-500",
      link: "/revenue",
      progressValue: liveStats.occupancyPct,
    },
    {
      label: "Hot Lead %",
      value: loading ? "..." : hotLeadPct,
      icon: Zap,
      iconBg: "bg-orange-500/15",
      iconColor: "text-orange-500",
      borderAccent: "border-l-orange-500",
      link: "/leads",
    },
    {
      label: "Total Revenue",
      value: loading ? "..." : fmtRevenue(liveStats.totalRev),
      icon: TrendingUp,
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-600",
      borderAccent: "border-l-indigo-500",
      link: "/revenue",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {cards.map((card, idx) => (
        <Link
          key={card.label}
          to={card.link}
          className={`group relative bg-card rounded-xl border border-border border-l-[3px] ${card.borderAccent} px-4 py-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 kpi-card-entrance`}
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="relative z-10">
            {/* Icon */}
            <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center mb-2`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>

            {/* Value */}
            <p className={`text-lg font-bold tracking-tight ${card.highlight ? "text-destructive" : "text-foreground"} flex items-center gap-1`}>
              {card.value}
              {card.progressValue !== undefined && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              )}
            </p>

            {/* Label */}
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">{card.label}</p>

            {/* Optional progress bar for occupancy */}
            {card.progressValue !== undefined && (
              <div className="w-full h-1 bg-secondary rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-700"
                  style={{ width: loading ? "0%" : `${card.progressValue}%` }}
                />
              </div>
            )}

            {/* Hover arrow */}
            <ArrowUpRight className="absolute top-0 right-0 w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </Link>
      ))}

      <style>{`
        .kpi-card-entrance {
          animation: kpiCardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes kpiCardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default KpiStrip;
