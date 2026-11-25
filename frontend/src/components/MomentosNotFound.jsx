import { Camera, Plus } from "lucide-react";

const MomentosNotFound = ({ onOpenCreate }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 bg-[#1e2638]/50 border border-slate-800 rounded-3xl max-w-md mx-auto text-center space-y-5 shadow-xl">
      {/* Icon Badge */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full p-6">
        <Camera className="w-10 h-10 text-emerald-400" />
      </div>

      {/* Heading & Description */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          No Momentos yet
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Ready to capture your favorite memories? Share your first Momento to get started on your journey.
        </p>
      </div>

      {/* Trigger Create Modal */}
      <button
        type="button"
        onClick={onOpenCreate}
        className="btn bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold border-none rounded-xl gap-2 shadow-lg shadow-emerald-500/20"
      >
        <Plus className="w-4 h-4" />
        Create Your First Momento
      </button>
    </div>
  );
};

export default MomentosNotFound;
