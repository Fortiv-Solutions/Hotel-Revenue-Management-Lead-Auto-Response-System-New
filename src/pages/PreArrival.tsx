import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Utensils, Sparkles, Car, CheckCircle2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PreArrivalEntry {
    id: string;
    booking_id: string;
    message_type: string;
    channel: string;
    sent_at: string;
    delivered: boolean;
    delivery_status: string;
    guest_response: string | null;
    revenue_inr: number;
    booked: boolean;
    trigger_days_before_checkin: number;
}

const fmtDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const fmtRevenue = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Map raw message_type values to display labels and colors
const getMessageConfig = (type: string | null): { label: string; dot: string; text: string } => {
    const t = type?.toLowerCase() ?? "";
    if (!t) return { label: "General", dot: "bg-gray-400", text: "text-gray-500" };
    if (t.includes("spa")) return { label: "Spa", dot: "bg-purple-500", text: "text-purple-500" };
    if (t.includes("restaurant") || t.includes("dining") || t.includes("food"))
        return { label: "Restaurant", dot: "bg-orange-500", text: "text-orange-500" };
    if (t.includes("airport") || t.includes("transfer") || t.includes("taxi"))
        return { label: "Airport Transfer", dot: "bg-teal-500", text: "text-teal-600" };
    if (t.includes("welcome") || t.includes("info"))
        return { label: "Welcome Info", dot: "bg-blue-500", text: "text-blue-500" };
    if (t.includes("upsell") || t.includes("upgrade"))
        return { label: "Upsell", dot: "bg-green-500", text: "text-green-600" };
    if (t.length > 20) return { label: "Inquiry", dot: "bg-gray-400", text: "text-gray-500" }; // Fallback for malformed UUID data
    return { label: type || "General", dot: "bg-gray-400", text: "text-gray-500" };
};

