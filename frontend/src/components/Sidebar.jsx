import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  Factory,
  FileText,
  CalendarClock,
  Mail,
  Settings,
  Orbit,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/customers", label: "Customers", icon: Building2 },
  { to: "/distributors", label: "Distributors", icon: Truck },
  { to: "/oems", label: "OEMs", icon: Factory },
  { to: "/quotations", label: "Quotations", icon: FileText },
  { to: "/followups", label: "Follow-ups", icon: CalendarClock },
  { to: "/emails", label: "Email Log", icon: Mail },
];

const Sidebar = ({ user }) => {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-ink-950 text-slate-300">
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-5">
        <span className="rounded-lg bg-teal-500/15 p-1.5 text-teal-400">
          <Orbit size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Orbit CRM</p>
          <p className="font-data text-[10px] uppercase tracking-widest text-slate-500">
            Pipeline Ledger
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-teal-500/15 text-teal-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-teal-500/15 text-teal-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`
            }
          >
            <Settings size={17} strokeWidth={2} />
            Team &amp; Settings
          </NavLink>
        )}
      </nav>

      <div className="border-t border-white/5 px-5 py-4">
        <p className="font-data text-[11px] text-slate-500">v1.0 · MERN</p>
      </div>
    </aside>
  );
};

export default Sidebar;
