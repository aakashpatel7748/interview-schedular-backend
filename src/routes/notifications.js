import express from 'express';
import { getNotifications, readAllNotification, readNotification } from '../controller/notification.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
const router = express.Router();

// GET /api/notifications
router.get('/', isAuthenticated, getNotifications);

//  PUT /api/notifications/:id/read
router.put('/:id/read', isAuthenticated, readNotification);

//   PUT /api/notifications/read-all
router.put('/read-all', isAuthenticated, readAllNotification);
  
export default router;
