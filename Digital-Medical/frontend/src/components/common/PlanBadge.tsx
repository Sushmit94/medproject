import type { Plan } from "@/types";

const planConfig: Record<Plan, { label: string; bg: string; text: string } | null> = {
  free: null,
  silver: { label: "Silver", bg: "bg-slate-100", text: "text-slate-600" },
  gold: { label: "Gold", bg: "bg-amber-50", text: "text-amber-700" },
  platinum: { label: "Platinum", bg: "bg-primary-light", text: "text-primary" },
};

interface PlanBadgeProps {
  plan: Plan;
  size?: "sm" | "md";
}

export default function PlanBadge({ plan, size = "sm" }: PlanBadgeProps) {
  const config = planConfig[plan];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md
        ${config.bg} ${config.text}
        ${size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"}`}
    >
      {config.label}
    </span>
  );
}
