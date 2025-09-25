import { create } from "zustand";
import axios from "../lib/axios";
import socket from "../lib/socket";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  activeUserId: null,
  onlineUserIds: new Set(),
  typingByUserId: {},
  isLoadingUsers: false,
  isLoadingMessages: false,
  isSending: false,

  setActiveUser: (userId) => set({ activeUserId: userId, messages: [] }),
  setTyping: (fromUserId, isTyping) => set((state) => ({
    typingByUserId: { ...state.typingByUserId, [fromUserId]: isTyping }
  })),
  setOnline: (userId, online) => set((state) => {
    const next = new Set(state.onlineUserIds);
    online ? next.add(userId) : next.delete(userId);
    return { onlineUserIds: next };
  }),

  fetchUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const res = await axios.get("/message/users", { withCredentials: true });
      set({ users: res.data || [] });
    } catch (err) {
      console.error("fetchUsers error:", err.response?.data || err.message);
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  fetchMessages: async (userId) => {
    const id = userId || get().activeUserId;
    if (!id) return;
    set({ isLoadingMessages: true });
    try {
      const res = await axios.get(`/message/${id}`, { withCredentials: true });
      const list = Array.isArray(res.data) ? res.data : [];
      const uniq = Object.values(list.reduce((acc, m) => { acc[m._id] = m; return acc; }, {}));
      set({ messages: uniq });
    } catch (err) {
      console.error("fetchMessages error:", err.response?.data || err.message);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async ({ text, image, audio, video, durationMs }) => {
    const id = get().activeUserId;
    if (!id || (!text && !image && !audio && !video)) return;
    set({ isSending: true });
    try {
      const res = await axios.post(`/message/${id}`, { text, image, audio, video, durationMs }, { withCredentials: true });
      const saved = res.data;
      // upsert by _id
      const existing = get().messages;
      const idx = existing.findIndex(m => m._id === saved._id);
      if (idx >= 0) {
        const next = existing.slice();
        next[idx] = saved;
        set({ messages: next });
      } else {
        set({ messages: [...existing, saved] });
      }
      // also emit via socket for realtime
      const me = useAuthStore.getState().authUser?._id;
      if (me && (text || image || audio || video)) {
        socket.emit('sendMessage', { senderId: me, receiverId: id, content: text || '[media]' });
      }
    } catch (err) {
      console.error("sendMessage error:", err.response?.data || err.message);
    } finally {
      set({ isSending: false });
    }
  },

  addMessageIfNew: (msg) => set((state) => {
    if (state.messages.some(m => m._id === msg._id)) return {};
    return { messages: [...state.messages, msg] };
  }),

  markMessageReadLocal: (messageId, readAt) => set((state) => ({
    messages: state.messages.map(m => m._id === messageId ? { ...m, readAt } : m)
  })),

  markThreadRead: async () => {
    const myId = useAuthStore.getState().authUser?._id;
    const peerId = get().activeUserId;
    if (!myId || !peerId) return;
    const toRead = get().messages.filter(m => m.recieverId === String(myId) && !m.readAt);
    for (const m of toRead) {
      try {
        const res = await axios.post(`/message/read/${m._id}`, {}, { withCredentials: true });
        get().markMessageReadLocal(m._id, res.data.readAt);
      } catch (_) {}
    }
  },
}));


