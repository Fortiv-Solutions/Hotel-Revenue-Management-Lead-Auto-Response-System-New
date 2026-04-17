import { useEffect, useState } from "react";
import { Eye, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Opportunity {
  booking_ref: string;
  guest: string;
  upgrade: string;
  price: string;
}

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-muted text-muted-foreground",
  "bg-success/20 text-success",
];

const getInitials = (name: string) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

const UpsellOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      const { data } = await supabase
        .from("upsell_offers")
        .select("booking_ref, guest, upgrade, price")
        .eq("accepted", false)
        .order("sent_at", { ascending: false })
        .limit(3);

      if (data) setOpportunities(data as Opportunity[]);
      setLoading(false);
    };
    fetchOpportunities();
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h2 className="text-base font-bold text-foreground mb-4">Upsell Opportunities</h2>
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg animate-pulse">
              <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-secondary rounded w-28" />
                <div className="h-2.5 bg-secondary rounded w-20" />
              </div>
            </div>
          ))
        ) : opportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No pending upsell opportunities.</p>
        ) : (
          opportunities.map((opp, idx) => (
            <div
              key={opp.booking_ref}
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
            >
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarFallback className={`text-xs font-semibold ${avatarColors[idx % avatarColors.length]}`}>
                  {getInitials(opp.guest)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{opp.guest}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {opp.upgrade?.replace("→", " → ")} • {opp.price}
                </p>
              </div>
              <Button
                size="sm"
                className="h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Send Offer
              </Button>
              <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                <Eye className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpsellOpportunities;
