import { useRef, useState, useEffect } from "react";
import {
  Search,
  X,
  Hash,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SearchFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  allTags = [],
  totalResults = 0,
}) => {
  const hasActiveFilters = Boolean(searchQuery.trim() || selectedTag);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [allTags]);

  const slideTags = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  const handleWheelScroll = (e) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1e2638] border border-slate-200 dark:border-slate-800/90 shadow-sm dark:shadow-lg space-y-4 transition-colors">
      {/* Top Row: Search Input + Result Counter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search momentos by title, content, author, or tag..."
            className="input input-sm sm:input-md w-full pl-10 pr-10 bg-slate-100 dark:bg-slate-900/70 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none rounded-xl transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results Count & Reset Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing{" "}
            <strong className="text-slate-900 dark:text-white font-semibold">
              {totalResults}
            </strong>{" "}
            {totalResults === 1 ? "momento" : "momentos"}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
              }}
              className="btn btn-xs rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 dark:hover:bg-rose-500/20 normal-case font-medium gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Tag Filter Pills with Slider & Scrollbar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
          {/* Fixed Label */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Tags:</span>
          </div>

          {/* Left Arrow Button (only shows after scrolling right) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => slideTags("left")}
              className="btn btn-circle btn-xs bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200 shrink-0"
              aria-label="Scroll tags left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Clean Scrollable Tag Track (No bulky OS scrollbar) */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            onWheel={handleWheelScroll}
            className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
          >
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                selectedTag === null
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
              }`}
            >
              All
            </button>

            {allTags.map((tag) => {
              const isSelected =
                selectedTag?.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`inline-flex items-center gap-0.5 px-3 py-1 rounded-full text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 dark:hover:border-indigo-500/50 dark:hover:text-indigo-300"
                  }`}
                >
                  <Hash className="w-3 h-3 opacity-75" />
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button (only shows when more tags overflow right) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => slideTags("right")}
              className="btn btn-circle btn-xs bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200 shrink-0"
              aria-label="Scroll tags right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default SearchFilterBar;
