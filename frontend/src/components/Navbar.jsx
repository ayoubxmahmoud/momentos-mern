import { Link } from "react-router";
import { Camera, Plus, LogOut, LogIn, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const getInitials = (fullName) => {
  if (!fullName) return "U";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Navbar = ({ user, onLogout, onOpenCreateModal }) => {
  const { theme, toggleTheme } = useTheme();
  const avatarUrl =
    user?.avatar?.url || (typeof user?.avatar === "string" ? user.avatar : "");

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#1a2234]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Momentos
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm btn-circle text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            )}
          </button>

          {/* Create Momento Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="btn btn-sm sm:btn-md px-2.5 sm:px-4 bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-transparent dark:hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/50 hover:border-emerald-400 rounded-xl gap-1.5 sm:gap-2 normal-case font-medium transition-all"
            title="Create Momento"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Momento</span>
          </button>

          {user ? (
            <>
              {/* Logged-in User Avatar & Profile Link */}
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700/80 hover:opacity-90 transition-opacity"
                title="My Profile & Momentos"
              >
                <div className="avatar placeholder">
                  <div className="bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold uppercase leading-none">
                        {getInitials(user.name)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user.name}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="btn btn-ghost btn-sm px-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 gap-1.5 normal-case"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            /* Guest Sign In Button */
            <Link
              to="/login"
              className="btn btn-sm sm:btn-md bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-xl gap-1.5 sm:gap-2 normal-case font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;