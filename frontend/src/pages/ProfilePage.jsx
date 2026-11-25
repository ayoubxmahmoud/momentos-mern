import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
    Camera,
    ArrowLeft,
    Save,
    Loader2,
    Heart,
    Image as ImageIcon,
    Plus,
} from "lucide-react";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MomentoCard from "../components/MomentoCard";
import CreateMomentoModal from "../components/CreateMomentoModal";
import EditMomentoModal from "../components/EditMomentoModal";
import ViewMomentoModal from "../components/ViewMomentoModal";

const getInitials = (fullName) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
};

const ProfilePage = () => {
    const { userId } = useParams();
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const isOwnProfile = user?._id === userId;

    const [profileUser, setProfileUser] = useState(null);
    const [userMomentos, setUserMomentos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit profile state (only active when isOwnProfile is true)
    const [name, setName] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingMomento, setEditingMomento] = useState(null);
    const [viewingMomentoId, setViewingMomentoId] = useState(null);

    const fileInputRef = useRef(null);

    const requireAuth = (callback) => {
        if (!user) {
            toast.error("Please sign in to continue");
            navigate("/login");
            return;
        }
        callback();
    };

    // Fetch target user's profile & their momentos
    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const [userRes, momentosRes] = await Promise.all([
                    api.get(`/auth/profile/${userId}`),
                    api.get("/momentos"),
                ]);

                setProfileUser(userRes.data);
                setName(userRes.data.name || "");
                setAvatarPreview(userRes.data.avatar?.url || "");

                const filtered = momentosRes.data.filter(
                    (m) => m.creator?._id === userId || m.creator === userId
                );
                setUserMomentos(filtered);
            } catch (error) {
                toast.error("User profile not found");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchProfileData();
    }, [userId, navigate]);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await api.put("/auth/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            updateUser(res.data);
            setProfileUser(res.data);
            setAvatarFile(null);
            toast.success("Profile updated!");

            setUserMomentos((prev) =>
                prev.map((m) => ({
                    ...m,
                    creator: {
                        ...m.creator,
                        name: res.data.name,
                        avatar: res.data.avatar,
                    },
                }))
            );
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLike = (id) => {
        requireAuth(async () => {
            try {
                const res = await api.patch(`/momentos/${id}/like`);
                setUserMomentos((prev) =>
                    prev.map((item) => (item._id === id ? res.data : item))
                );
            } catch (error) {
                toast.error("Could not update like");
            }
        });
    };

    const handleDelete = (id) => {
        requireAuth(async () => {
            if (!window.confirm("Are you sure you want to delete this momento?")) return;
            try {
                await api.delete(`/momentos/${id}`);
                setUserMomentos((prev) => prev.filter((item) => item._id !== id));
                toast.success("Momento deleted");
            } catch (error) {
                toast.error("Failed to delete momento");
            }
        });
    };

    const totalLikes = userMomentos.reduce(
        (sum, m) => sum + (m.likes?.length || 0),
        0
    );
    const viewingMomento =
        userMomentos.find((item) => item._id === viewingMomentoId) || null;

    return (
        <div className="min-h-screen bg-[#131926] text-slate-100">
            <Navbar
                user={user}
                onLogout={logout}
                onOpenCreateModal={() =>
                    requireAuth(() => setIsCreateModalOpen(true))
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to All Momentos
                </Link>

                {/* Profile Header Card */}
                {loading ? (
                    <div className="h-40 rounded-2xl bg-[#1c2436] animate-pulse border border-slate-800" />
                ) : (
                    profileUser && (
                        <section className="bg-[#1c2436] border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
                            <form
                                onSubmit={handleProfileSave}
                                className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6"
                            >
                                {/* Avatar & Name */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-indigo-600/30 text-indigo-200 ring-2 ring-indigo-500/50 overflow-hidden flex items-center justify-center">
                                            {avatarPreview ? (
                                                <img
                                                    src={avatarPreview}
                                                    alt={profileUser.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-2xl font-bold uppercase leading-none">
                                                    {getInitials(profileUser.name)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Camera Button: Only shown on your own profile */}
                                        {isOwnProfile && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="btn btn-circle btn-xs bg-indigo-600 hover:bg-indigo-500 border-none text-white absolute bottom-0 right-0 shadow-lg"
                                                    title="Change Avatar"
                                                >
                                                    <Camera className="w-3.5 h-3.5" />
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                />
                                            </>
                                        )}
                                    </div>

                                    {/* Editable Name (Own Profile) vs. Read-Only Name (Other User) */}
                                    <div className="flex-1 w-full max-w-md space-y-2 text-center sm:text-left">
                                        {isOwnProfile ? (
                                            <>
                                                <label className="block text-xs font-medium text-slate-400">
                                                    Display Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="input input-bordered input-sm sm:input-md w-full bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white rounded-xl"
                                                    required
                                                />
                                                <p className="text-xs text-slate-400">
                                                    {profileUser.email}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <h1 className="text-2xl font-bold text-white">
                                                    {profileUser.name}
                                                </h1>
                                                <p className="text-sm text-slate-400">
                                                    Momentos Creator
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Stats & Save Button */}
                                <div className="flex flex-col items-center md:items-end justify-between gap-4 w-full md:w-auto">
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-2 rounded-xl bg-[#151c2c] border border-slate-800 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-medium">
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                <span>Momentos</span>
                                            </div>
                                            <p className="text-lg font-bold text-white mt-0.5">
                                                {userMomentos.length}
                                            </p>
                                        </div>

                                        <div className="px-4 py-2 rounded-xl bg-[#151c2c] border border-slate-800 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-medium">
                                                <Heart className="w-3.5 h-3.5" />
                                                <span>Likes</span>
                                            </div>
                                            <p className="text-lg font-bold text-white mt-0.5">
                                                {totalLikes}
                                            </p>
                                        </div>
                                    </div>

                                    {isOwnProfile && (
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold border-none rounded-xl gap-2 normal-case"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Save Profile
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </section>
                    )
                )}

                {/* User's Momentos Grid */}
                <section className="space-y-5">
                    <h2 className="text-xl font-bold text-white">
                        {isOwnProfile
                            ? "My Momentos"
                            : `${profileUser?.name || "User"}'s Momentos`}
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-80 rounded-2xl bg-[#1e2638] animate-pulse border border-slate-800"
                                />
                            ))}
                        </div>
                    ) : userMomentos.length === 0 ? (
                        <div className="text-center py-16 bg-[#1e2638]/50 rounded-2xl border border-slate-800">
                            <p className="text-slate-400 text-sm mb-4">
                                {isOwnProfile
                                    ? "You haven't posted any momentos yet."
                                    : "This user hasn't posted any momentos yet."}
                            </p>
                            {isOwnProfile && (
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold border-none gap-1.5"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Your First Momento
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userMomentos.map((momento) => (
                                <MomentoCard
                                    key={momento._id}
                                    momento={momento}
                                    currentUserId={user?._id}
                                    onView={(m) => setViewingMomentoId(m._id)}
                                    onLike={handleLike}
                                    onEdit={(m) => requireAuth(() => setEditingMomento(m))}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Modals */}
            <CreateMomentoModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onMomentoCreated={(newMomento) => {
                    if (isOwnProfile) {
                        setUserMomentos((prev) => [newMomento, ...prev]);
                    }
                }}
            />

            <EditMomentoModal
                momento={editingMomento}
                onClose={() => setEditingMomento(null)}
                onMomentoUpdated={(updated) =>
                    setUserMomentos((prev) =>
                        prev.map((item) => (item._id === updated._id ? updated : item))
                    )
                }
            />

            <ViewMomentoModal
                momento={viewingMomento}
                currentUserId={user?._id}
                onClose={() => setViewingMomentoId(null)}
                onLike={handleLike}
                onEdit={(m) => requireAuth(() => setEditingMomento(m))}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ProfilePage;
