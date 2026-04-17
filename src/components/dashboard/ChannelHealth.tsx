import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { supabase } from "@/integrations/supabase/client";

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadDistribution = () => {
  const [animate, setAnimate] = useState(false);
  const [counts, setCounts] = useState({ hot: 0, warm: 0, cold: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase.from("leads").select("status");
      if (data) {
        const hot = data.filter((l) => l.status === "HOT").length;
        const warm = data.filter((l) => l.status === "WARM").length;
        const cold = data.filter((l) => l.status === "COLD").length;
        setCounts({ hot, warm, cold });
      }
      setLoading(false);
    };
    fetchLeads();
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const total = counts.hot + counts.warm + counts.cold;

  const data = {
    labels: ["Hot Leads", "Warm Leads", "Cold Leads"],
    datasets: [
      {
        data: [counts.hot, counts.warm, counts.cold],
        backgroundColor: ["#FF4D4D", "#FFA940", "#4DA6FF"],
        hoverBackgroundColor: ["#FF4D4D", "#FFA940", "#4DA6FF"],
        borderWidth: 0,
        weight: 1,
      },
    ],
  };

  const options = {
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    animation: { animateRotate: true, duration: 1500 },
    maintainAspectRatio: false,
  };

  const legendItems = [
    { label: "Hot Leads", count: counts.hot, color: "#FF4D4D", icon: "🔥", bg: "#fff0f0", pct: total > 0 ? Math.round((counts.hot / total) * 100) : 0 },
    { label: "Warm Leads", count: counts.warm, color: "#FFA940", icon: "🌤️", bg: "#fff8ee", pct: total > 0 ? Math.round((counts.warm / total) * 100) : 0 },
    { label: "Cold Leads", count: counts.cold, color: "#4DA6FF", icon: "❄️", bg: "#eef5ff", pct: total > 0 ? Math.round((counts.cold / total) * 100) : 0 },
  ];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm relative pt-[3px]">
      {/* 3px Gradient Top Border */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(to right, #FF4D4D, #FFA940, #4DA6FF)" }}
      />
      <div className="p-5">
        <h2 className="text-base font-bold text-foreground mb-4">Lead Distribution</h2>

        {/* Chart Container */}
        <div className="relative h-[160px] w-full mb-6">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">Loading...</div>
          ) : (
            <>
              <Doughnut data={data} options={options} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-foreground leading-none">{total}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Leads</span>
              </div>
            </>
          )}
        </div>

        {/* Custom Legend */}
        <div className="space-y-1">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[#F8FAFC] cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: item.bg }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground truncate">{item.label}</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground">{item.count}</span>
                    <span className="text-[10px] font-medium text-muted-foreground ml-1.5">{item.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: animate ? `${item.pct}%` : "0%", backgroundColor: item.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadDistribution;
