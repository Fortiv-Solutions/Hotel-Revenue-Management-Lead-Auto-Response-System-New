import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertTriangle, Building2, Clock, BedDouble, Tag, Phone, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Account {
    id: string;
    account_ref: string;
    company_name: string;
    contact_name: string;
    city: string;
    monthly_room_nights: number;
    rate_negotiated_inr: number;
    contract_expiry: string;
    account_status: "Active" | "Expiring Soon";
    last_contacted?: string;
    renewal_status?: string;
    renewal_call_triggered?: boolean;
    renewal_call_triggered_at?: string;
}

interface BookingRow {
    id: string;
    booking_ref: string;
    guest_name: string;
    check_in_date: string;
    check_out_date: string;
}

const fmtRate = (n: number) => n ? `₹${Number(n).toLocaleString("en-IN")}` : "-";

const CorporateAccounts = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const [popoverBookings, setPopoverBookings] = useState<BookingRow[]>([]);
    const [popoverLoading, setPopoverLoading] = useState(false);
    const popoverRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const fetch = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("corporate_accounts")
                .select("id, account_ref, company_name, contact_name, city, monthly_room_nights, rate_negotiated_inr, contract_expiry, account_status, last_contacted, renewal_status, renewal_call_triggered, renewal_call_triggered_at")
                .order("company_name");
            if (error) throw error;
            if (!data || data.length === 0) throw new Error("No data");
            setAccounts(data as Account[]);
        } catch (err) {
            console.warn("Falling back to mock corporate accounts data.", err);
            const mockAccounts: Account[] = [
                { id: "1", account_ref: "CORP-INF", company_name: "Infosys", contact_name: "Rahul Sharma", city: "Bangalore", monthly_room_nights: 150, rate_negotiated_inr: 8500, contract_expiry: "2026-12-31", account_status: "Active" },
                { id: "2", account_ref: "CORP-TCS", company_name: "TCS", contact_name: "Priya Singh", city: "Mumbai", monthly_room_nights: 200, rate_negotiated_inr: 8200, contract_expiry: "2026-05-15", account_status: "Expiring Soon", last_contacted: "2026-04-10" },
                { id: "3", account_ref: "CORP-WIP", company_name: "Wipro", contact_name: "Amit Patel", city: "Bangalore", monthly_room_nights: 120, rate_negotiated_inr: 8700, contract_expiry: "2026-05-10", account_status: "Expiring Soon" },
                { id: "4", account_ref: "CORP-HCL", company_name: "HCL Tech", contact_name: "Neha Gupta", city: "Noida", monthly_room_nights: 90, rate_negotiated_inr: 8900, contract_expiry: "2027-03-31", account_status: "Active" },
                { id: "5", account_ref: "CORP-ACC", company_name: "Accenture", contact_name: "Vikram Desai", city: "Pune", monthly_room_nights: 180, rate_negotiated_inr: 8600, contract_expiry: "2026-11-30", account_status: "Active", last_contacted: "2026-01-15" }
            ];
            setAccounts(mockAccounts);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    const handleRenewalCall = async (id: string, companyName: string) => {
        const { error } = await supabase
            .from("corporate_accounts")
            .update({
                last_contacted: new Date().toISOString(),
                renewal_status: "In-Progress",
                renewal_call_triggered: true,
                renewal_call_triggered_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            toast.error("Error logging renewal call: " + error.message);
        } else {
            toast.success(`Renewal process started for ${companyName}. Action logged.`);
            fetch();
        }
    };

    const openBookings = async (accountRef: string) => {
        if (openPopover === accountRef) { setOpenPopover(null); return; }
        setOpenPopover(accountRef);
        setPopoverBookings([]);
        setPopoverLoading(true);
        // Bookings linked by corporate_account_id — we match on account_ref via booking_source
        const { data } = await supabase
            .from("bookings")
            .select("id, booking_ref, guest_name, check_in_date, check_out_date")
            .ilike("booking_source", `%${accountRef}%`)
            .limit(10);
        setPopoverBookings((data as BookingRow[]) ?? []);
        setPopoverLoading(false);
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (openPopover) {
                const ref = popoverRefs.current[openPopover];
                if (ref && !ref.contains(e.target as Node)) setOpenPopover(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [openPopover]);

    // ── Derived KPIs ──
    const activeCount = accounts.filter((a) => a.account_status === "Active").length;
    const expiringCount = accounts.filter((a) => a.account_status === "Expiring Soon").length;
    const totalRNs = accounts.reduce((s, a) => s + (a.monthly_room_nights ?? 0), 0);
    const rates = accounts.map((a) => Number(a.rate_negotiated_inr) || 0).filter(Boolean);
    const avgRate = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;

    const stats = [
        { label: "ACTIVE ACCOUNTS", value: loading ? "…" : String(activeCount), icon: Building2, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
        { label: "EXPIRING IN 30 DAYS", value: loading ? "…" : String(expiringCount), icon: Clock, iconBg: "bg-yellow-50", iconColor: "text-yellow-500" },
        { label: "MONTHLY ROOM NIGHTS", value: loading ? "…" : String(totalRNs), icon: BedDouble, iconBg: "bg-green-50", iconColor: "text-green-500" },
        { label: "AVG NEGOTIATED RATE", value: loading ? "…" : fmtRate(avgRate), icon: Tag, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
    ];

    const expiringNames = accounts.filter((a) => a.account_status === "Expiring Soon").map((a) => a.company_name);

    const fmtDate = (d?: string) =>
        d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-";

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Corporate Accounts</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor corporate client contracts</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((s) => (
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

            {/* Warning Banner */}
            {!loading && expiringCount > 0 && (
                <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 font-medium">
                        {expiringCount} contract{expiringCount > 1 ? "s" : ""} expiring soon —{" "}
                        {expiringNames.join(", ")}. Trigger renewal calls now.
                    </p>
                </div>
            )}

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            {["Company", "Contact", "City", "Monthly RNs", "Neg. Rate", "Expiry", "Last Call", "Status", ""].map((h, i) => (
                                <th
                                    key={`${h}-${i}`}
                                    className={`text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 ${[3, 4].includes(i) ? "text-right" : "text-left"}`}
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
                                    {Array.from({ length: 9 }).map((__, j) => (
                                        <td key={j} className="px-5 py-4">
                                            <div className="h-3 bg-secondary rounded w-20" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : accounts.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-12 text-sm text-muted-foreground">
                                    No corporate accounts found
                                </td>
                            </tr>
                        ) : (
                            accounts.map((acc) => (
                                <tr key={acc.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                                    <td className="px-5 py-4">
                                        <div>
                                            <span className="font-semibold text-foreground text-sm">{acc.company_name}</span>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{acc.account_ref}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-primary font-medium">{acc.contact_name}</td>
                                    <td className="px-5 py-4 text-sm text-muted-foreground">{acc.city}</td>
                                    <td className="px-5 py-4 text-sm text-foreground text-right">{acc.monthly_room_nights}</td>
                                    <td className="px-5 py-4 text-sm text-foreground text-right">{fmtRate(acc.rate_negotiated_inr)}</td>
                                    <td className="px-5 py-4 text-sm text-foreground">{fmtDate(acc.contract_expiry)}</td>
                                    <td className="px-5 py-4 text-sm text-foreground">
                                        {acc.last_contacted ? fmtDate(acc.last_contacted) : "-"}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center text-[10px] uppercase font-bold px-2 py-0.5 rounded-full w-fit ${acc.account_status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {acc.account_status}
                                            </span>
                                            {acc.renewal_status && acc.renewal_status !== "Pending" && (
                                                <span className="text-[10px] text-primary font-semibold ml-0.5 italic">
                                                    {acc.renewal_status}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div
                                            className="relative flex items-center gap-2"
                                            ref={(el) => { popoverRefs.current[acc.account_ref] = el; }}
                                        >
                                            <button
                                                onClick={() => handleRenewalCall(acc.id, acc.company_name)}
                                                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                <Phone className="w-3 h-3" />
                                                Trigger Renewal Call
                                            </button>
                                            <button
                                                onClick={() => openBookings(acc.account_ref)}
                                                className="text-xs font-medium text-foreground hover:text-primary transition-colors px-1"
                                            >
                                                View Bookings
                                            </button>

                                            {/* Popover */}
                                            {openPopover === acc.account_ref && (
                                                <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-lg p-4 w-72">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                            Bookings for {acc.company_name}
                                                        </p>
                                                        <button onClick={() => setOpenPopover(null)}>
                                                            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                                        </button>
                                                    </div>
                                                    {popoverLoading ? (
                                                        <p className="text-xs text-muted-foreground">Loading…</p>
                                                    ) : popoverBookings.length === 0 ? (
                                                        <p className="text-xs text-muted-foreground">No bookings found.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {popoverBookings.map((bk) => (
                                                                <p key={bk.id} className="text-sm text-foreground">
                                                                    <span className="font-semibold">{bk.booking_ref}</span> — {bk.guest_name},{" "}
                                                                    {bk.check_in_date} – {bk.check_out_date}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default CorporateAccounts;
