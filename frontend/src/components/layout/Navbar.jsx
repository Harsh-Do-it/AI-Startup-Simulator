import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth.js";

export default function Navbar({ onMenuClick, variant = "protected" }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brass-500/20 bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        {variant === "protected" && (
          <button
            onClick={onMenuClick}
            className="rounded p-2 text-on-surface-variant hover:bg-surface-container-high lg:hidden"
          >
            <Menu size={20} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800 text-sm font-bold text-brass-500 shadow-soft">
            AI
          </div>
          <span className="font-headline text-lg font-bold text-ink-900">Startup Simulator</span>
        </Link>
      </div>

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded border border-brass-500/30 px-2.5 py-1.5 hover:bg-surface-container transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-ink-800 text-sm font-semibold text-surface">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="hidden text-sm font-medium text-ink-900 sm:block">
                {user?.name}
              </span>
              <ChevronDown size={16} className="text-on-surface-variant" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded border border-brass-500/30 bg-ink-800 py-1 shadow-glass z-50">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface hover:bg-ink-700 transition-colors"
                >
                  <User size={16} />
                  Profile
                </Link>
                <div className="mx-2 my-1 border-t border-brass-500/20" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-burgundy-300 hover:bg-ink-700 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Link
            to="/login"
            className="rounded px-4 py-2 text-sm font-medium text-ink-800 hover:bg-surface-container-high transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="wax-seal px-4 py-2 text-sm"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
