import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Download, IndianRupee, BedDouble, BarChart3, Users, Target,
  MapPin, AlertTriangle, TrendingUp, TrendingDown,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, ComposedChart, Bar, Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";

// ── Types ───────────────────────────────────────────────────────────────────
interface RevenueAnalyticsRow {
  date: string;
  total_revenue_inr: number;
  room_revenue_inr: number;
  ancillary_revenue_inr: number;
  upsell_revenue_inr: number;
  adr_inr: number;
  revpar_inr: number;
  revpar_target_inr: number;
  occupancy_pct: number;
  bookings_direct: number;
  bookings_ota: number;
  bookings_corporate: number;
  ota_commission_paid_inr: number;
  direct_booking_ratio_pct: number;
}

interface OccupancyRow {
  date: string;
  total_rooms: number;
  occupied_rooms: number;
  occupancy_pct: number;
  demand_level: string;
  walk_ins: number;
  cancellations: number;
  no_shows: number;
}

interface LocalEvent {
  id: string;
  event_name: string;
  event_type: string;
  city: string;
  date: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number): string => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

const fmtShortDate = (d: string): string => {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const CHANNEL_COLORS: Record<string, string> = {
  Direct: "#10b981",
  OTA: "#f59e0b",
  Corporate: "#6366f1",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  conference: "bg-blue-50 text-blue-600 border-blue-100",
  festival: "bg-amber-50 text-amber-600 border-amber-100",
  sports: "bg-green-50 text-green-600 border-green-100",
  exhibition: "bg-violet-50 text-violet-600 border-violet-100",
};

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
  padding: "10px 14px",
};

// ── Skeleton ────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
    <div className="h-3 bg-slate-100 rounded w-24 mb-3" />
    <div className="h-7 bg-slate-100 rounded w-32 mb-2" />
    <div className="h-3 bg-slate-100 rounded w-20" />
  </div>
);

const ChartSkeleton = ({ height = 260 }: { height?: number }) => (
  <div className="flex items-center justify-center animate-pulse" style={{ height }}>
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 rounded-full border-[3px] border-teal-200 border-t-teal-500 animate-spin" />
      <span className="text-xs text-slate-400 font-medium">Loading data…</span>
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
      <BarChart3 className="w-5 h-5 text-slate-300" />
    </div>
    <p className="text-sm text-slate-400 font-medium">{message}</p>
    <p className="text-xs text-slate-300 mt-1">Add data in Supabase to see analytics here.</p>
  </div>
);

