import User from "../model/user.model.js"
import Messages from "../model/message.model.js"
import cloudinary from "../lib/cloudinary.js";
import { getIO } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId }}). select("-password");

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({error: "Server Error"});
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Messages.find({
            $or : [
               { senderId: myId, recieverId: userToChatId },
               { senderId: userToChatId, recieverId: myId },
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getting Message controller:", error.message);
        res.status(401).json({error: "server Error"});
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {text, image, audio, video, durationMs} = req.body;
        const {id: recieverId} = req.params;
        const senderId = req.user._id;

        if (!text && !image && !audio && !video) {
            return res.status(400).json({ error: "Nothing to send" });
        }

        let imageUrl;
        let audioUrl;
        let videoUrl;
        try {
            if (image) {
                const uplaodRespose = await cloudinary.uploader.upload(image, { folder: "chat-app/images" });
                imageUrl = uplaodRespose.secure_url;
            }
            if (audio) {
                const upload = await cloudinary.uploader.upload(audio, { resource_type: 'video', folder: "chat-app/audio" });
                audioUrl = upload.secure_url;
            }
            if (video) {
                const upload = await cloudinary.uploader.upload(video, { resource_type: 'video', folder: "chat-app/video" });
                videoUrl = upload.secure_url;
            }
        } catch (uploadErr) {
            console.error("Cloudinary upload failed:", uploadErr?.message || uploadErr);
            return res.status(400).json({ error: "Upload failed" });
        }

        const newMessage = new Messages({
            senderId,
            recieverId,
            text,
            image: imageUrl,
            audio: audioUrl,
            video: videoUrl,
            durationMs,
            deliveredAt: new Date(),
        });

        await newMessage.save();

        // Emit to receiver room in realtime
        try {
            const io = getIO();
            io.to(recieverId).emit("receiveMessage", newMessage);
            // sender can also update UI if needed
        } catch (_) {}

        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Error in Sending message controller :", error.message);
        res.status(500).json({error: "server Error"});
    }
}

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params; // message id
        const userId = req.user._id;
        const msg = await Messages.findById(id);
        if (!msg) return res.status(404).json({ error: 'Not found' });
        // Only receiver can mark as read
        if (msg.recieverId !== String(userId)) return res.status(403).json({ error: 'Forbidden' });
        if (!msg.readAt) {
            msg.readAt = new Date();
            await msg.save();
            try {
                const io = getIO();
                io.to(msg.senderId).emit('message:read', { messageId: msg._id, readAt: msg.readAt });
            } catch(_) {}
        }
        res.json({ ok: true, messageId: msg._id, readAt: msg.readAt });
    } catch (e) {
        console.error('markAsRead error:', e.message);
        res.status(500).json({ error: 'server Error' });
    }
}