import { useState, useEffect } from "react";
import {
  X,
  ThumbsUp,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  MessageCircle,
  Send,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router";

const TAG_COLORS = [
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  "bg-purple-500/20 text-purple-300 border-purple-500/40",
];

const ViewMomentoModal = ({
  momento,
  currentUserId,
  onClose,
  onLike,
  onEdit,
  onDelete,
  onTagClick,
  onAddComment,
  onDeleteComment
}) => {
  const [zoom, setZoom] = useState(1);
  const [isPlainMode, setIsPlainMode] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [commentText, setCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);


  // Reset zoom, pan, and plain mode whenever a new momento opens or closes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsPlainMode(false);
  }, [momento?._id]);

  // Support Escape key to exit plain mode first, then close modal
  useEffect(() => {
    if (!momento) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isPlainMode) {
          setIsPlainMode(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [momento, isPlainMode, onClose]);

  if (!momento) return null;

  const isLiked = momento.likes?.includes(currentUserId);
  const isGuest = !currentUserId;
  const isOwner =
    currentUserId &&
    (momento.creator?._id === currentUserId ||
      momento.creator === currentUserId);
  const canShowActionButtons = isGuest || isOwner;

  const creatorName = momento.creator?.name || "Anonymous";
  const timeAgo = momento.createdAt
    ? formatDistanceToNow(new Date(momento.createdAt), { addSuffix: true })
    : "Just now";
  const exactDate = momento.createdAt
    ? format(new Date(momento.createdAt), "MMM d, yyyy • h:mm a")
    : "";

  // Zoom Handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 3));

  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(z - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleDoubleClick = () => {
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  // Drag-to-Pan Handlers when zoomed in
  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsPostingComment(true);
    await onAddComment(momento._id, commentText.trim(), () => {
      setCommentText("");
    });
    setIsPostingComment(false);
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Modal Container: Expands to full viewport in Plain Mode */}
      <div
        className={`relative bg-[#1c2436] border border-indigo-500/40 overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.25)] text-slate-100 transition-all duration-300 ${isPlainMode
          ? "w-full h-full rounded-none border-none bg-black grid grid-cols-1"
          : "w-full max-w-5xl rounded-2xl grid grid-cols-1 md:grid-cols-12 max-h-[90vh]"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button (Facebook-style circular dark button) */}
        <button
          type="button"
          onClick={onClose}
          className="btn btn-circle btn-sm bg-black/65 hover:bg-slate-800 border border-white/15 text-white absolute top-3.5 right-3.5 z-30"
          aria-label="Close modal"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image Stage */}
        <div
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          className={`relative bg-[#0b0f19] flex items-center justify-center overflow-hidden select-none ${isPlainMode
            ? "w-full h-full"
            : "md:col-span-7 h-[45vh] md:h-[85vh]"
            } ${zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"}`}
        >
          {/* Top-Left Viewer Controls: Plain Mode + Zoom Out + Zoom In */}
          <div
            className="absolute top-3.5 left-3.5 z-30 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Plain / Theater Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsPlainMode((prev) => !prev)}
              className="btn btn-circle btn-sm bg-black/65 hover:bg-slate-800 border border-white/15 text-white"
              title={isPlainMode ? "Exit Plain Mode" : "Plain Mode (Hide Details)"}
            >
              {isPlainMode ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Zoom Out */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="btn btn-circle btn-sm bg-black/65 hover:bg-slate-800 disabled:bg-black/40 disabled:text-slate-600 border border-white/15 text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Zoom In */}
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="btn btn-circle btn-sm bg-black/65 hover:bg-slate-800 disabled:bg-black/40 disabled:text-slate-600 border border-white/15 text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Zoom Percentage Pill (visible when zoomed) */}
            {zoom > 1 && (
              <span className="px-2.5 py-1 rounded-full bg-black/70 border border-white/15 text-xs font-medium text-slate-200">
                {Math.round(zoom * 100)}%
              </span>
            )}
          </div>

          {/* Zoomable & Pannable Image */}
          <img
            src={
              momento.image?.url ||
              "https://unsplash.com"
            }
            alt={momento.title}
            draggable={false}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Right Column: Details Sidebar (Hidden when Plain Mode is active) */}
        {!isPlainMode && (
          <div className="md:col-span-5 flex flex-col justify-between p-6 overflow-y-auto max-h-[45vh] md:max-h-[85vh] border-t md:border-t-0 md:border-l border-slate-800">
            <div>
              {/* Creator Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 pr-8">
                <div className="avatar placeholder">
                  <div className="bg-indigo-600/30 text-indigo-200 rounded-full w-10 h-10 ring-1 ring-indigo-500/40 flex items-center justify-center">
                    {momento.creator?.avatar ? (
                      <Link to={`/profile/${momento.creator._id}`}>
                        <img src={momento.creator.avatar.url} alt={creatorName} />
                      </Link>
                    ) : (
                      <span className="text-sm font-bold uppercase leading-none tracking-tight">
                        <Link to={`/profile/${momento.creator._id}`}>
                          {getInitials(creatorName)}
                        </Link>
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Link to={`/profile/${momento.creator._id}`}>
                    <p className="text-sm font-bold text-white">{creatorName}</p>
                  </Link>
                  <p className="text-xs text-slate-400" title={exactDate}>
                    {timeAgo}
                  </p>
                </div>
              </div>


              {/* Title & Full Content */}
              <div className="py-5 space-y-3">
                <h2 className="text-xl font-bold text-white leading-snug">
                  {momento.title}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {momento.content}
                </p>
              </div>

              {/* Clickable Tags */}
              {momento.tags?.length > 0 && (
                <div className="pt-2 pb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {momento.tags.map((tag, index) => (
                      <button
                        key={`${tag}-${index}`}
                        type="button"
                        onClick={() => {
                          onTagClick?.(tag.trim());
                          onClose();
                        }}
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border hover:brightness-125 transition cursor-pointer ${TAG_COLORS[index % TAG_COLORS.length]
                          }`}
                      >
                        #{tag.trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Comments Section (inside the scrollable sidebar) */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Comments ({momento.comments?.length || 0})</span>
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={500}
                    placeholder={
                      currentUserId ? "Write a comment..." : "Sign in to comment..."
                    }
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="input input-sm input-bordered flex-1 bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl"
                  />
                  <button
                    type="submit"
                    disabled={isPostingComment || !commentText.trim()}
                    className="btn btn-sm btn-circle bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 border-none text-white"
                    title="Post comment"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Comments List */}
                {momento.comments?.length > 0 ? (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {momento.comments.map((comment) => {
                      const authorName = comment.user?.name || "User";
                      const canDeleteComment =
                        currentUserId &&
                        (comment.user?._id === currentUserId ||
                          comment.user === currentUserId ||
                          isOwner);

                      return (
                        <div
                          key={comment._id}
                          className="bg-[#151c2c]/80 border border-slate-800/80 rounded-xl p-2.5 flex items-start justify-between gap-2 group"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="avatar placeholder">
                              <div className="bg-indigo-600/30 text-indigo-200 rounded-full w-10 h-10 ring-1 ring-indigo-500/40 flex items-center justify-center">
                                {comment.user?.avatar ? (
                                  <Link to={`/profile/${comment.user._id}`}>
                                    <img src={comment.user.avatar.url} alt={creatorName} />
                                  </Link>
                                ) : (
                                  <span className="text-sm font-bold uppercase leading-none tracking-tight">
                                    <Link to={`/profile/${comment.user._id}`}>
                                      {getInitials(creatorName)}
                                    </Link>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white truncate">
                                  {authorName}
                                </span>
                                {comment.createdAt && (
                                  <span className="text-[11px] text-slate-500">
                                    {formatDistanceToNow(new Date(comment.createdAt), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5 wrap-break-word leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                          </div>

                          {canDeleteComment && (
                            <button
                              type="button"
                              onClick={() => onDeleteComment(momento._id, comment._id)}
                              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No comments yet. Be the first to share a thought!
                  </p>
                )}
              </div>

            </div>

            {/* Footer: Exact Date & Action Bar */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              {exactDate && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Posted {exactDate}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => onLike(momento._id)}
                  className={`btn btn-sm rounded-xl gap-1.5 normal-case font-semibold transition-all ${isLiked
                    ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-600/35"
                    : "bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700"
                    }`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${isLiked ? "fill-indigo-400 text-indigo-400" : ""
                      }`}
                  />
                  <span>LIKE {momento.likes?.length || 0}</span>
                </button>

                {/* Edit & Delete Buttons */}
                {canShowActionButtons && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEdit(momento);
                      }}
                      className="btn btn-ghost btn-sm text-slate-300 hover:text-indigo-400 hover:bg-indigo-500/10 gap-1 normal-case"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>EDIT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onDelete(momento._id);
                      }}
                      className="btn btn-ghost btn-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 gap-1 normal-case"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>DELETE</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMomentoModal;
