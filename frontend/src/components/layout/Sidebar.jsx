import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  ListChecks,
  Users,
  History,
  UserCircle,
  LogOut,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth.js";

const navItems = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["New Simulation", "/simulations/new", Sparkles],
  ["My Simulations", "/simulations", ListChecks],
  ["Investor Room", "/investor-room", Users],
  ["Investor History", "/investor-history", History],
  ["Profile", "/profile", UserCircle],
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-ink-800 transition-transform lg:sticky lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-700/50 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass-500 text-sm font-bold text-ink-800">
              AI
            </div>
            <span className="font-headline font-bold text-surface">Simulator</span>
          </div>
          <button onClick={onClose} className="text-surface/60 hover:text-surface lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(([label, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "spine-active bg-ink-700 text-surface"
                    : "text-ink-200 hover:bg-ink-700/50 hover:text-surface"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink-700/50 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded px-3.5 py-2.5 text-sm font-medium text-burgundy-300 hover:bg-burgundy-700/20 hover:text-burgundy-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
