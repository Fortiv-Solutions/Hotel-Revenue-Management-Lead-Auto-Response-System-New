import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface RevenueSnapshotProps {
  dateRange: { from: Date; to: Date; label: string } | null;
}

const RevenueSnapshot = ({ dateRange }: RevenueSnapshotProps) => {
  const [data, setData] = useState<{ day: string; Direct: number; OTA: number; Corp: number }[]>([]);
  const [stats, setStats] = useState({
    adr: 0,
    totalRev: 0,
    totalBookings: 0,
    checkedIn: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      let query = supabase.from("bookings").select("total_amount_inr, check_in_date, status, booking_source");

      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte("check_in_date", dateRange.from.toISOString())
          .lte("check_in_date", dateRange.to.toISOString());
      }

      const { data: bookings } = await query;

      if (bookings) {
        const dayMap: Record<string, { Direct: number; OTA: number; Corp: number }> = {};
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

        days.forEach(day => dayMap[day] = { Direct: 0, OTA: 0, Corp: 0 });

        bookings.forEach((b) => {
          if (!b.check_in_date) return;
          const date = new Date(b.check_in_date);
          const day = days[date.getDay()];
          const amt = Number(b.total_amount_inr) || 0;
          
          const source = b.booking_source?.toLowerCase() || "";
          if (source.includes("direct")) dayMap[day].Direct += amt;
          else if (source.includes("corporate") || source.includes("tcs") || source.includes("infosys")) dayMap[day].Corp += amt;
          else dayMap[day].OTA += amt;
        });

        const chartData = days.map((day) => ({ day, ...dayMap[day] }));
        setData(chartData);

        const totalRev = bookings.reduce((sum, b) => sum + (Number(b.total_amount_inr) || 0), 0);
        const count = bookings.length;
        const adr = count > 0 ? Math.round(totalRev / count) : 0;
        const checkedIn = bookings.filter((b) => b.status === "Checked-in").length;

        setStats({ adr, totalRev, totalBookings: count, checkedIn });
      }
      setLoading(false);
    };

    fetchRevenue();
  }, [dateRange]);

  const occupancyPct = stats.totalBookings > 0
    ? Math.round((stats.checkedIn / stats.totalBookings) * 100)
    : 0;

  return (
    <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border p-5 flex flex-col h-full shadow-xl">
      <h2 className="text-base font-bold text-foreground mb-4">Revenue Breakdown Snapshot</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-secondary/40 rounded-xl p-3 text-center border border-border/50">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Total Rev</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {loading ? "..." : `₹${stats.totalRev.toLocaleString("en-IN")}`}
          </p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-3 text-center border border-border/50">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Bookings</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {loading ? "..." : stats.totalBookings}
          </p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-3 text-center border border-border/50">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">ADR</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {loading ? "..." : `₹${stats.adr.toLocaleString("en-IN")}`}
          </p>
        </div>
      </div>

      {/* 3D Area Chart */}
      <div className="flex-1 min-h-[160px] relative mt-2 mb-2">
        {loading ? (
          <div className="h-[140px] flex items-center justify-center text-muted-foreground text-xs animate-pulse">Loading vectors...</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDirect" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-green))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-green))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOTA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-orange))" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="hsl(var(--chart-orange))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCorp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-blue))" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="hsl(var(--chart-blue))" stopOpacity={0} />
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.3)" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontWeight: 600, letterSpacing: 1 }}
                dy={10}
              />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "16px",
                  fontSize: "12px",
                  padding: "12px",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ fontWeight: "bold" }}
                cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area type="monotone" dataKey="Corp" stackId="1" stroke="hsl(var(--chart-blue))" strokeWidth={2} fill="url(#gradCorp)" animationDuration={1000} />
              <Area type="monotone" dataKey="OTA" stackId="1" stroke="hsl(var(--chart-orange))" strokeWidth={2} fill="url(#gradOTA)" animationDuration={1000} />
              <Area type="monotone" dataKey="Direct" stackId="1" stroke="hsl(var(--chart-green))" strokeWidth={3} fill="url(#gradDirect)" filter="url(#shadow)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Occupancy</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-lg font-black text-foreground">
              {loading ? "..." : `${occupancyPct}%`}
            </p>
            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${occupancyPct}%` }} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Checked In</p>
          <p className="text-lg font-black text-foreground">
            {loading ? "..." : `${stats.checkedIn}/${stats.totalBookings}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueSnapshot;
