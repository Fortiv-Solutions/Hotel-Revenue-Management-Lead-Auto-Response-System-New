import { useEffect, useState } from "react";
import { AlertTriangle, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Account {
  company: string;
  status: string;
  contract_expiry?: string;
  last_contacted?: string;
}

const CorporateAlerts = () => {
  const [expiring, setExpiring] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from("corporate_accounts")
        .select("company, status, contract_expiry, last_contacted")
        .eq("status", "Expiring Soon")
        .order("contract_expiry")
        .limit(3);

      if (data) setExpiring(data as Account[]);
      setLoading(false);
    };
    fetchAlerts();
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h2 className="text-base font-bold text-foreground">Corporate Contract Alerts</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-3.5 bg-secondary rounded w-40" />
              <div className="h-3 bg-secondary rounded w-full" />
              <div className="h-7 bg-secondary rounded w-28" />
            </div>
          ))}
        </div>
      ) : expiring.length === 0 ? (
        <p className="text-sm text-muted-foreground">No contracts expiring soon.</p>
      ) : (
        <div className="space-y-4">
          {expiring.map((acc, idx) => (
            <div key={acc.company} className={`space-y-2 ${idx > 0 ? "pt-3 border-t border-border" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{acc.company}</span>
                <span className="text-[10px] font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                  {acc.contract_expiry ? `Expiring ${new Date(acc.contract_expiry).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}` : "Expiring Soon"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Contract renewal required.{acc.last_contacted ? ` Last contacted ${new Date(acc.last_contacted).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}.` : " No recent activity recorded."}
              </p>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Trigger Call
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorporateAlerts;
