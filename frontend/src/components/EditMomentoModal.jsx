import { useState, useEffect, useRef } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { X, CloudUpload, RefreshCw, Loader2 } from "lucide-react";

const TAG_COLORS = [
    "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    "bg-purple-500/20 text-purple-300 border-purple-500/40",
];

const EditMomentoModal = ({ momento, onClose, onMomentoUpdated }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    // Pre-fill form fields when a momento is selected for editing
    useEffect(() => {
        if (momento) {
            setTitle(momento.title || "");
            setContent(momento.content || "");
            setTagsInput(momento.tags?.join(", ") || "");
            setImagePreview(momento.image?.url || "");
            setImageFile(null);
        }
        console.log(momento);
    }, [momento]);

    if (!momento) return null;

    const parsedTags = tagsInput
        .split(",")
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean);

    const handleFileChange = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error("Title and Content are required");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("content", content.trim());
            formData.append("tags", JSON.stringify(parsedTags));
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const res = await api.put(`/momentos/${momento._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Momento updated!");
            onMomentoUpdated(res.data);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update momento");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-[#1c2436] border border-indigo-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(79,70,229,0.25)] text-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Edit Momento
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Title
                        </label>
                        <input
                            type="text"
                            maxLength={100}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input input-bordered w-full bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white rounded-xl"
                            required
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Content
                        </label>
                        <textarea
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="textarea textarea-bordered w-full bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white rounded-xl leading-relaxed"
                            required
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className="input input-bordered w-full bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white rounded-xl"
                        />
                        {parsedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {parsedTags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${TAG_COLORS[index % TAG_COLORS.length]
                                            }`}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Image Preview & Replace */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Image
                        </label>

                        {imagePreview ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-700 h-40 group">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn btn-sm bg-black/75 hover:bg-indigo-600 border-none text-white gap-1.5 absolute bottom-2.5 right-2.5 normal-case"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Replace Image
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer border-2 border-dashed border-slate-600/80 bg-[#151c2c]/60 hover:border-indigo-400/70 rounded-xl py-6 px-4 flex flex-col items-center justify-center text-center"
                            >
                                <CloudUpload className="w-6 h-6 text-slate-300 mb-1.5" />
                                <p className="text-sm text-slate-300">Click to upload image</p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0])}
                            className="hidden"
                        />

                    </div>

                    {/* Submit & Cancel */}
                    <div className="pt-2 space-y-2.5">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold tracking-wider border-none rounded-xl shadow-lg shadow-indigo-600/25"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    SAVING CHANGES...
                                </>
                            ) : (
                                "SAVE CHANGES"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="btn w-full bg-slate-700/70 hover:bg-slate-700 text-slate-200 font-semibold tracking-wider border-none rounded-xl"
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMomentoModal;
