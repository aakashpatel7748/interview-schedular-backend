import { catchAsyncError } from "../middleware/catchAsyncError.js";
import Notification from "../models/Notification.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const getNotifications = catchAsyncError(async (req, res, next) => {
     const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); 

    res.json(notifications);
})

export const readNotification = catchAsyncError(async (req, res, next) => {
      const notification = await Notification.findById(req.params.id);
    
        if (!notification) {
          return next(new ErrorHandler('Notification not found', 404));
        }
    
        // Ownership verification
        if (notification.userId.toString() !== req.user.id) {
          return next(new ErrorHandler('Not authorized to modify this notification', 403));
        }
    
        notification.isRead = true;
        await notification.save();
    
        res.json(notification);
})

export const readAllNotification = catchAsyncError(async (req, res, next) => {
     await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: 'All notifications marked as read' });
})