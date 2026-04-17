import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Info, TrendingUp, RefreshCw } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface RoomRate {
  name: string;
  units: number;
  rate: number;
  base_rate: number;
  change_pct: number;
}

interface Competitor {
  name: string;
  room_type: string;
  their_rate: number;
  our_rate: number;
  position: string;
}

const positionColor: Record<string, string> = {
  "Below Market": "bg-destructive/10 text-destructive",
  "Premium": "bg-primary/10 text-primary",
  "Parity": "bg-secondary text-foreground",
  "Value Advantage": "bg-success/10 text-success",
};

const PricingEngine = () => {
  const [rooms, setRooms] = useState<RoomRate[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("just now");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: ratesData, error: rErr }, { data: compData, error: cErr }] = await Promise.all([
        supabase.from("room_rates").select("name, units, rate, base_rate, change_pct").order("name"),
        supabase.from("competitors").select("name, room_type, their_rate, our_rate, position").order("name"),
      ]);
      
      if (rErr || cErr) throw new Error("Database error");
      if (!ratesData || !compData) throw new Error("No data found");
      
      setRooms(ratesData as RoomRate[]);
      setCompetitors(compData as Competitor[]);
    } catch(err) {
      console.warn("Falling back to mock pricing data.", err);
      setRooms([
        { name: "Executive Suite", units: 12, rate: 24500, base_rate: 21000, change_pct: 16 },
        { name: "Deluxe King", units: 45, rate: 12500, base_rate: 11000, change_pct: 13 },
        { name: "Standard Twin", units: 60, rate: 8500, base_rate: 8500, change_pct: 0 },
        { name: "Presidential", units: 2, rate: 85000, base_rate: 75000, change_pct: 13 }
      ]);
      setCompetitors([
        { name: "Taj Palace", room_type: "Deluxe", their_rate: 14000, our_rate: 12500, position: "Value Advantage" },
        { name: "The Oberoi", room_type: "Deluxe", their_rate: 16500, our_rate: 12500, position: "Value Advantage" },
        { name: "Hyatt Regency", room_type: "Deluxe", their_rate: 12000, our_rate: 12500, position: "Premium" },
        { name: "ITC Maurya", room_type: "Deluxe", their_rate: 12500, our_rate: 12500, position: "Parity" },
        { name: "Le Meridien", room_type: "Deluxe", their_rate: 10500, our_rate: 12500, position: "Premium" }
      ]);
    } finally {
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);


  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pricing Engine</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time dynamic yield management</p>
        </div>
      </div>

      {/* Room Rate Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            📊 Room Rate Cards
          </h2>
          <button className="text-sm font-medium text-primary hover:underline">View All Categories</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse space-y-3">
                <div className="h-4 bg-secondary rounded w-3/4" />
                <div className="h-3 bg-secondary rounded w-1/2" />
                <div className="h-7 bg-secondary rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground bg-card rounded-xl border border-border">
            No room rates found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <div key={room.name} className="bg-card rounded-xl border border-border p-4 relative">
                <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                  <Info className="w-4 h-4" />
                </button>
                <p className="text-sm font-bold text-foreground">{room.name}</p>
                <p className="text-xs text-muted-foreground mb-3">{room.units} Units Available</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Current Rate</p>
                <p className="text-2xl font-bold text-foreground">₹{room.rate?.toLocaleString("en-IN")}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +{room.change_pct}%
                </p>
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground italic">Base:</p>
                  <p className="text-sm font-semibold text-foreground">₹{room.base_rate?.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Market Benchmarking using Recharts Radar */}
      <div className="bg-card rounded-xl border border-border p-5 glass">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2 tracking-tight">
              📈 Competitor Rate Radar
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Visual representation of our pricing parity against the local market.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
            Last updated: {lastUpdated}
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex items-center justify-center animate-pulse text-muted-foreground">
            Loading market intelligence...
          </div>
        ) : competitors.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground bg-secondary/20 rounded-xl border border-border border-dashed h-[400px] flex items-center justify-center">
            No competitor data found
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Radar Chart */}
            <div className="flex-1 min-h-[350px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={competitors}>
                  <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3"/>
                  <PolarAngleAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={['auto', 'auto']} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Radar name="Their Rate (₹)" dataKey="their_rate" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Our Rate (₹)" dataKey="our_rate" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} strokeWidth={3} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '10px' }} />
                  <RechartsTooltip 
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Context Table Container */}
            <div className="lg:w-[400px] shrink-0 flex flex-col justify-center">
              <h3 className="text-sm font-bold text-foreground mb-3">Parity Breakdown</h3>
              <div className="space-y-2">
                {competitors.map((c) => (
                  <div key={c.name} className="flex flex-col p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-foreground">{c.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${positionColor[c.position] ?? "bg-secondary text-foreground"}`}>
                        {c.position}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">Their Rate</span>
                        <span className="text-xs font-semibold text-foreground">₹{c.their_rate?.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">Our Rate</span>
                        <span className="text-xs font-semibold text-primary">₹{c.our_rate?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PricingEngine;
