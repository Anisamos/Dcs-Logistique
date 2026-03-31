interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "amber" | "blue" | "green" | "red" | "purple";
  icon?: React.ReactNode;
}

const colorClasses = {
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  red: "bg-red-50 border-red-200 text-red-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
};

export default function StatCard({ title, value, subtitle, color = "amber", icon }: StatCardProps) {
  return (
    <div className={`rounded-xl border-2 p-5 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-70">{title}</span>
        {icon && <span className="opacity-50">{icon}</span>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
    </div>
  );
}
