import { catchAsyncError } from "../middleware/catchAsyncError.js";
import Booking from "../models/Booking.js";
import InterviewSlot from "../models/InterviewSlot.js";
import Notification from "../models/Notification.js";
import ErrorHandler from "../utils/ErrorHandler.js";




export const createBooking = catchAsyncError(async (req, res, next) => {
const { slotId } = req.body;

    if (!slotId) {
      return next (new ErrorHandler('Please provide a slotId', 400));
    }

    const updatedSlot = await InterviewSlot.findOneAndUpdate(
      { _id: slotId, isBooked: false },
      { $set: { isBooked: true } },
      { new: true }
    );

    if (!updatedSlot) {
      return next(new ErrorHandler('This slot is already booked or no longer exists. Please select another slot.', 409));
    }

    // Step 2: Create the Booking record
    const booking = await Booking.create({
      slotId: updatedSlot._id,
      candidateId: req.user.id,
      recruiterId: updatedSlot.recruiterId,
      status: 'confirmed',
      meetingLink: `https://meet.google.com/mock-meet-${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 7)}`
    });

    // Step 3: Create Notifications
    // For Candidate
    await Notification.create({
      userId: req.user.id,
      message: `Your booking is confirmed for the interview on ${new Date(updatedSlot.date).toLocaleDateString()} at ${updatedSlot.time}.`,
      type: 'booking_confirmed'
    });

    // For Recruiter
    await Notification.create({
      userId: updatedSlot.recruiterId,
      message: `Candidate ${req.user.name} has booked your interview slot for ${new Date(updatedSlot.date).toLocaleDateString()} at ${updatedSlot.time}.`,
      type: 'booking_confirmed'
    });

    res.status(201).json(booking);
});

export const getBooking = catchAsyncError(async (req, res, next) => {
    let query = {};
    const { status, date, candidateName } = req.query;

    if (req.user.role === 'candidate') {
        query.candidateId = req.user.id;
    } else if (req.user.role === 'recruiter') {
        query.recruiterId = req.user.id;
    }

    if (status) {
        query.status = status;
    }

    let bookings = await Booking.find(query)
        .populate({
            path: 'slotId',
            model: 'interviewSlot'
        })
        .populate('candidateId', 'name email')
        .populate('recruiterId', 'name email')
        .sort({ createdAt: -1 });

    if (date) {
        const searchDate = new Date(date).toLocaleDateString();
        bookings = bookings.filter(b => b.slotId && new Date(b.slotId.date).toLocaleDateString() === searchDate);
    }

    if (candidateName && req.user.role === 'recruiter') {
        const nameRegex = new RegExp(candidateName, 'i');
        bookings = bookings.filter(b => b.candidateId && nameRegex.test(b.candidateId.name));
    }

    res.json(bookings);
});

export const getSingleBooking = catchAsyncError(async (req, res, next) => {
 const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'slotId',
        model: 'interviewSlot'
      })
      .populate('candidateId', 'name email')
      .populate('recruiterId', 'name email');

    if (!booking) {
      return next(new ErrorHandler('Booking not found', 404));
    }

    if (req.user.role === 'candidate' && booking.candidateId._id.toString() !== req.user.id) {
      return next(new ErrorHandler('Access denied. You do not own this booking.', 403));
    }

    if (req.user.role === 'recruiter' && booking.recruiterId._id.toString() !== req.user.id) {
      return next(new ErrorHandler('Access denied. You are not the recruiter for this booking.', 403));
    }

    res.json(booking);
});

export const rescheduleBooking = catchAsyncError(async (req, res, next) => {
    const { newSlotId } = req.body;
    
        if (!newSlotId) {
          return next(new ErrorHandler('Please provide a newSlotId', 400));
        }
    
        const booking = await Booking.findById(req.params.id);
    
        if (!booking) {
          return next(new ErrorHandler('Booking not found', 404));
        }
    
        if (booking.candidateId.toString() !== req.user.id) {
          return next(new ErrorHandler('Access denied. You cannot reschedule this booking.', 403));
        }
    
        if (booking.status === 'cancelled') {
          return next(new ErrorHandler('Cannot reschedule a cancelled interview.', 400));
        }
    
        const updatedNewSlot = await InterviewSlot.findOneAndUpdate(
          { _id: newSlotId, isBooked: false },
          { $set: { isBooked: true } },
          { new: true }
        );
    
        if (!updatedNewSlot) {
          return next(new ErrorHandler('The new slot selected is already booked or no longer exists.', 409));
        }
    
        const oldSlotId = booking.slotId;
        await InterviewSlot.findByIdAndUpdate(oldSlotId, { $set: { isBooked: false } });
    
        booking.slotId = updatedNewSlot._id;
        booking.recruiterId = updatedNewSlot.recruiterId;
        booking.status = 'rescheduled';
        await booking.save();
    
        const oldSlot = await InterviewSlot.findById(oldSlotId);
    
        await Notification.create({
          userId: req.user.id,
          message: `Your interview has been rescheduled to ${new Date(updatedNewSlot.date).toLocaleDateString()} at ${updatedNewSlot.time}.`,
          type: 'booking_rescheduled'
        });
    
        await Notification.create({
          userId: updatedNewSlot.recruiterId,
          message: `Candidate ${req.user.name} has rescheduled their interview from ${oldSlot ? new Date(oldSlot.date).toLocaleDateString() : ''} to ${new Date(updatedNewSlot.date).toLocaleDateString()} at ${updatedNewSlot.time}.`,
          type: 'booking_rescheduled'
        });
    
        res.json(booking);
});

export const cancelBooking = catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate('slotId');

    if (!booking) {
      return next(new ErrorHandler('Booking not found', 404));
    }

    if (req.user.role === 'candidate' && booking.candidateId.toString() !== req.user.id) {
      return next(new ErrorHandler('Access denied. You cannot cancel this booking.', 403));
    }

    if (req.user.role === 'recruiter' && booking.recruiterId.toString() !== req.user.id) {
      return next(new ErrorHandler('Access denied. You cannot cancel this booking.', 403));
    }

    if (booking.status === 'cancelled') {
      return next(new ErrorHandler('This booking is already cancelled.', 400));
    }

    if (booking.slotId) {
      await InterviewSlot.findByIdAndUpdate(booking.slotId._id, { $set: { isBooked: false } });
    }

    booking.status = 'cancelled';
    await booking.save();

    const candidateMsg = `Your interview booking on ${new Date(booking.slotId.date).toLocaleDateString()} at ${booking.slotId.time} has been cancelled.`;
    const recruiterMsg = `Booking for candidate ${req.user.role === 'candidate' ? req.user.name : 'rescheduled'} on ${new Date(booking.slotId.date).toLocaleDateString()} at ${booking.slotId.time} has been cancelled.`;

    await Notification.create({
      userId: booking.candidateId,
      message: candidateMsg,
      type: 'booking_cancelled'
    });

    // Notify recruiter
    await Notification.create({
      userId: booking.recruiterId,
      message: recruiterMsg,
      type: 'booking_cancelled'
    });

    res.json({ message: 'Booking cancelled successfully', booking });
});