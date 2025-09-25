// store/useAuthStore.js
import toast from "react-hot-toast";
import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  // ✅ Check if user is logged in
  checkAuth: async () => {
  set({ isCheckingAuth: true });
  try {
    const res = await axiosInstance.get("/auth/check", { withCredentials: true });
    set({ authUser: res.data.user }); // backend must return { user: {...} }
  } catch (error) {
    console.error("Check auth error:", error.response?.data || error.message);
    set({ authUser: null });
  } finally {
    set({ isCheckingAuth: false });
  }
},

  // ✅ Signup
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data, { withCredentials: true });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data.user) {
        set({ authUser: res.data.user });
      } else {
        await get().checkAuth(); // fallback if backend doesn’t send user
      }

      toast.success("Signup successful! 🎉");
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Signup failed 😢");
      set({ authUser: null });
    } finally {
      set({ isSigningUp: false });
    }
  },

  // ✅ Login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data, { withCredentials: true });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data.user) {
        set({ authUser: res.data.user });
      } else {
        await get().checkAuth();
      }

      toast.success("Login successful ✅");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed ❌");
      set({ authUser: null });
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ✅ Logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });

      localStorage.removeItem("token");
      set({ authUser: null });

      toast.success("Logged out successfully 👋");
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      toast.error("Logout failed");
    }
  },

    // ✅ Update Profile
    updateProfile: async (data) => {
  set({ isUpdatingProfile: true });
  try {
    const res = await axiosInstance.put("/auth/profile", data, { withCredentials: true });
    set({ authUser: res.data }); // ✅ backend sends user object directly
    toast.success("Profile updated successfully ✅");
  } catch (error) {
    console.error("Update profile error:", error.response?.data || error.message);
    toast.error("Profile update failed ❌");
  } finally {
    set({ isUpdatingProfile: false });
  }
},
}));
