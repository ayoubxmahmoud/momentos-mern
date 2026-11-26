import { ThumbsUp, Trash2, MessageCircle, Edit3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TAG_COLORS = [
  "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30",
  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30",
  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30",
];

const MomentoCard = ({ momento, currentUserId, onView, onLike, onDelete, onEdit, onTagClick }) => {
  const isLiked = momento.likes?.includes(currentUserId);

  const isGuest = !currentUserId;
  const isOwner =
    momento.creator?._id === currentUserId || momento.creator === currentUserId;
  const canShowActionButtons = isGuest || isOwner;

  const creatorName = momento.creator?.name || "Anonymous";
  const timeAgo = momento.createdAt
    ? formatDistanceToNow(new Date(momento.createdAt), { addSuffix: true })
    : "Just now";

  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <article className="card bg-white dark:bg-[#1e2638] border border-slate-200 dark:border-slate-800/90 rounded-2xl overflow-hidden shadow-md hover:shadow-lg dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col">
      {/* Top Image Section with Gradient Overlay */}
      <div
        onClick={() => onView(momento)}
        className="relative h-48 w-full cursor-pointer bg-slate-200 dark:bg-slate-900 overflow-hidden group"
      >
        <img
          src={momento.image?.url || "https://unsplash.com"}
          alt={momento.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Smooth bottom transition into card surface + dark top scrim for white creator text */}
        <div className="absolute inset-0 bg-linear-to-t from-white dark:from-[#1e2638] via-black/25 to-black/60" />

        {/* Creator Info (stays white over the dark top image scrim) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="avatar placeholder">
              <div className="bg-slate-800/90 text-white rounded-full w-8 h-8 ring-1 ring-white/25 flex items-center justify-center overflow-hidden">
                {momento.creator?.avatar?.url ? (
                  <img
                    src={momento.creator.avatar.url}
                    alt={creatorName}
                    className="w-full h-full object-cover"
                  />
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
              <p className="text-xs text-slate-200 drop-shadow">{timeAgo}</p>
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
                  onClick={() => onTagClick?.(tag.trim().toLowerCase())}
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${TAG_COLORS[index % TAG_COLORS.length]
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
            className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 line-clamp-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {momento.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
            {momento.content}
          </p>
        </div>

        {/* Footer Actions: Like, Comments & Delete */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => onLike(momento._id)}
              className={`btn btn-xs sm:btn-sm rounded-lg gap-1.5 normal-case font-semibold transition-all ${isLiked
                ? "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-600/25 dark:text-indigo-300 dark:border-indigo-500/50 dark:hover:bg-indigo-600/35"
                : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                }`}
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${isLiked
                  ? "fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400"
                  : ""
                  }`}
              />
              <span>LIKE {momento.likes?.length || 0}</span>
            </button>

            {/* Comment Counter Badge (Opens ViewMomentoModal) */}
            <button
              type="button"
              onClick={() => onView(momento)}
              className="btn btn-xs sm:btn-sm rounded-lg gap-1.5 normal-case font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:border-cyan-400 hover:text-cyan-700 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 dark:hover:border-cyan-500/50 dark:hover:text-cyan-300 transition-all"
              title="View Comments"
            >
              <MessageCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{momento.comments?.length || 0}</span>
            </button>
          </div>

          {/* Edit & Delete Buttons */}
          {canShowActionButtons && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onEdit(momento);
                }}
                className="btn btn-ghost btn-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 gap-1 normal-case"
              >
                <Edit3 className="w-4 h-4" />
                <span>EDIT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDelete(momento._id);
                }}
                className="btn btn-ghost btn-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 gap-1 normal-case"
              >
                <Trash2 className="w-4 h-4" />
                <span>DELETE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default MomentoCard;
