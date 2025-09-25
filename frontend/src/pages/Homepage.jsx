import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { Loader2, Send, Image as ImageIcon, Search, Mic, Square, Phone, PhoneOff } from 'lucide-react'
import { startVoiceCall, bindSignaling } from '../lib/webrtc'
import socket from '../lib/socket'

const Home = () => {
  const { authUser } = useAuthStore();
  const {
    users,
    messages,
    activeUserId,
    onlineUserIds,
    typingByUserId,
    isLoadingUsers,
    isLoadingMessages,
    isSending,
    setActiveUser,
    setTyping,
    setOnline,
    fetchUsers,
    fetchMessages,
    sendMessage,
  } = useChatStore();

  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordStart, setRecordStart] = useState(0);
  const [peers, setPeers] = useState({});
  const [inCallWith, setInCallWith] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeUserId) fetchMessages(activeUserId);
  }, [activeUserId]);

  // Mark messages as read when thread opens or new messages arrive
  useEffect(() => {
    if (!activeUserId) return;
    const id = setTimeout(() => {
      useChatStore.getState().markThreadRead?.();
    }, 300);
    return () => clearTimeout(id);
  }, [activeUserId, messages.length]);

  // join my room and listen for realtime messages
  useEffect(() => {
    if (authUser?._id) {
      socket.emit('join', authUser._id);
    }
    const onReceive = (msg) => {
      // if message belongs to currently open conversation, append if not duplicate
      if (msg.senderId === activeUserId || msg.recieverId === activeUserId) {
        useChatStore.getState().addMessageIfNew?.(msg);
      }
    };
    const onRead = ({ messageId, readAt }) => {
      useChatStore.getState().markMessageReadLocal?.(messageId, readAt);
    };
    const onPresence = ({ userId, online }) => setOnline(userId, online);
    const onTyping = ({ fromUserId }) => setTyping(fromUserId, true);
    const onStopTyping = ({ fromUserId }) => setTyping(fromUserId, false);
    socket.on('receiveMessage', onReceive);
    socket.on('message:read', onRead);
    socket.on('presence:update', onPresence);
    socket.on('typing', onTyping);
    socket.on('stopTyping', onStopTyping);
    return () => {
      socket.off('receiveMessage', onReceive);
      socket.off('message:read', onRead);
      socket.off('presence:update', onPresence);
      socket.off('typing', onTyping);
      socket.off('stopTyping', onStopTyping);
    };
  }, [authUser?._id, activeUserId]);

  // Bind signaling listeners once
  useEffect(() => {
    if (!authUser?._id) return;
    bindSignaling({
      meId: authUser._id,
      onAnswer: { onRemoteStream: (s)=>attachRemoteAudio(s), onAnswered: ()=>{} },
      onOffer: ({ pc, localStream, fromUserId }) => {
        setPeers(prev => ({ ...prev, [fromUserId]: { pc, localStream } }));
        setInCallWith(fromUserId);
      },
      onIce: ()=>{},
      getPeer: (peerId) => peers[peerId]?.pc,
    });
  }, [authUser?._id, peers]);

  const attachRemoteAudio = (stream) => {
    const el = document.getElementById('remote-audio');
    if (el) {
      el.srcObject = stream;
      el.play().catch(()=>{});
    }
  };

  const onStartCall = async () => {
    if (!authUser?._id || !activeUserId) return;
    const { pc, localStream } = await startVoiceCall({ meId: authUser._id, peerId: activeUserId }, (s)=>attachRemoteAudio(s));
    setPeers(prev => ({ ...prev, [activeUserId]: { pc, localStream } }));
    setInCallWith(activeUserId);
  };

  const onEndCall = () => {
    if (!inCallWith) return;
    const entry = peers[inCallWith];
    if (entry) {
      entry.pc.getSenders().forEach(s=>s.track?.stop());
      entry.pc.close();
    }
    socket.emit('webrtc:end', { toUserId: inCallWith, fromUserId: authUser?._id });
    setPeers(prev => { const n={...prev}; delete n[inCallWith]; return n; });
    setInCallWith(null);
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.username?.toLowerCase().includes(q));
  }, [users, search]);

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const onSelectImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeUserId) return;
    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result;
        await sendMessage({ image: base64 });
        setIsUploading(false);
      };
      reader.onerror = () => setIsUploading(false);
    } catch (_) {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    if (!activeUserId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      mr.onstop = async () => {
        if (!chunks.length) { setIsRecording(false); return; }
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = async () => {
          const base64 = reader.result;
          const durationMs = Date.now() - recordStart;
          try {
            await sendMessage({ audio: base64, durationMs });
          } catch (e) {
            console.error('send audio failed', e);
          }
        };
      };
      mr.start();
      setMediaRecorder(mr);
      setRecordStart(Date.now());
      setIsRecording(true);
    } catch (err) {
      console.error('mic error', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
    setMediaRecorder(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-20 bg-base-200"
    >
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="card bg-base-100 border border-base-300 shadow-sm"
          >
            <div className="card-body p-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
                  <input
                    className="input input-bordered w-full pl-9 transition-shadow duration-200 focus:shadow-sm"
                    placeholder="Search users"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="divide-y divide-base-300">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin" /></div>
                ) : (
                  filteredUsers.map((u) => (
                    <motion.button
                      key={u._id}
                      onClick={() => setActiveUser(u._id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left py-3 flex items-center gap-3 hover:bg-base-200 px-2 rounded-lg transition-colors ${activeUserId===u._id?'bg-base-200':''}`}
                    >
                      <div className="relative">
                        <img src={u.profilePic || '/avatar.png'} alt="" className="size-8 rounded-full object-cover" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-base-100 ${onlineUserIds.has(u._id)?'bg-green-500':'bg-gray-400'}`} />
                      </div>
    <div>
                        <div className="font-medium leading-tight">{u.username}</div>
                        <div className="text-xs text-base-content/60">{u.email}</div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chat panel */}
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="card bg-base-100 border border-base-300 shadow-sm h-[70vh] flex"
          >
            <div className="card-body p-0 flex-1 flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-base-300 flex items-center gap-3 justify-between bg-base-100/95 backdrop-blur z-10 relative">
                {activeUserId ? (
                  <>
                    <div className="flex items-center gap-3">
                      <img src={users.find(u=>u._id===activeUserId)?.profilePic || '/avatar.png'} className="size-8 rounded-full ring-1 ring-base-300" />
                      <div className="flex flex-col text-base-content">
                        <div className="font-medium leading-none text-base-content">{users.find(u=>u._id===activeUserId)?.username || 'Conversation'}</div>
                        {typingByUserId[activeUserId] && (<div className="text-xs text-primary mt-0.5">typing...</div>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 z-10">
                      {inCallWith === activeUserId ? (
                        <button className="btn btn-error btn-sm text-white hover:brightness-95 shadow" onClick={onEndCall}><PhoneOff className="size-4" /></button>
                      ) : (
                        <button className="btn btn-Secondary btn-sm text-white hover:brightness-95 shadow" onClick={onStartCall}><Phone className="size-4" /></button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-base-content/60">Select a user to start chatting</div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin" /></div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((m) => (
                      <motion.div
                        key={m._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className={`chat ${m.senderId===authUser?._id? 'chat-end':'chat-start'}`}
                      >
                        <div className="chat-image avatar">
                          <div className="w-8 rounded-full">
                            <img src={(m.senderId===authUser?._id? authUser?.profilePic: users.find(u=>u._id===activeUserId)?.profilePic) || '/avatar.png'} />
                          </div>
                        </div>
                        <motion.div layout className="chat-bubble">
                          {m.text}
                          {m.image && <img src={m.image} className="mt-2 max-w-xs rounded" />}
                          {m.audio && (
                            <audio className="mt-2" controls src={m.audio} />
                          )}
                          {m.video && (
                            <video className="mt-2 max-w-xs rounded" controls src={m.video} />
                          )}
                        </motion.div>
                        <div className="chat-footer opacity-60 text-xs mt-0.5 flex items-center gap-1">
                          {formatTime(m.createdAt)}
                          {m.senderId===authUser?._id && (
                            <span className="ml-1 text-gray-800">{m.readAt ? '✔️✔️' : '✔️✔️'}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* hidden audio sink for remote stream */}
              <audio id="remote-audio" hidden />

              {/* Composer */}
              <div className="p-3 border-t border-base-300 bg-base-100/95 backdrop-blur sticky bottom-0 z-10">
                <form
                  onSubmit={(e)=>{e.preventDefault(); if(!text.trim()) return; sendMessage({ text: text.trim() }); setText('');}}
                  className="flex gap-2"
                >
                  <input
                    className="input input-bordered flex-1 transition-shadow duration-200 focus:shadow-sm bg-base-100 text-base-content"
                    placeholder={activeUserId?"Type a message":"Select a user to chat"}
                    disabled={!activeUserId || isSending}
                    value={text}
                    onChange={(e)=>{ setText(e.target.value); if (activeUserId) { if (e.target.value) socket.emit('typing', { fromUserId: authUser?._id, toUserId: activeUserId }); else socket.emit('stopTyping', { fromUserId: authUser?._id, toUserId: activeUserId }); } }}
                  />
                  <input id="chat-image-input" type="file" accept="image/*" className="hidden" onChange={onSelectImage} />
                  <button type="button" className="btn hover:brightness-95 text-base-content" disabled={!activeUserId || isSending || isUploading} onClick={()=>document.getElementById('chat-image-input').click()}>
                    <ImageIcon className="size-4" />
                  </button>
                  {isRecording ? (
                    <button type="button" className="btn btn-error hover:brightness-95 text-white" onClick={stopRecording}>
                      <Square className="size-4" />
                    </button>
                  ) : (
                    <button type="button" className="btn hover:brightness-95 text-base-content" disabled={!activeUserId} onClick={startRecording}>
                      <Mic className="size-4" />
                    </button>
                  )}
                  <button className="btn btn-Secondary hover:brightness-95 text-white shadow" disabled={!activeUserId || isSending}>
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default Home