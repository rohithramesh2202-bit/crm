import { useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Topbar = ({ title }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur">
      <p className="text-sm text-slate-400">{title}</p>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-xs font-semibold text-white">
            {initials || "U"}
          </span>
          <span className="text-sm font-medium text-ink-800">{user?.name}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
        {open && (
          <div
            className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            onMouseLeave={() => setOpen(false)}
          >
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="truncate text-sm font-medium text-ink-800">{user?.email}</p>
              <p className="mt-0.5 font-data text-[10px] uppercase text-teal-600">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
