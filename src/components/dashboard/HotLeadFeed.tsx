import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type ChannelType = "WhatsApp" | "Instagram" | "FB Messenger" | "Website" | string;

interface Lead {
  id: number;
  name: string;
  channel: ChannelType;
  preview: string;
  created_at: string;
  status: string;
}

const channelColors: Record<string, string> = {
  whatsapp: "bg-whatsapp text-primary-foreground",
  instagram: "bg-instagram text-primary-foreground",
  "fb messenger": "bg-facebook text-primary-foreground",
};

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-destructive/20 text-destructive",
  "bg-success/20 text-success",
  "bg-accent text-accent-foreground",
  "bg-muted text-muted-foreground",
];

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const HotLeadFeed = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, channel, preview, created_at, status")
        .eq("status", "HOT")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setLeads(data as Lead[]);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">Hot Lead Feed</h2>
        <button className="text-sm font-medium text-primary hover:underline">View All</button>
      </div>
      <div className="space-y-1 flex-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-secondary rounded w-32" />
                <div className="h-2.5 bg-secondary rounded w-full" />
              </div>
            </div>
          ))
        ) : leads.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            No hot leads right now.
          </div>
        ) : (
          leads.map((lead, idx) => (
            <div
              key={lead.id}
              className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
            >
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarFallback className={`text-xs font-semibold ${avatarColors[idx % avatarColors.length]}`}>
                  {getInitials(lead.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{lead.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${channelColors[lead.channel?.toLowerCase()] ?? "bg-secondary text-foreground"}`}
                  >
                    {lead.channel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{lead.preview}</p>
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap mr-2">
                {timeAgo(lead.created_at)}
              </span>
              <Button
                size="sm"
                className="shrink-0 h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Call Now
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HotLeadFeed;
