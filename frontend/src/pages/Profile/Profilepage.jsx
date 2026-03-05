import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";
import authService from "../../services/authService";
import {
  User,
  Mail,
  Lock,
  Save,
  Edit2,
  Trash2,
  LogOut,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

function StylishProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.updateProfile(profileData);

      if (response.success && response.data?.user) {
        updateUser(response.data.user);
        toast.success("Profile updated successfully");
        setEditing(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your account?"
    );
    if (!confirmDelete) return;

    try {
      toast.success("Account deleted");
      logout();
      navigate("/login");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);

    try {
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
      <div className="bg-white/95 rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg shadow-emerald-500/20">
              {profileData.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
                Profile
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                Profile Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Keep your account details current and secure your access.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 hover:bg-red-100 border border-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Profile
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white/95 rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
              <p className="text-sm text-gray-500">
                Manage how your profile appears across the app.
              </p>
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/20"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-gray-500">
                Username
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <User className="w-4 h-4 text-emerald-500" />
                <input
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  disabled={!editing}
                  className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:text-gray-500"
                  placeholder="Username"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-widest text-gray-500">
                Email Address
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <Mail className="w-4 h-4 text-cyan-500" />
                <input
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled={!editing}
                  className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:text-gray-500"
                  placeholder="Email"
                />
              </div>
            </label>

            {editing && (
              <button
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Change Password</h2>
            <p className="text-sm text-gray-500 mb-6">
              Choose a strong password you do not use elsewhere.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {["currentPassword", "newPassword", "confirmPassword"].map(
                (field) => (
                  <label key={field} className="block">
                    <span className="text-xs uppercase tracking-widest text-gray-500">
                      {field === "currentPassword"
                        ? "Current Password"
                        : field === "newPassword"
                        ? "New Password"
                        : "Confirm Password"}
                    </span>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <input
                        type="password"
                        name={field}
                        value={passwordData[field]}
                        onChange={handlePasswordChange}
                        className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
                        placeholder="........"
                      />
                    </div>
                  </label>
                )
              )}

              <button
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-600 disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default StylishProfilePage;
