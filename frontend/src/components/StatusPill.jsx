const palettes = {
  // Lead / general statuses
  new: { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50" },
  contacted: { dot: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50" },
  qualified: { dot: "bg-teal-500", text: "text-teal-700", bg: "bg-teal-50" },
  negotiation: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  won: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  lost: { dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50" },
  // generic active/inactive
  active: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  inactive: { dot: "bg-slate-400", text: "text-slate-500", bg: "bg-slate-50" },
  // quotation statuses
  draft: { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50" },
  sent: { dot: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50" },
  accepted: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  rejected: { dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50" },
  expired: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  // follow-up statuses
  open: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  done: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  missed: { dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50" },
};

const StatusPill = ({ status }) => {
  const palette = palettes[status] || palettes.new;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-data text-xs uppercase tracking-wide ${palette.bg} ${palette.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
      {status}
    </span>
  );
};

export default StatusPill;
