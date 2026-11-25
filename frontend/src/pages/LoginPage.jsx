import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Camera, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";


const LoginPage = () => {
  // State variables for form inputs and UI behavior
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Extract the login function from custom React Authentication hook,
  // So your component can update the app's global login state
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handles form submission and user login
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default page reload on form submission
    
    if (!email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // Send the login credentials to the backend API
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // Expecting { user, token } from backend
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131926] flex items-center justify-center p-4 text-slate-100">
      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-[#1c2436] border border-indigo-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(79,70,229,0.18)]">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-3">
            <Link to={"/"}>
              <Camera className="w-8 h-8" />            
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to share and explore Momentos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full pl-10 bg-[#151c2c] border-slate-700 focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none"/>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold tracking-wide border-none rounded-xl shadow-lg shadow-indigo-600/25 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SIGNING IN...
              </>
            ) : (
              "SIGN IN"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
