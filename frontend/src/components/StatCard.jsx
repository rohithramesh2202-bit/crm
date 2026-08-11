const StatCard = ({ label, value, icon: Icon, accent = "teal" }) => {
  const accents = {
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        {Icon && (
          <span className={`rounded-lg p-2 ${accents[accent]}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="mt-3 font-data text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  );
};

export default StatCard;
