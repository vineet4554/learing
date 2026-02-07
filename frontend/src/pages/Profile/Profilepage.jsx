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
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      

      {/* 🔹 Main Content */}
      <div className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold">Profile Settings</h1>

  <button
    onClick={handleDeleteAccount}
    className="px-5 py-2 bg-red-500 text-white rounded-xl flex items-center gap-2 hover:bg-red-600"
  >
    <Trash2 className="w-4 h-4" /> Delete Profile
  </button>
</div>

        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">User Information</h2>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <input
              name="username"
              value={profileData.username}
              onChange={handleProfileChange}
              disabled={!editing}
              className="w-full p-3 border rounded-xl"
              placeholder="Username"
            />

            <input
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              disabled={!editing}
              className="w-full p-3 border rounded-xl"
              placeholder="Email"
            />

            {editing && (
              <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            )}
          </form>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
              <input
                key={field}
                type="password"
                name={field}
                value={passwordData[field]}
                onChange={handlePasswordChange}
                className="w-full p-3 border rounded-xl"
                placeholder={field}
              />
            ))}

            <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl">
              Update Password
            </button>
          </form>
        </div>


      </div>
    </div>
  );
}

export default StylishProfilePage;