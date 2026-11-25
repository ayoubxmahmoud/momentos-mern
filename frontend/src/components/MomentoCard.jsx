import { ThumbsUp, Trash2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TAG_COLORS = [
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "bg-purple-500/20 text-purple-300 border-purple-500/30",
];

const MomentoCard = ({ momento, currentUserId, onView, onLike, onDelete, onEdit }) => {
  const isLiked = momento.likes?.includes(currentUserId);

  const isGuest = !currentUserId;
  const isOwner =
    momento.creator?._id === currentUserId || momento.creator === currentUserId;
  const canShowActionButtons = isGuest || isOwner;

  const creatorName = momento.creator?.name || "Anonymous";
  const timeAgo = momento.createdAt
    ? formatDistanceToNow(new Date(momento.createdAt), { addSuffix: true })
    : "Just now";

  // Generates 1- or 2-letter uppercase initials from a user's full name for avatar fallbacks
  const getInitials = (fullName) => {
    // Fallback to "U" (User) if fullName is null, undefined, or empty
    if (!fullName) return "U";

    // Remove outer whitespace and split the name by one or more spaces into an array of words
    const parts = fullName.trim().split(/\s+/);

    // If the user only entered a single name (e.g., "Amine"), return its first letter capitalized
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    // Otherwise, combine the first letter of the first name and the first letter of the last name
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };


  return (
    <article className="card bg-[#1e2638] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all duration-300 flex flex-col">
      {/* Top Image Section with Dark Gradient Overlay */}
      <div onClick={() => onView(momento)} className="relative h-48 w-full cursor-pointer bg-slate-900 overflow-hidden group">
        <img
          src={
            momento.image?.url ||
            "https://unsplash.com"
          }
          alt={momento.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#1e2638] via-black/30 to-black/60" />


        {/* Creator Info & Edit Trigger */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="avatar placeholder">
              <div className="bg-slate-800/90 text-white rounded-full w-8 h-8 ring-1 ring-white/20 flex items-center justify-center">
                {momento.creator?.avatar ? (
                  <img src={momento.creator.avatar.url} alt={creatorName} />
                ) : (
                  <span className="text-sm font-bold uppercase leading-none tracking-tight">
                    {getInitials(creatorName)}
                  </span>
                )}
              </div>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white drop-shadow">
                {creatorName}
              </p>
              <p className="text-xs text-slate-300 drop-shadow">{timeAgo}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          {momento.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {momento.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${TAG_COLORS[index % TAG_COLORS.length]
                    }`}
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Title & Content */}
          <h2
            onClick={() => onView(momento)}
            className="text-lg font-bold text-white mb-1.5 line-clamp-1 cursor-pointer hover:text-indigo-400 transition-colors"
          >
            {momento.title}
          </h2>
          <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
            {momento.content}
          </p>
        </div>

        {/* Footer Actions: Like, Comments & Delete */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => onLike(momento._id)}
              className={`btn btn-xs sm:btn-sm rounded-lg gap-1.5 normal-case font-semibold transition-all ${isLiked
                  ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-600/35"
                  : "bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700"
                }`}
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${isLiked ? "fill-indigo-400 text-indigo-400" : ""
                  }`}
              />
              <span>LIKE {momento.likes?.length || 0}</span>
            </button>

            {/* Comment Counter Badge (Opens ViewMomentoModal) */}
            <button
              type="button"
              onClick={() => onView(momento)}
              className="btn btn-xs sm:btn-sm rounded-lg gap-1.5 normal-case font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 transition-all"
              title="View Comments"
            >
              <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>{momento.comments?.length || 0}</span>
            </button>
          </div>

          {/* Delete Button */}
          {canShowActionButtons && (
            <button
              type="button"
              onClick={() => onDelete(momento._id)}
              className="btn btn-ghost btn-xs sm:btn-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 gap-1 normal-case"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>DELETE</span>
            </button>
          )}
        </div>

      </div>
    </article>
  );
};

export default MomentoCard;
