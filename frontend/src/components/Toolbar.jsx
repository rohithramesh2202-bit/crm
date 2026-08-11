import { Search } from "lucide-react";

const Toolbar = ({ search, onSearchChange, placeholder = "Search...", right }) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div className="relative w-full max-w-xs">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
      />
    </div>
    <div className="flex items-center gap-2">{right}</div>
  </div>
);

export default Toolbar;
