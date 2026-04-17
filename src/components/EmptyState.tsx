import { InboxIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({
  icon: Icon = InboxIcon,
  title = "No data yet",
  description = "When new data arrives, it will appear here.",
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 empty-state-entrance">
      {/* Animated icon container */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-secondary flex items-center justify-center empty-state-icon-float">
          <Icon className="w-7 h-7 text-muted-foreground" />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-muted-foreground/15 scale-[1.35]" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}

      <style>{`
        .empty-state-entrance {
          animation: emptyFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes emptyFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .empty-state-icon-float {
          animation: emptyFloat 4s ease-in-out infinite;
        }
        @keyframes emptyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default EmptyState;
