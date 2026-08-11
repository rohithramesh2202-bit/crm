import { Inbox } from "lucide-react";

const EmptyState = ({ message = "Nothing here yet.", action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
    <Inbox size={28} className="mb-3 text-slate-300" />
    <p className="text-sm text-slate-500">{message}</p>
    {action}
  </div>
);

export default EmptyState;
