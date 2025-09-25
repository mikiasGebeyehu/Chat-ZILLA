import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
    ref: "User" 
  },
  recieverId: {
    type: String,
    required: true,
    ref: "User" 
  },
  text: {
    type: String,
  },
  image: {
    type: String,
  }
  ,
  audio: {
    type: String,
  },
  video: {
    type: String,
  },
  durationMs: {
    type: Number,
  },
  deliveredAt: {
    type: Date,
  },
  readAt: {
    type: Date,
  }
}, { timestamps: true });

const Messages = mongoose.model('Messages', messageSchema);

export default Messages;