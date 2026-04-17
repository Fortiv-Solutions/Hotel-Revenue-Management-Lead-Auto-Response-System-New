import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Send, CheckCircle, TrendingUp, IndianRupee } from "lucide-react";
import { CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UpsellEntry {
    booking_ref: string;
    guest: string;
    upgrade: string;
    price: string;
    channel: "WhatsApp" | "Email";
    sent_at: string;
    accepted: boolean;
    revenue: string;
    variant?: "A" | "B";
}

const parseAmount = (val: string | null): number => {
    if (!val) return 0;
    return Number(val.replace(/[₹,]/g, "")) || 0;
};

const fmtDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const UpsellUpgrades = () => {
    const [entries, setEntries] = useState<UpsellEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data, error } = await supabase
                    .from("upsell_offers")
                    .select("booking_ref, guest, upgrade, price, channel, sent_at, accepted, revenue, variant")
                    .order("sent_at", { ascending: false });

                if (error) throw error;
                if (!data || data.length === 0) throw new Error("No data");
                
                setEntries(data as UpsellEntry[]);
            } catch (err) {
                console.error("Failed to fetch upsell data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // ── Derived KPIs ──
    const totalSent = entries.length;
    const totalAccepted = entries.filter((e) => e.accepted).length;
    const cvr = totalSent > 0 ? ((totalAccepted / totalSent) * 100).toFixed(1) : "0";
    const totalRevenue = entries.reduce((s, e) => s + parseAmount(e.revenue), 0);

    const topStats = [
        { label: "OFFERS SENT", value: loading ? "…" : String(totalSent), icon: Send, iconBg: "bg-blue-50", iconColor: "text-blue-400" },
        { label: "ACCEPTED", value: loading ? "…" : String(totalAccepted), icon: CheckCircle, iconBg: "bg-green-50", iconColor: "text-green-500" },
        { label: "CONVERSION RATE", value: loading ? "…" : `${cvr}%`, icon: TrendingUp, iconBg: "bg-green-50", iconColor: "text-green-500" },
        { label: "REVENUE GAINED", value: loading ? "…" : `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, iconBg: "bg-blue-50", iconColor: "text-blue-400" },
    ];

    // ── A/B Variant stats ──
    const varA = entries.filter((e) => e.variant === "A");
    const varB = entries.filter((e) => e.variant === "B");
    const varAAccepted = varA.filter((e) => e.accepted).length;
    const varBAccepted = varB.filter((e) => e.accepted).length;
    const varACvr = varA.length > 0 ? Math.round((varAAccepted / varA.length) * 100) : 0;
    const varBCvr = varB.length > 0 ? Math.round((varBAccepted / varB.length) * 100) : 0;
    const varARev = varA.reduce((s, e) => s + parseAmount(e.revenue), 0);
    const varBRev = varB.reduce((s, e) => s + parseAmount(e.revenue), 0);
    const diffPp = varACvr - varBCvr;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Upsell &amp; Upgrades</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Track upsell offer performance and A/B variant results</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {topStats.map((s) => (
                    <div key={s.label} className="bg-card rounded-xl border border-border p-5 flex items-start justify-between">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
                            <p className="text-3xl font-bold text-foreground">{s.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}>
                            <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* A/B Variant Performance */}
            <div className="mb-2">
                <h2 className="text-base font-bold text-foreground mb-3">A/B Variant Performance</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Variant A */}
                    <div className={`bg-card rounded-xl border-2 p-5 relative ${varACvr >= varBCvr ? "border-green-500" : "border-border"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-base font-bold text-foreground">Variant A</p>
                            {varACvr >= varBCvr && varA.length > 0 && (
                                <span className="text-xs font-bold bg-green-500 text-white px-2.5 py-1 rounded-full">Winner</span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-y-3">
                            <div><p className="text-xs text-muted-foreground mb-0.5">Sent</p><p className="text-sm font-semibold text-foreground">{varA.length}</p></div>
                            <div><p className="text-xs text-muted-foreground mb-0.5">Accepted</p><p className="text-sm font-semibold text-foreground">{varAAccepted}</p></div>
                            <div><p className="text-xs text-muted-foreground mb-0.5">CVR</p><p className={`text-sm font-bold ${varACvr >= 50 ? "text-green-600" : "text-yellow-500"}`}>{varACvr}%</p></div>
                            <div><p className="text-xs text-muted-foreground mb-0.5">Revenue</p><p className="text-sm font-semibold text-foreground">₹{varARev.toLocaleString("en-IN")}</p></div>
                        </div>
                    </div>

                    {/* Variant B */}
                    <div className={`bg-card rounded-xl border-2 p-5 ${varBCvr > varACvr ? "border-green-500" : "border-border"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-base font-bold text-foreground">Variant B</p>
                            {varBCvr > varACvr && varB.length > 0 && (
                                <span className="text-xs font-bold bg-green-500 text-white px-2.5 py-1 rounded-full">Winner</span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-y-3">
                            <div><p className="text-xs text-muted-foreground mb-0.5">Sent</p><p className="text-sm font-semibold text-foreground">{varB.length}</p></div>
                            <div><p className="text-xs text-muted-foreground mb-0.5">Accepted</p><p className="text-sm font-semibold text-foreground">{varBAccepted}</p></div>
                            <div><p className="text-xs text-muted-foreground mb-0.5">CVR</p><p className={`text-sm font-bold ${varBCvr >= 50 ? "text-green-600" : "text-yellow-500"}`}>{varBCvr}%</p></div>
                            <div><p className="text-xs text-muted-foreground mb-0.5">Revenue</p><p className="text-sm font-semibold text-foreground">₹{varBRev.toLocaleString("en-IN")}</p></div>
                        </div>
                    </div>
                </div>
                {!loading && varA.length > 0 && varB.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-3">
                        Variant {varACvr >= varBCvr ? "A" : "B"} is outperforming by {Math.abs(diffPp)}pp.{" "}
                        {varACvr >= varBCvr ? "Recommend pausing Variant B." : "Recommend pausing Variant A."}
                    </p>
                )}
            </div>

            {/* Upsell Log */}
            <div className="mt-6">
                <h2 className="text-base font-bold text-foreground mb-3">Upsell Log</h2>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {["Booking", "Guest", "Upgrade", "Price", "Channel", "Sent", "Accepted", "Revenue"].map((h, i) => (
                                    <th
                                        key={h}
                                        className={`text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 ${i === 7 ? "text-right" : "text-left"}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border animate-pulse">
                                        {Array.from({ length: 8 }).map((__, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-3 bg-secondary rounded w-16" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-sm text-muted-foreground">
                                        No upsell offers found
                                    </td>
                                </tr>
                            ) : (
                                entries.map((entry, idx) => (
                                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                                        <td className="px-5 py-4 text-sm font-semibold text-primary">{entry.booking_ref}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-foreground">{entry.guest}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">{entry.upgrade?.replace("→", " → ")}</td>
                                        <td className="px-5 py-4 text-sm text-foreground">{entry.price}</td>
                                        <td className="px-5 py-4 text-sm font-semibold">
                                            {entry.channel === "WhatsApp" ? (
                                                <span className="text-green-600">WhatsApp</span>
                                            ) : (
                                                <span className="text-blue-500">Email</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-foreground">{fmtDate(entry.sent_at)}</td>
                                        <td className="px-5 py-4">
                                            {entry.accepted ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-foreground text-right">{entry.revenue}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-border text-center text-[11px] text-muted-foreground">
                © 2026 Fortiv Solutions. All rights reserved.
            </div>
        </DashboardLayout>
    );
};

export default UpsellUpgrades;
