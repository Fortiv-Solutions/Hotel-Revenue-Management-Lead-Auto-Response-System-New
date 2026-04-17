import { DateRangePicker } from "./DateRangePicker";
import NotificationPanel from "./NotificationPanel";

interface DashboardHeaderProps {
  onRangeChange?: (range: { from: Date; to: Date; label: string }) => void;
}

const DashboardHeader = ({ onRangeChange }: DashboardHeaderProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          {getGreeting()}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's what's happening at your property today.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <DateRangePicker onRangeChange={onRangeChange} />
        <NotificationPanel />
      </div>
    </div>
  );
};

export default DashboardHeader;
