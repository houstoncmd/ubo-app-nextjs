interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "amber" | "cyan" | "red";
  change?: string;
  changeType?: "up" | "down";
}

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  cyan: "bg-cyan-100 text-cyan-600",
  red: "bg-red-100 text-red-600",
};

export default function StatCard({
  title,
  value,
  icon,
  color,
  change,
  changeType,
}: StatCardProps) {
  return (
    <div className="lhb-stat-card">
      <div className={`lhb-stat-icon ${colorMap[color]}`}>
        <i className={`bi ${icon} text-xl`}></i>
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {change && (
          <p
            className={`text-xs mt-1 ${
              changeType === "up" ? "text-emerald-600" : "text-red-500"
            }`}
          >
            <i
              className={`bi bi-arrow-${
                changeType === "up" ? "up" : "down"
              } mr-1`}
            ></i>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