const PreArrival = () => {
    const [log, setLog] = useState<PreArrivalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data, error } = await supabase
                    .from("pre_arrival_messages")
                    .select("id, booking_id, message_type, channel, sent_at, delivered, delivery_status, guest_response, revenue_inr, booked, trigger_days_before_checkin")
                    .order("sent_at", { ascending: false });

                if (error) throw error;
                if (!data || data.length === 0) throw new Error("No data");
                
                setLog(data as PreArrivalEntry[]);
            } catch (err) {
                console.warn("Falling back to mock pre-arrival data.", err);
                const mockLogs: PreArrivalEntry[] = [
                    { id: "1", booking_id: "bk_1", message_type: "Spa Package", channel: "WhatsApp", sent_at: new Date().toISOString(), delivered: true, delivery_status: "Delivered", guest_response: "Yes, please book a couples massage for Tuesday.", revenue_inr: 5000, booked: true, trigger_days_before_checkin: 3 },
                    { id: "2", booking_id: "bk_2", message_type: "Airport Transfer", channel: "Email", sent_at: new Date(Date.now() - 3600000).toISOString(), delivered: true, delivery_status: "Opened", guest_response: null, revenue_inr: 0, booked: false, trigger_days_before_checkin: 2 },
                    { id: "3", booking_id: "bk_3", message_type: "Restaurant Booking", channel: "WhatsApp", sent_at: new Date(Date.now() - 86400000).toISOString(), delivered: true, delivery_status: "Read", guest_response: "Reserve a table for 2 at 8 PM.", revenue_inr: 3500, booked: true, trigger_days_before_checkin: 1 },
                    { id: "4", booking_id: "bk_4", message_type: "Welcome Info", channel: "Email", sent_at: new Date(Date.now() - 172800000).toISOString(), delivered: true, delivery_status: "Delivered", guest_response: null, revenue_inr: 0, booked: false, trigger_days_before_checkin: 5 },
                    { id: "5", booking_id: "bk_5", message_type: "Spa Upgrade", channel: "WhatsApp", sent_at: new Date(Date.now() - 259200000).toISOString(), delivered: true, delivery_status: "Delivered", guest_response: "Interested but what are the timings?", revenue_inr: 0, booked: false, trigger_days_before_checkin: 3 },
                ];
                setLog(mockLogs);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // ── Derived KPI stats ──
    const spaRev = log.filter((e) => e.message_type?.toLowerCase().includes("spa")).reduce((s, e) => s + (e.revenue_inr || 0), 0);
    const restaurantRev = log.filter((e) => {
        const t = e.message_type?.toLowerCase();
        return t?.includes("restaurant") || t?.includes("dining") || t?.includes("food");
    }).reduce((s, e) => s + (e.revenue_inr || 0), 0);
    const transferRev = log.filter((e) => {
        const t = e.message_type?.toLowerCase();
        return t?.includes("airport") || t?.includes("transfer") || t?.includes("taxi");
    }).reduce((s, e) => s + (e.revenue_inr || 0), 0);
    const totalRev = log.reduce((s, e) => s + (e.revenue_inr || 0), 0);

    const stats = [
        { label: "RESTAURANT REVENUE", value: loading ? "…" : fmtRevenue(restaurantRev), Icon: Utensils, iconBg: "bg-orange-50", iconColor: "text-orange-400" },
        { label: "SPA REVENUE", value: loading ? "…" : fmtRevenue(spaRev), Icon: Sparkles, iconBg: "bg-purple-50", iconColor: "text-purple-400" },
        { label: "TRANSFER REVENUE", value: loading ? "…" : fmtRevenue(transferRev), Icon: Car, iconBg: "bg-green-50", iconColor: "text-green-500" },
        { label: "TOTAL ANCILLARY", value: loading ? "…" : fmtRevenue(totalRev), Icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-500" },
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pre-Arrival Engagement</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Track pre-arrival messages and ancillary revenue</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map(({ label, value, Icon, iconBg, iconColor }) => (
                    <div key={label} className="bg-card rounded-xl border border-border p-5 flex items-start justify-between">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
                            <p className="text-3xl font-bold text-foreground">{value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pre-Arrival Log Table */}
            <div>
                <h2 className="text-base font-bold text-foreground mb-3">Pre-Arrival Log</h2>
                <div className="bg-card rounded-xl border border-border overflow-x-auto">
                    <table className="w-full min-w-[860px]">
                        <thead>
                            <tr className="border-b border-border">
                                {["Message Type", "Channel", "Sent", "Delivered", "Booked", "Guest Response", "Revenue"].map((h) => (
                                    <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border animate-pulse">
                                        {Array.from({ length: 7 }).map((__, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-3 bg-secondary rounded w-16" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : log.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                                        No pre-arrival messages found
                                    </td>
                                </tr>
                            ) : (
                                log.map((entry) => {
                                    const cfg = getMessageConfig(entry.message_type);
                                    const hasRevenue = (entry.revenue_inr || 0) > 0;
                                    return (
                                        <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap">
                                                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                                    <span className={cfg.text}>{cfg.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-foreground whitespace-nowrap capitalize">{entry.channel || "-"}</td>
                                            <td className="px-5 py-4 text-sm text-foreground whitespace-nowrap">{fmtDate(entry.sent_at) || "-"}</td>
                                            <td className="px-5 py-4">
                                                {entry.delivered
                                                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                    : <span className="text-xs text-muted-foreground">Pending</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                {entry.booked
                                                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                    : <span className="text-xs text-muted-foreground">No</span>}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-foreground max-w-[240px]">
                                                {entry.guest_response ? (
                                                    <span className="flex items-start gap-1.5">
                                                        <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                                                        <span className="line-clamp-2">{entry.guest_response}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">No response</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-semibold whitespace-nowrap">
                                                {hasRevenue
                                                    ? <span className="text-green-600">{fmtRevenue(entry.revenue_inr)}</span>
                                                    : <span className="text-muted-foreground">₹0</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PreArrival;
