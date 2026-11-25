import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { X, CloudUpload, Trash2, Loader2 } from "lucide-react";
import api from "../lib/axios";

const TAG_COLORS = [
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  "bg-purple-500/20 text-purple-300 border-purple-500/40",
];

const CreateMomentoModal = ({ isOpen, onClose, onMomentoCreated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Parse comma-separated tags into clean array for live preview & submission
  const parsedTags = tagsInput
    .split(",")
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean);

  // Validates a selected image file and generates a local preview URL
  const handleFileChange = (file) => {
    if (!file) return;

    // Ensure the uploaded file is actually an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setImageFile(file); // Store the raw File object for form submission
    setImagePreview(URL.createObjectURL(file)); // Create a temporary browser URL to preview the image
  };

  // Handles files dragged and dropped into the upload dropzone
  const handleDrop = (e) => {
    e.preventDefault(); // Prevent the browser from opening the file in a new tab
    setIsDragging(false); // Reset drag-over visual highlight
    const file = e.dataTransfer.files?.[0]; // Grab the first dropped file
    handleFileChange(file); // Pass it through the same validation and preview logic
  };

  // Resets all form fields, image previews, and the hidden file input element
  const handleClear = () => {
    setTitle("");
    setContent("");
    setTagsInput("");
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the native file input value
  };

  // Validates inputs, packages data into FormData, and sends a POST request to create a momento
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default page reload on form submit

    // Ensure required text fields are not blank
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content are required");
      return;
    }

    setIsSubmitting(true); // Disable submit button / show loading state
    try {
      // Using FormData so Multer + Cloudinary on the backend can process text + binary image file
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("tags", JSON.stringify(parsedTags)); // Stringify array so it can be sent in FormData
      if (imageFile) {
        formData.append("image", imageFile); // Field name "image" matches upload.single("image") on backend
      }

      // Send multipart/form-data request to the backend API
      const res = await api.post("/momentos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Notify user, update parent state with the new momento, reset form, and close modal
      toast.success("Momento created!");
      onMomentoCreated(res.data);
      handleClear();
      onClose();
    } catch (error) {
      // Log error for debugging and show server error message or generic fallback
      console.error("Create momento error:", error);
      toast.error(error.response?.data?.message || "Failed to create momento");
    } finally {
      // Re-enable form submission regardless of success or failure
      setIsSubmitting(false);
    }
  };


  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Modal Box with Subtle Indigo Glow */}
      <div
        className="relative my-auto w-full max-w-lg bg-[#1c2436] border border-indigo-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(79,70,229,0.25)] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Create a Momento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close modal"
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
              placeholder="Momento Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl"
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
              placeholder="Describe your memory..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea textarea-bordered w-full bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl leading-relaxed"
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
              placeholder="adventure, sunset, travel..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="input input-bordered w-full bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl"
            />

            {/* Live Colored Tag Pills */}
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

          {/* Upload Image Dropzone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Upload Image
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
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="btn btn-sm btn-circle bg-black/70 hover:bg-rose-600 border-none text-white absolute top-2 right-2"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`cursor-pointer border-2 border-dashed rounded-xl py-7 px-4 flex flex-col items-center justify-center text-center transition-colors ${isDragging
                    ? "border-indigo-400 bg-indigo-500/10"
                    : "border-slate-600/80 bg-[#151c2c]/60 hover:border-indigo-400/70 hover:bg-[#151c2c]"
                  }`}
              >
                <div className="p-2.5 rounded-full bg-slate-800 text-slate-200 mb-2">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Click or drag image to upload
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG, or WEBP (max 5MB)
                </p>
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

          {/* Action Buttons: SUBMIT & CLEAR */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold tracking-wider border-none rounded-xl shadow-lg shadow-indigo-600/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  UPLOADING...
                </>
              ) : (
                "SUBMIT"
              )}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isSubmitting}
              className="btn w-full bg-slate-700/70 hover:bg-slate-700 text-slate-200 font-semibold tracking-wider border-none rounded-xl"
            >
              CLEAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMomentoModal;
