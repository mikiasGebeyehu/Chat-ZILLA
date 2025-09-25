import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, checkAuth } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    if (authUser) {
      setSelectedImg(authUser.profilePic || null);
      setNewUsername(authUser.username || "");
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      try {
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated ✅");
        checkAuth(); // refresh authUser
      } catch (err) {
        console.error("Profile update failed:", err);
        toast.error("Failed to update profile picture ❌");
      }
    };
  };

  if (!authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="size-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-20 bg-base-200"
    >
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-100 rounded-3xl p-6 space-y-8 shadow-xl">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-primary">Profile</h1>
            <p className="mt-2 opacity-70">Your profile information</p>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <motion.img
                src={selectedImg || "/avatar.png"}
                alt="Profile"
                whileHover={{ scale: 1.05 }}
                className="size-32 rounded-full object-cover border-4 border-primary shadow-md cursor-pointer"
                onClick={() => document.getElementById("avatar-upload").click()}
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-primary p-2 rounded-full shadow-md cursor-pointer hover:scale-105 transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm opacity-60">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* User Info */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm opacity-60 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter new username"
                  disabled={isUpdatingProfile}
                />
                <button
                  onClick={async () => {
                    if (!newUsername || newUsername === authUser?.username) return;
                    try {
                      await updateProfile({ username: newUsername });
                      checkAuth();
                    } catch (err) {}
                  }}
                  disabled={isUpdatingProfile || !newUsername || newUsername === authUser?.username}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isUpdatingProfile || !newUsername || newUsername === authUser?.username
                      ? "bg-neutral cursor-not-allowed"
                      : "bg-primary hover:brightness-95"
                  }`}
                >
                  {isUpdatingProfile ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm opacity-60 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-6 bg-base-200 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-success">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;