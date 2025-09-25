import socket from './socket';

export function createPeer(onRemoteStream) {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  pc.ontrack = (ev) => {
    const [stream] = ev.streams;
    onRemoteStream?.(stream);
  };
  pc.onicecandidate = (ev) => {
    if (ev.candidate && pc.__peerMeta) {
      socket.emit('webrtc:ice', { toUserId: pc.__peerMeta.toUserId, fromUserId: pc.__peerMeta.fromUserId, candidate: ev.candidate });
    }
  };
  return pc;
}

export async function startVoiceCall({ meId, peerId }, onRemoteStream) {
  const pc = createPeer(onRemoteStream);
  pc.__peerMeta = { toUserId: peerId, fromUserId: meId };
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach(t => pc.addTrack(t, stream));
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('webrtc:offer', { toUserId: peerId, fromUserId: meId, offer });
  return { pc, localStream: stream };
}

export function bindSignaling({ meId, onAnswer, onOffer, onIce, getPeer }) {
  socket.on('webrtc:offer', async ({ fromUserId, offer }) => {
    const pc = getPeer(fromUserId) || createPeer(onAnswer?.onRemoteStream);
    pc.__peerMeta = { toUserId: fromUserId, fromUserId: meId };
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('webrtc:answer', { toUserId: fromUserId, fromUserId: meId, answer });
    onOffer?.({ pc, localStream: stream, fromUserId });
  });

  socket.on('webrtc:answer', async ({ fromUserId, answer }) => {
    const pc = getPeer(fromUserId);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    onAnswer?.onAnswered?.(fromUserId);
  });

  socket.on('webrtc:ice', async ({ fromUserId, candidate }) => {
    const pc = getPeer(fromUserId);
    if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    onIce?.(fromUserId);
  });

  socket.on('webrtc:end', ({ fromUserId }) => {
    const pc = getPeer(fromUserId);
    if (pc) {
      pc.getSenders().forEach(s => s.track?.stop());
      pc.close();
    }
  });
}


