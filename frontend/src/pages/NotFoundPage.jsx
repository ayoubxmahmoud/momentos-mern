import { Link, useNavigate } from "react-router";
import { CameraOff, Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#131926] flex items-center justify-center p-4 text-slate-100">
      {/* Main 404 Card */}
      <div className="w-full max-w-md bg-[#1c2436] border border-indigo-500/30 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(79,70,229,0.18)]">
        {/* Icon Badge */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
          <CameraOff className="w-8 h-8" />
        </div>

        {/* Big 404 Display */}
        <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-emerald-400">
          404
        </h1>

        <h2 className="text-xl font-bold text-white mt-3">
          Momento Not Found
        </h2>

        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          The page or memory you&apos;re looking for doesn&apos;t exist, was
          deleted, or the link might be broken.
        </p>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl gap-2 normal-case"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="btn w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-xl gap-2 normal-case shadow-lg shadow-indigo-600/25"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
