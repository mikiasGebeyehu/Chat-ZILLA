import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: { type: String, enum: ['missed', 'declined', 'completed'], default: 'completed' },
  duration: { type: Number }, // seconds
}, { timestamps: true });

const Call = mongoose.model('Call', callSchema);
export default Call;


