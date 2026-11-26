import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Plus, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import MomentoCard from "../components/MomentoCard";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import CreateMomentoModal from "../components/CreateMomentoModal";
import EditMomentoModal from "../components/EditMomentoModal";
import ViewMomentoModal from "../components/ViewMomentoModal";
import SearchFilterBar from "../components/SearchFilterBar";

const HomePage = () => {
  const [momentos, setMomentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const [editingMomento, setEditingMomento] = useState(null);
  const [viewingMomentoId, setViewingMomentoId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  // Reusable auth guard for protected actions
  const requireAuth = (callback) => {
    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/login");
      return;
    }
    callback();
  };

  // Places the newly created Momento at the front of the array
  const handleMomentoCreated = (newMomento) => {
    setMomentos((prev) => [newMomento, ...prev]);
  };

  // Fetch all Momentos
  useEffect(() => {
    const fetchMomentos = async () => {
      try {
        const res = await api.get("/momentos");
        setMomentos(res.data);
      } catch (error) {
        console.error("Error fetching momentos:", error);
        toast.error("Failed to load momentos");
      } finally {
        setLoading(false);
      }
    };
    fetchMomentos();
  }, []);

  // Protected: Create
  const handleOpenCreate = () => {
    requireAuth(() => setIsCreateModalOpen(true));
  };

  // Protected: Toggle Like
  const handleLike = (id) => {
    requireAuth(async () => {
      try {
        const res = await api.patch(`/momentos/${id}/like`);
        setMomentos((prev) =>
          prev.map((item) => (item._id === id ? res.data : item))
        );
      } catch (error) {
        toast.error("Could not update like");
      }
    });
  };

  // Protected: Edit
  const handleEdit = (momento) => {
    requireAuth(() => {
      setEditingMomento(momento);
    });
  };

  const handleMomentoUpdated = (updatedMomento) => {
    setMomentos((prev) =>
      prev.map((item) =>
        item._id === updatedMomento._id ? updatedMomento : item
      )
    );
  };

  // Protected: Delete Momento
  const handleDelete = (id) => {
    requireAuth(async () => {
      if (!window.confirm("Are you sure you want to delete this momento?")) return;
      try {
        await api.delete(`/momentos/${id}`);
        setMomentos((prev) => prev.filter((item) => item._id !== id));
        toast.success("Momento deleted");
      } catch (error) {
        toast.error("Failed to delete momento");
      }
    });
  };

  // Derive the live momento object so likes update in real time inside the modal
  const viewingMomento =
    momentos.find((item) => item._id === viewingMomentoId) || null;

  /**************** Search & Filter by Tags ****************/
  const allTags = useMemo(() => {
    const tagSet = new Set();
    momentos.forEach((m) => {
      m.tags?.forEach((t) => {
        if (t.trim()) tagSet.add(t.trim().toLowerCase());
      });
    });
    return Array.from(tagSet);
  }, [momentos]);

  const filteredMomentos = useMemo(() => {
    return momentos.filter((momento) => {
      const matchesTag =
        !selectedTag ||
        momento.tags?.some(
          (t) => t.trim().toLowerCase() === selectedTag.toLowerCase()
        );

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        momento.title?.toLowerCase().includes(q) ||
        momento.content?.toLowerCase().includes(q) ||
        momento.creator?.name?.toLowerCase().includes(q) ||
        momento.tags?.some((t) => t.toLowerCase().includes(q));

      return matchesTag && matchesSearch;
    });
  }, [momentos, searchQuery, selectedTag]);

  // Protected: Add Comment
  const handleAddComment = (momentoId, text, onSuccess) => {
    requireAuth(async () => {
      try {
        const res = await api.post(`/momentos/${momentoId}/comments`, { text });
        setMomentos((prev) =>
          prev.map((item) => (item._id === momentoId ? res.data : item))
        );
        onSuccess?.();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to post comment");
      }
    });
  };

  // Protected: Delete comment
  const handleDeleteComment = (momentoId, commentId) => {
    requireAuth(async () => {
      try {
        const res = await api.delete(
          `/momentos/${momentoId}/comments/${commentId}`
        );
        setMomentos((prev) =>
          prev.map((item) => (item._id === momentoId ? res.data : item))
        );
        toast.success("Comment deleted");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete comment");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131926] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        user={user}
        onLogout={logout}
        onOpenCreateModal={handleOpenCreate}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Tag Filter Bar */}
        {!loading && momentos.length > 0 && (
          <SearchFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            allTags={allTags}
            totalResults={filteredMomentos.length}
          />
        )}

        {/* 1. Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="h-80 rounded-2xl bg-slate-200 dark:bg-[#1e2638] animate-pulse border border-slate-300 dark:border-slate-800"
              />
            ))}
          </div>
        ) : momentos.length === 0 ? (
          /* 2. Empty Database State */
          <MomentosNotFound onOpenCreate={handleOpenCreate} />
        ) : filteredMomentos.length === 0 ? (
          /* 3. Empty Search / Tag Filter Result State */
          <div className="text-center py-16 bg-white dark:bg-[#1e2638]/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
              No momentos match your search or tag filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
              }}
              className="btn btn-sm bg-indigo-600 hover:bg-indigo-500 text-white border-none mt-2"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* 4. 3-Column Filtered Momentos Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMomentos.map((momento) => (
              <MomentoCard
                key={momento._id}
                momento={momento}
                currentUserId={user?._id}
                onView={(m) => setViewingMomentoId(m._id)}
                onLike={handleLike}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTagClick={(tag) => setSelectedTag(tag)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateMomentoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMomentoCreated={handleMomentoCreated}
      />

      <EditMomentoModal
        momento={editingMomento}
        onClose={() => setEditingMomento(null)}
        onMomentoUpdated={handleMomentoUpdated}
      />

      <ViewMomentoModal
        momento={viewingMomento}
        currentUserId={user?._id}
        onClose={() => setViewingMomentoId(null)}
        onLike={handleLike}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    </div>
  );
};

export default HomePage;
