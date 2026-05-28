import mongoose from 'mongoose';

const InterviewSlotSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  time: {
    type: String,
    required: [true, 'Please add a start time']
  },
  duration: {
    type: Number,
    required: [true, 'Please add slot duration in minutes'],
    default: 30
  },
  meetingMode: {
    type: String,
    enum: ['Online', 'In-Person'],
    default: 'Online'
  },
  notes: {
    type: String,
    trim: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('interviewSlot', InterviewSlotSchema);
