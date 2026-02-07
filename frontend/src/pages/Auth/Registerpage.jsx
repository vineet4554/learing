import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";
import authService from "../../services/authService";
import { BrainCircuit, Mail, Lock, User, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Validation
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    toast.error("Passwords do not match");
    return;
  }

  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters");
    toast.error("Password must be at least 6 characters");
    return;
  }

  setLoading(true);

  try {
    const response = await authService.register(
      formData.name,
      formData.email,
      formData.password
    );

    // Fix: Access user and token from response.data
    if (response?.success && response?.data) {
      const { user, token } = response.data;  // ← Extract from data object
      
      login(user, token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } else {
      throw new Error("Invalid registration response");
    }
  } catch (err) {
    setError(err.message || "Registration failed");
    toast.error(err.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <BrainCircuit className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Create your account
            </h1>
            <p className="text-sm text-gray-500">
              Start your learning journey today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Full Name
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition-all ${
                  focusedField === 'name'
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <User className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Email
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition-all ${
                  focusedField === 'email'
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Password
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition-all ${
                  focusedField === 'password'
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 ml-1">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Confirm Password
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition-all ${
                  focusedField === 'confirmPassword'
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold py-3.5 rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Creating account..." : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-500 font-semibold hover:text-emerald-600 transition"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-gray-700">
            Terms
          </a>{" "}
          &{" "}
          <a href="#" className="underline hover:text-gray-700">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;