import { Search, X, Hash } from "lucide-react";

const SearchFilterBar = ({
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    allTags,
    totalResults,
}) => {
    const hasActiveFilters = searchQuery.trim() !== "" || selectedTag !== null;

    return (
        <div className="mb-8 space-y-4">
            {/* Top Row: Search Input & Clear Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by title, memory, or creator..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input input-bordered w-full pl-10 pr-10 bg-[#1e2638] border-slate-700/90 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            aria-label="Clear search"
                            className="group cursor-pointer text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full p-1.5 transition-colors absolute right-2 top-1/2 -translate-y-1/2"
                        >
                            <X className="w-4 h-4" />
                            {/* Floating Tooltip */}
                            <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap rounded bg-[#303134] px-2 py-1 text-xs font-medium text-white shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 z-10">
                                Clear search
                            </span>
                        </button>
                    )}

                </div>

                {/* Results Counter & Reset Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 text-sm">
                    <span className="text-slate-400">
                        Showing <strong className="text-white">{totalResults}</strong>{" "}
                        {totalResults === 1 ? "momento" : "momentos"}
                    </span>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedTag(null);
                            }}
                            className="btn btn-xs bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg normal-case"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Horizontal Tag Pills */}
            {allTags.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setSelectedTag(null)}
                        className={`btn btn-xs rounded-full normal-case font-medium transition-all ${selectedTag === null
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-[#1e2638] text-slate-400 border-slate-700 hover:text-white"
                            }`}
                    >
                        All
                    </button>

                    {allTags.map((tag) => {
                        const isActive = selectedTag?.toLowerCase() === tag.toLowerCase();
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setSelectedTag(isActive ? null : tag)}
                                className={`btn btn-xs rounded-full gap-0.5 normal-case font-medium transition-all ${isActive
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400"
                                    : "bg-[#1e2638] text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                                    }`}
                            >
                                <Hash className="w-3 h-3" />
                                {tag}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SearchFilterBar;
