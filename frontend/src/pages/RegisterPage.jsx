import { useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios"
import toast from "react-hot-toast";
import { Camera, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";


const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Automatically log the user in after registration
      login(res.data.user, res.data.token);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131926] flex items-center justify-center p-4 text-slate-100">
      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-[#1c2436] border border-indigo-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(79,70,229,0.18)]">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
            <Link to={"/"}>
              <Camera className="w-8 h-8" />            
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Join Momentos and start capturing your memories
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                id="name"
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full pl-10 bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full pl-10 bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full pl-10 pr-10 bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-500 hover:text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                id="confirm_password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-bordered w-full pl-10 bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold tracking-wide border-none rounded-xl shadow-lg shadow-emerald-500/20 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                CREATING ACCOUNT...
              </>
            ) : (
              "CREATE ACCOUNT"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