// ── Dashboard ───────────────────────────────────────────────────────────────
const RevenueDashboard = () => {
  const [revenueData, setRevenueData] = useState<RevenueAnalyticsRow[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyRow[]>([]);
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date; label: string } | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        let revQuery = supabase
          .from("revenue_analytics_daily")
          .select("date, total_revenue_inr, room_revenue_inr, ancillary_revenue_inr, upsell_revenue_inr, adr_inr, revpar_inr, revpar_target_inr, occupancy_pct, bookings_direct, bookings_ota, bookings_corporate, ota_commission_paid_inr, direct_booking_ratio_pct")
          .order("date", { ascending: true });

        let occQuery = supabase
          .from("occupancy_daily")
          .select("date, total_rooms, occupied_rooms, occupancy_pct, demand_level, walk_ins, cancellations, no_shows")
          .order("date", { ascending: true });

        let evtQuery = supabase
          .from("local_events")
          .select("id, event_name, event_type, city, date")
          .order("date", { ascending: true });

        if (dateRange?.from && dateRange?.to) {
          const from = dateRange.from.toISOString().slice(0, 10);
          const to = dateRange.to.toISOString().slice(0, 10);
          revQuery = revQuery.gte("date", from).lte("date", to);
          occQuery = occQuery.gte("date", from).lte("date", to);
          evtQuery = evtQuery.gte("date", from).lte("date", to);
        }

        const [revRes, occRes, evtRes] = await Promise.all([revQuery, occQuery, evtQuery]);

        if (revRes.error) setErrorMsg(`Revenue Error: ${revRes.error.message}`);
        else if (occRes.error) setErrorMsg(`Occupancy Error: ${occRes.error.message}`);
        else if (evtRes.error) setErrorMsg(`Events Error: ${evtRes.error.message}`);
        else setErrorMsg(null);

        setRevenueData((revRes.data as RevenueAnalyticsRow[]) ?? []);
        setOccupancyData((occRes.data as OccupancyRow[]) ?? []);
        setEvents((evtRes.data as LocalEvent[]) ?? []);
      } catch (err: any) {
        setErrorMsg(`Fetch Exception: ${err.message}`);
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [dateRange]);

  // ── Derived KPIs ───────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    if (revenueData.length === 0) return null;
    const len = revenueData.length;

    const totalRevenue = revenueData.reduce((s, r) => s + (r.total_revenue_inr || 0), 0);
    const avgAdr = revenueData.reduce((s, r) => s + (r.adr_inr || 0), 0) / len;
    const avgRevpar = revenueData.reduce((s, r) => s + (r.revpar_inr || 0), 0) / len;
    const avgRevparTarget = revenueData.reduce((s, r) => s + (r.revpar_target_inr || 0), 0) / len;
    const avgOccupancy = revenueData.reduce((s, r) => s + (r.occupancy_pct || 0), 0) / len;
    const avgDirectPct = revenueData.reduce((s, r) => s + (r.direct_booking_ratio_pct || 0), 0) / len;
    const totalOtaCommission = revenueData.reduce((s, r) => s + (r.ota_commission_paid_inr || 0), 0);
    const totalDirect = revenueData.reduce((s, r) => s + (r.bookings_direct || 0), 0);
    const totalOta = revenueData.reduce((s, r) => s + (r.bookings_ota || 0), 0);
    const totalCorp = revenueData.reduce((s, r) => s + (r.bookings_corporate || 0), 0);

    return {
      totalRevenue,
      avgAdr: Math.round(avgAdr),
      avgRevpar: Math.round(avgRevpar),
      avgRevparTarget: Math.round(avgRevparTarget),
      avgOccupancy: Math.round(avgOccupancy * 10) / 10,
      avgDirectPct: Math.round(avgDirectPct * 10) / 10,
      totalOtaCommission,
      totalDirect,
      totalOta,
      totalCorp,
      revparVsTarget: avgRevparTarget > 0
        ? Math.round(((avgRevpar - avgRevparTarget) / avgRevparTarget) * 100)
        : 0,
    };
  }, [revenueData]);

  // ── Chart Data ─────────────────────────────────────────────────────────
  const revenueTrendData = useMemo(() =>
    revenueData.map((r) => ({
      date: fmtShortDate(r.date),
      Room: r.room_revenue_inr || 0,
      Ancillary: r.ancillary_revenue_inr || 0,
      Upsell: r.upsell_revenue_inr || 0,
    })),
  [revenueData]);

  const occupancyTrendData = useMemo(() =>
    occupancyData.map((o) => ({
      date: fmtShortDate(o.date),
      occupancy: o.occupancy_pct || 0,
      demand: o.demand_level || "normal",
    })),
  [occupancyData]);

  const channelMixData = useMemo(() => {
    if (!kpis) return [];
    const total = kpis.totalDirect + kpis.totalOta + kpis.totalCorp;
    if (total === 0) return [];
    return [
      { name: "Direct", value: kpis.totalDirect, pct: Math.round((kpis.totalDirect / total) * 100), color: CHANNEL_COLORS.Direct },
      { name: "OTA", value: kpis.totalOta, pct: Math.round((kpis.totalOta / total) * 100), color: CHANNEL_COLORS.OTA },
      { name: "Corporate", value: kpis.totalCorp, pct: Math.round((kpis.totalCorp / total) * 100), color: CHANNEL_COLORS.Corporate },
    ];
  }, [kpis]);

  const revparTrendData = useMemo(() =>
    revenueData.map((r) => ({
      date: fmtShortDate(r.date),
      Actual: r.revpar_inr || 0,
      Target: r.revpar_target_inr || 0,
    })),
  [revenueData]);

  // ── KPI Card Config ────────────────────────────────────────────────────
  const kpiCards = kpis
    ? [
        {
          label: "Total Revenue",
          value: fmtCurrency(kpis.totalRevenue),
          sub: `${revenueData.length} days`,
          icon: IndianRupee,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-600",
        },
        {
          label: "ADR",
          value: `₹${kpis.avgAdr.toLocaleString("en-IN")}`,
          sub: "Avg daily rate",
          icon: BarChart3,
          iconBg: "bg-violet-50",
          iconColor: "text-violet-600",
        },
        {
          label: "RevPAR",
          value: `₹${kpis.avgRevpar.toLocaleString("en-IN")}`,
          sub: kpis.revparVsTarget >= 0
            ? `${kpis.revparVsTarget}% above target`
            : `${Math.abs(kpis.revparVsTarget)}% below target`,
          icon: Target,
          iconBg: "bg-teal-50",
          iconColor: "text-teal-600",
          trend: kpis.revparVsTarget >= 0 ? "up" : "down",
        },
        {
          label: "Occupancy",
          value: `${kpis.avgOccupancy}%`,
          sub: kpis.avgOccupancy >= 70 ? "Healthy" : kpis.avgOccupancy >= 50 ? "Moderate" : "Needs attention",
          icon: BedDouble,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
          pct: kpis.avgOccupancy,
          trend: kpis.avgOccupancy >= 60 ? "up" : "down",
        },
        {
          label: "Direct Booking",
          value: `${kpis.avgDirectPct}%`,
          sub: `${kpis.totalDirect} direct of ${kpis.totalDirect + kpis.totalOta + kpis.totalCorp}`,
          icon: Users,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600",
          trend: kpis.avgDirectPct >= 30 ? "up" : "down",
        },
      ]
    : [];

  return (
    <DashboardLayout>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Revenue Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Financial overview • All data from Supabase
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker onRangeChange={setDateRange} />
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          🚨 Supabase Query Failed: {errorMsg}
        </div>
      )}

      {/* ── KPI STRIP ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : kpiCards.length === 0
          ? (
            <div className="col-span-full">
              <EmptyState message="No revenue data found for this period" />
            </div>
          )
          : kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-slate-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {kpi.label}
                </p>
                <div className={`w-8 h-8 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {kpi.value}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                {kpi.trend && (
                  kpi.trend === "up"
                    ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                    : <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={`text-[11px] font-semibold ${
                  kpi.trend === "up" ? "text-emerald-500" : kpi.trend === "down" ? "text-red-400" : "text-slate-400"
                }`}>
                  {kpi.sub}
                </span>
              </div>
              {kpi.pct !== undefined && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      kpi.pct >= 70
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                        : kpi.pct >= 50
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                    }`}
                    style={{ width: `${Math.min(100, kpi.pct)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
      </div>

      {/* ── REVENUE TREND (Full-Width) ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-700">Revenue Trend</h3>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-[3px] bg-teal-500 rounded-full inline-block" /> Room
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-[3px] bg-violet-400 rounded-full inline-block" /> Ancillary
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-[3px] bg-amber-400 rounded-full inline-block" /> Upsell
            </span>
          </div>
        </div>
        {kpis && (
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-extrabold text-slate-800">
              {fmtCurrency(kpis.totalRevenue)}
            </span>
            <span className="text-xs text-slate-400">total for period</span>
          </div>
        )}

        {loading ? (
          <ChartSkeleton height={260} />
        ) : revenueTrendData.length === 0 ? (
          <EmptyState message="No revenue data for this period" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="roomFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ancillaryFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="upsellFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#94a3b8", fontWeight: 600, fontSize: 11 }}
                formatter={(value: number, name: string) => [fmtCurrency(value), name]}
              />
              <Area type="monotone" dataKey="Room" stroke="#14b8a6" strokeWidth={2} fill="url(#roomFill)" stackId="1" />
              <Area type="monotone" dataKey="Ancillary" stroke="#8b5cf6" strokeWidth={2} fill="url(#ancillaryFill)" stackId="1" />
              <Area type="monotone" dataKey="Upsell" stroke="#f59e0b" strokeWidth={2} fill="url(#upsellFill)" stackId="1" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── ROW 2: Occupancy Trend + Channel Mix ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

        {/* Occupancy Trend */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Occupancy Trend</h3>
              {kpis && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Avg: <span className="font-bold text-slate-600">{kpis.avgOccupancy}%</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Occupancy %</span>
            </div>
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : occupancyTrendData.length === 0 ? (
            <EmptyState message="No occupancy data for this period" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={occupancyTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="occFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`${value}%`, "Occupancy"]}
                />
                <Area
                  type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2.5}
                  fill="url(#occFill)" dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#3b82f6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Channel Mix + OTA Commission */}
        <div className="lg:col-span-5 space-y-6">
          {/* Channel Distribution */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Channel Distribution</h3>
            {loading ? (
              <ChartSkeleton height={160} />
            ) : channelMixData.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">No channel data</div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie
                        data={channelMixData} cx="50%" cy="50%"
                        innerRadius={42} outerRadius={65}
                        dataKey="value" stroke="none"
                      >
                        {channelMixData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5">
                  {channelMixData.map((ch) => (
                    <div key={ch.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ch.color }} />
                        <span className="text-xs text-slate-500 font-medium">{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{ch.value} bookings</span>
                        <span className="text-xs font-bold text-slate-700">{ch.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* OTA Commission Alert */}
          {kpis && kpis.totalOtaCommission > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    OTA Commission Paid
                  </p>
                  <p className="text-xl font-extrabold text-amber-700 mt-1">
                    {fmtCurrency(kpis.totalOtaCommission)}
                  </p>
                  <p className="text-[11px] text-amber-600/70 mt-1">
                    Actual commissions paid across {kpis.totalOta} OTA bookings
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3: RevPAR vs Target + Upcoming Events ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* RevPAR vs Target */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700">RevPAR vs Target</h3>
              {kpis && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Avg: <span className="font-bold text-slate-600">₹{kpis.avgRevpar.toLocaleString("en-IN")}</span>
                  {" "}/ Target: <span className="font-bold text-slate-600">₹{kpis.avgRevparTarget.toLocaleString("en-IN")}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-teal-500 rounded-[3px] inline-block" /> Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-[2px] bg-red-400 rounded-full inline-block" /> Target
              </span>
            </div>
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : revparTrendData.length === 0 ? (
            <EmptyState message="No RevPAR data for this period" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={revparTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [`₹${Math.round(value).toLocaleString("en-IN")}`, name]}
                />
                <Bar dataKey="Actual" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="Target" stroke="#f87171" strokeWidth={2} strokeDasharray="6 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Local Events</h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {loading ? "…" : `${events.length} events`}
            </span>
          </div>

          {loading ? (
            <ChartSkeleton height={200} />
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-2">
                <MapPin className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No events in this period</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {events.map((evt) => {
                const typeClass = EVENT_TYPE_COLORS[evt.event_type?.toLowerCase()] || "bg-slate-50 text-slate-600 border-slate-100";
                return (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{evt.event_name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {fmtShortDate(evt.date)} • {evt.city}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border shrink-0 ${typeClass}`}>
                      {evt.event_type || "Event"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="mt-10 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-300">
        © 2026 Fortiv Solutions. All rights reserved.
      </div>
    </DashboardLayout>
  );
};

export default RevenueDashboard;
