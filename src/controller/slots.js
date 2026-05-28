import { logger } from "../../lib/logger.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import Booking from "../models/Booking.js";
import InterviewSlot from "../models/InterviewSlot.js";
import Notification from "../models/Notification.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const createSlots = catchAsyncError(async (req, res, next) => {
  const TAG = "Create Slot"
  logger.info(TAG)
 const { date, time, duration, meetingMode, notes } = req.body;
console.log("Creating slot with data:", req.body);
 
    if (!date || !time) {
      return next(new ErrorHandler('Please provide date and time for the slot'));
    }

    const slot = await InterviewSlot.create({
      recruiterId: req.user.id,
      date,
      time,
      duration: duration || 30,
      meetingMode: meetingMode || 'Online',
      notes
    });

    res.status(201).json(slot);
});

export const getSlots = catchAsyncError(async (req, res, next) => {
  const TAG = "Get Slots"
  logger.info(TAG)
     const { isBooked, date, recruiterId } = req.query;
        let query = {};
    
        if (isBooked !== undefined) {
          query.isBooked = isBooked === 'true';
        }
    
        // Filter by specific recruiter
        if (recruiterId) {
          query.recruiterId = recruiterId;
        }
    
        if (req.user.role === 'recruiter' && !recruiterId) {
          query.recruiterId = req.user.id;
        }
    
        if (date) {
          const searchDate = new Date(date);
          const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
          const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
          query.date = { $gte: startOfDay, $lte: endOfDay };
        }
    
        const slots = await InterviewSlot.find(query)
          .populate('recruiterId', 'name email')
          .sort({ date: 1, time: 1 });
    
        res.json(slots);
});

export const getSingleSlot = catchAsyncError(async (req, res, next) => {
const TAG = "Get Single Slot"
logger.info(TAG)
     const slot = await InterviewSlot.findById(req.params.id).populate('recruiterId', 'name email');

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    res.json(slot);
});

export const updateSlot = catchAsyncError(async (req, res, next) => {
  const TAG = "Update Slot"
  logger.info(TAG)
    let slot = await InterviewSlot.findById(req.params.id);
    
        if (!slot) {
          return next(new ErrorHandler('Slot not found', 400));
        }
    
        if (slot.recruiterId.toString() !== req.user.id) {
          return next(new ErrorHandler('Not authorized to edit this slot'));
        }
    
        // If slot is booked, we should notify the candidate if details change!
        if (slot.isBooked) {
          const { date, time } = req.body;
          const isTimeOrDateChanged = (date && new Date(date).getTime() !== new Date(slot.date).getTime()) || (time && time !== slot.time);
    
          if (isTimeOrDateChanged) {
            // Find corresponding active booking
            const booking = await Booking.findOne({ slotId: slot._id, status: { $ne: 'cancelled' } });
            if (booking) {
              booking.status = 'rescheduled';
              await booking.save();
    
              // Create notification for the candidate
              await Notification.create({
                userId: booking.candidateId,
                message: `Your interview scheduled for ${new Date(slot.date).toLocaleDateString()} at ${slot.time} has been rescheduled to ${date ? new Date(date).toLocaleDateString() : new Date(slot.date).toLocaleDateString()} at ${time || slot.time} by the recruiter.`,
                type: 'booking_rescheduled'
              });
            }
          }
        }
    
        slot = await InterviewSlot.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
    
        res.json(slot);
});

export const deleteSlot = catchAsyncError(async (req, res, next) => {
  const TAG = "Delete Slot"
  logger.info(TAG)
     const slot = await InterviewSlot.findById(req.params.id);

    if (!slot) {
      return next(new ErrorHandler('Slot not found'));
    }

    // Verify ownership
    if (slot.recruiterId.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized to delete this slot'));
    }

    // If slot is booked, cancel the active booking and notify the candidate
    if (slot.isBooked) {
      const booking = await Booking.findOne({ slotId: slot._id, status: { $ne: 'cancelled' } });
      if (booking) {
        booking.status = 'cancelled';
        await booking.save();

        await Notification.create({
          userId: booking.candidateId,
          message: `Your booked interview on ${new Date(slot.date).toLocaleDateString()} at ${slot.time} has been cancelled by the recruiter because the slot was deleted.`,
          type: 'booking_cancelled'
        });
      }
    }

    await InterviewSlot.findByIdAndDelete(req.params.id);

    res.json({ message: 'Slot deleted successfully' });
});