import { cn } from "../../lib/utils";

const statusConfig = {
  message_generated: {
    label: "Generated",
    className: "status-generated",
  },
  message_sent: {
    label: "Sent",
    className: "status-sent",
  },
  replied: {
    label: "Replied",
    className: "status-replied",
  },
  closed: {
    label: "Closed",
    className: "status-closed",
  },
  giveaway_running: {
    label: "Giveaway",
    className: "status-giveaway",
  },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.message_generated;
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        config.className
      )}
      data-testid={`status-badge-${status}`}
    >
      {config.label}
    </span>
  );
};

export const statusOptions = [
  { value: "message_generated", label: "Generated" },
  { value: "message_sent", label: "Sent" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
  { value: "giveaway_running", label: "Giveaway" },
];

export default StatusBadge;
