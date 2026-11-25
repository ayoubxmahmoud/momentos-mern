import { Link } from "react-router";
import { Camera, Plus, LogOut, LogIn } from "lucide-react";

const getInitials = (fullName) => {
  if (!fullName) return "U";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts.charAt(0).toUpperCase();
  return (
    parts.charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const Navbar = ({ user, onLogout, onOpenCreateModal }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#1a2234]/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-lg sm:text-2xl font-bold tracking-tight text-white">
            Momentos
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="btn btn-sm sm:btn-md px-2.5 sm:px-4 bg-transparent hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:border-emerald-400 rounded-xl gap-1.5 sm:gap-2 normal-case font-medium transition-all"
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
                className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-700/80 hover:opacity-90 transition-opacity"
                title="My Profile & Momentos"
              >
                <div className="avatar placeholder">
                  <div className="bg-slate-700 text-slate-200 rounded-full w-8 h-8 sm:w-9 sm:h-9 ring-1 ring-slate-600 flex items-center justify-center overflow-hidden">
                    {user.avatar?.url ||
                    (typeof user.avatar === "string" && user.avatar) ? (
                      <img
                        src={user.avatar.url || user.avatar}
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
                <span className="hidden md:inline text-sm font-medium text-slate-300">
                  {user.name}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="btn btn-ghost btn-sm px-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 gap-1.5 normal-case"
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
