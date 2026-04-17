import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Expand } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ChannelKey = "Instagram" | "WhatsApp" | "Website" | "Messenger" | "Calls";

const channels: ChannelKey[] = ["Instagram", "WhatsApp", "Website", "Messenger", "Calls"];

const shades = [
  "hsl(217, 91%, 75%)",
  "hsl(217, 91%, 60%)",
  "hsl(217, 91%, 48%)",
  "hsl(217, 91%, 36%)",
  "hsl(217, 91%, 25%)",
];

const channelMap: Record<string, ChannelKey> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  website: "Website",
  messenger: "Messenger",
  calls: "Calls",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
            {p.dataKey}
          </span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-border mt-1.5 pt-1.5 flex justify-between font-semibold text-foreground">
        <span>Total Leads</span>
        <span>{total}</span>
      </div>
    </div>
  );
};

const ChannelLeadsChart = () => {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from("leads")
        .select("channel, created_at");

      if (data) {
        // Group by week number and channel
        const weekMap: Record<string, Record<ChannelKey, number>> = {
          "Week 1": { Instagram: 0, WhatsApp: 0, Website: 0, Messenger: 0, Calls: 0 },
          "Week 2": { Instagram: 0, WhatsApp: 0, Website: 0, Messenger: 0, Calls: 0 },
          "Week 3": { Instagram: 0, WhatsApp: 0, Website: 0, Messenger: 0, Calls: 0 },
          "Week 4": { Instagram: 0, WhatsApp: 0, Website: 0, Messenger: 0, Calls: 0 },
        };

        data.forEach((lead) => {
          const date = new Date(lead.created_at);
          const day = date.getDate();
          const week = day <= 7 ? "Week 1" : day <= 14 ? "Week 2" : day <= 21 ? "Week 3" : "Week 4";
          const ch = channelMap[lead.channel?.toLowerCase()] ?? "Website";
          if (weekMap[week]) weekMap[week][ch]++;
        });

        const formatted = Object.entries(weekMap).map(([week, counts]) => ({ week, ...counts }));
        setWeeklyData(formatted);
        setTotalLeads(data.length);
      }
      setLoading(false);
    };
    fetchLeads();
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">Incoming Leads</h2>
        <button className="text-muted-foreground hover:text-foreground">
          <Expand className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-[220px]">
        {loading ? (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-xs">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
              {channels.map((ch, i) => (
                <Bar key={ch} dataKey={ch} stackId="leads" fill={shades[i]} radius={i === channels.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
        {channels.map((ch, i) => (
          <div key={ch} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: shades[i] }} />
            <span>{ch}</span>
          </div>
        ))}
        <span className="ml-auto font-semibold text-foreground">Total: {totalLeads}</span>
      </div>
    </div>
  );
};

export default ChannelLeadsChart;
