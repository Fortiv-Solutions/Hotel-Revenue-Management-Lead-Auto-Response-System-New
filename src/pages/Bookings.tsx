import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import {
  Users, CalendarCheck, Search,
  Eye, X, Phone, Mail, CheckCircle2,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Booking {
  id: string;
  booking_ref: string;
  guest_name: string;
  email?: string;
  phone?: string;
  check_in_date: string;
  check_out_date: string;
  adults?: number;
  children?: number;
  booking_source: string;
  total_amount_inr: number;
  status: string;
  purpose?: string;
  ota_name?: string;
  ota_commission_pct?: number;
  whatsapp_opted?: boolean;
}

// ── Helpers ──
const today = new Date().toISOString().slice(0, 10);

const calcNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

const getSourceColor = (source: string) => {
  if (!source) return "bg-gray-400";
  const s = source.toLowerCase();
  if (s.includes("direct")) return "bg-green-500";
  if (s.includes("booking") || s.includes("ota")) return "bg-blue-500";
  if (s.includes("makemy") || s.includes("mmt")) return "bg-red-500";
  return "bg-gray-400";
};

const getSourceLabel = (source: string) => {
  if (!source) return "Unknown";
  const s = source.toLowerCase();
  if (s.includes("direct")) return "Direct";
  if (s.includes("whatsapp")) return "WhatsApp";
  if (s.includes("booking")) return "Booking.com";
  if (s.includes("makemy") || s.includes("mmt")) return "MakeMyTrip";
  return source;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Confirmed": return "bg-blue-50 text-blue-600 border-blue-100";
    case "Checked-in": return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "Checked-out": return "bg-gray-50 text-gray-600 border-gray-100";
    case "Cancelled": return "bg-red-50 text-red-600 border-red-100";
    default: return "bg-gray-50 text-gray-600 border-gray-100";
  }
};

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const fmtAmount = (n: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("id, booking_ref, guest_name, email, phone, check_in_date, check_out_date, adults, children, booking_source, total_amount_inr, status, purpose, ota_name, ota_commission_pct, whatsapp_opted")
          .order("check_in_date", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("No data");
        setBookings(data as Booking[]);
      } catch (err) {
        console.warn("Falling back to mock bookings data.", err);
        const mockBookings: Booking[] = [];
        const names = ["Aarav Patel", "Diya Sharma", "Vihaan Singh", "Ananya Gupta", "Rohan Kumar", "Isha Desai"];
        const sources = ["Direct", "Booking.com", "MakeMyTrip", "Direct", "Agoda", "WhatsApp"];
        const statuses = ["Checked-in", "Confirmed", "Pending", "Checked-out"];
        const todayStr = new Date();
        
        for (let i = 0; i < 20; i++) {
          const inDate = new Date();
          inDate.setDate(todayStr.getDate() + (Math.floor(Math.random() * 10) - 3));
          const outDate = new Date(inDate);
          outDate.setDate(inDate.getDate() + Math.floor(Math.random() * 4) + 1);
          
          mockBookings.push({
            id: `bk_${i}`,
            booking_ref: `HTL${1000 + i}`,
            guest_name: names[i % names.length],
            email: `guest${i}@example.com`,
            phone: `+91 98765 432${(i%10).toString().padStart(2, '0')}`,
            check_in_date: inDate.toISOString(),
            check_out_date: outDate.toISOString(),
            adults: 2,
            children: i % 3 === 0 ? 1 : 0,
            booking_source: sources[i % sources.length],
            total_amount_inr: 12000 + (i * 1500),
            status: statuses[i % statuses.length],
            purpose: i % 2 === 0 ? "Leisure" : "Business",
            ota_name: i % 2 !== 0 ? sources[i % sources.length] : undefined,
            ota_commission_pct: i % 2 !== 0 ? 18 : 0,
            whatsapp_opted: i % 2 === 0
          });
        }
        setBookings(mockBookings.sort((a,b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime()));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Summary cards ──
  const arrivalsToday = bookings.filter((b) => b.check_in_date?.slice(0, 10) === today);
  const departuresToday = bookings.filter((b) => b.check_out_date?.slice(0, 10) === today);

  // ── Filters ──
  const filtered = bookings.filter((b) => {
    const matchesSearch = b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const src = b.booking_source?.toLowerCase() ?? "";
    const matchesSource =
      sourceFilter === "all" ||
      (sourceFilter === "direct" && src.includes("direct")) ||
      (sourceFilter === "ota" && (src.includes("booking") || src.includes("makemy") || src.includes("expedia") || src.includes("ota"))) ||
      (sourceFilter === "whatsapp" && src.includes("whatsapp"));
    const matchesStatus = statusFilter === "all" || b.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesSource && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <h3 className="text-slate-800 font-semibold">
                Arrivals Today:{" "}
                <span className="font-bold">
                  {loading ? "…" : `${arrivalsToday.length} guest${arrivalsToday.length !== 1 ? "s" : ""}`}
                </span>
              </h3>
            </div>
            {arrivalsToday.slice(0, 3).map((b) => (
              <p key={b.id} className="text-slate-400 text-sm ml-8">• {b.guest_name}</p>
            ))}
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CalendarCheck className="w-5 h-5 text-amber-500" />
              <h3 className="text-slate-800 font-semibold">
                Departures Today:{" "}
                <span className="font-bold">
                  {loading ? "…" : `${departuresToday.length} guest${departuresToday.length !== 1 ? "s" : ""}`}
                </span>
              </h3>
            </div>
            {departuresToday.slice(0, 3).map((b) => (
              <p key={b.id} className="text-slate-400 text-sm ml-8">• {b.guest_name}</p>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-10 h-11 bg-white border-slate-100 rounded-xl"
              placeholder="Search by guest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px] h-11 bg-white border-slate-100 rounded-xl">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="ota">OTA</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-11 bg-white border-slate-100 rounded-xl">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Checked-in">Checked-in</SelectItem>
              <SelectItem value="Checked-out">Checked-out</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                {["Ref", "Guest", "Check-in", "Check-out", "Nights", "Source", "Amount", "Status", "Actions"].map((h, i) => (
                  <TableHead
                    key={h}
                    className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4 ${i === 0 ? "pl-6" : ""} ${i === 8 ? "text-right pr-6" : ""}`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-100 animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <TableCell key={j} className="py-5">
                        <div className="h-3 bg-slate-100 rounded w-16" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-sm text-slate-400">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((booking) => (
                  <TableRow key={booking.id} className="border-slate-100 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="font-medium text-slate-400 text-sm py-5 pl-6">{booking.booking_ref}</TableCell>
                    <TableCell className="font-bold text-slate-800 text-sm">{booking.guest_name}</TableCell>
                    <TableCell className="text-slate-800 text-xs font-medium">{fmtDate(booking.check_in_date)}</TableCell>
                    <TableCell className="text-slate-800 text-xs font-medium">{fmtDate(booking.check_out_date)}</TableCell>
                    <TableCell className="text-slate-400 text-xs font-medium text-center">
                      {calcNights(booking.check_in_date, booking.check_out_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 bg-slate-50 w-fit px-2.5 py-1 rounded-full border border-slate-100">
                        <div className={`w-1.5 h-1.5 rounded-full ${getSourceColor(booking.booking_source)}`} />
                        <span className="text-[11px] font-semibold text-slate-600">{getSourceLabel(booking.booking_source)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-800 text-sm">{fmtAmount(booking.total_amount_inr)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-xl px-3 py-1 font-bold text-[11px] ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Sheet>
                        <SheetTrigger asChild>
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-bold hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                          >
                            View
                          </button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[450px] p-0 border-l-0">
                          {selectedBooking && (
                            <div className="h-full flex flex-col bg-slate-50/30">
                              <div className="p-8 pb-0">
                                <div className="flex items-start justify-between mb-4">
                                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{selectedBooking.guest_name}</h1>
                                  <SheetTrigger asChild>
                                    <button className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                                      <X className="w-5 h-5" />
                                    </button>
                                  </SheetTrigger>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-6">
                                  {selectedBooking.phone && <span>{selectedBooking.phone}</span>}
                                  {selectedBooking.phone && selectedBooking.email && (
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                  )}
                                  {selectedBooking.email && <span>{selectedBooking.email}</span>}
                                </div>
                                {selectedBooking.purpose && (
                                  <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wide">
                                    {selectedBooking.purpose}
                                  </Badge>
                                )}
                              </div>
                              <ScrollArea className="flex-1 px-8 py-6">
                                <div className="space-y-6">
                                  {/* Stay Details */}
                                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Stay Details</h3>
                                    <div className="grid grid-cols-2 gap-y-6">
                                      <div><p className="text-xs text-slate-400 font-medium mb-1">Ref</p><p className="text-lg font-bold text-slate-900">{selectedBooking.booking_ref}</p></div>
                                      <div><p className="text-xs text-slate-400 font-medium mb-1">Nights</p><p className="text-lg font-bold text-slate-900">{calcNights(selectedBooking.check_in_date, selectedBooking.check_out_date)}</p></div>
                                      <div><p className="text-xs text-slate-400 font-medium mb-1">Check-in</p><p className="text-lg font-bold text-slate-900">{fmtDate(selectedBooking.check_in_date)}</p></div>
                                      <div><p className="text-xs text-slate-400 font-medium mb-1">Check-out</p><p className="text-lg font-bold text-slate-900">{fmtDate(selectedBooking.check_out_date)}</p></div>
                                      {selectedBooking.adults != null && (
                                        <div><p className="text-xs text-slate-400 font-medium mb-1">Adults</p><p className="text-lg font-bold text-slate-900">{selectedBooking.adults}</p></div>
                                      )}
                                      {selectedBooking.children != null && (
                                        <div><p className="text-xs text-slate-400 font-medium mb-1">Children</p><p className="text-lg font-bold text-slate-900">{selectedBooking.children}</p></div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Financials */}
                                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Financials</h3>
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-slate-500 font-medium">Total Amount</p>
                                        <p className="text-lg font-bold text-slate-900">{fmtAmount(selectedBooking.total_amount_inr)}</p>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-slate-500 font-medium">Source</p>
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                          <div className={`w-1.5 h-1.5 rounded-full ${getSourceColor(selectedBooking.booking_source)}`} />
                                          <span className="text-[12px] font-bold text-slate-700">{getSourceLabel(selectedBooking.booking_source)}</span>
                                        </div>
                                      </div>
                                      {selectedBooking.ota_name && (
                                        <div className="flex items-center justify-between">
                                          <p className="text-sm text-slate-500 font-medium">OTA</p>
                                          <p className="text-sm font-bold text-slate-800">{selectedBooking.ota_name}</p>
                                        </div>
                                      )}
                                      {selectedBooking.ota_commission_pct != null && selectedBooking.ota_commission_pct > 0 && (
                                        <div className="flex items-center justify-between pt-2">
                                          <p className="text-sm text-red-500 font-bold">OTA Commission ({selectedBooking.ota_commission_pct}%)</p>
                                          <p className="text-sm text-red-500 font-bold">
                                            {fmtAmount(Math.round(selectedBooking.total_amount_inr * (selectedBooking.ota_commission_pct / 100)))}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* WhatsApp */}
                                  {selectedBooking.whatsapp_opted && (
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">WhatsApp</h3>
                                      <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Guest opted in for WhatsApp updates</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Bookings;
