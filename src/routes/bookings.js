import express from 'express';
import { cancelBooking, createBooking, getBooking, getSingleBooking, rescheduleBooking } from '../controller/booking.js';
import { authorize, isAuthenticated } from '../middleware/authMiddleware.js';
const router = express.Router();

// post create booking(candidate)
router.post('/', isAuthenticated, authorize('candidate'), createBooking);
  
// GET /api/bookings
router.get('/', isAuthenticated, getBooking )
  
// GET /api/bookings/:id
router.get('/:id', isAuthenticated, getSingleBooking);
 
//  PUT /api/bookings/:id/reschedule
router.put('/reschedule/:id', isAuthenticated, authorize('candidate'), rescheduleBooking);

//  DELETE /api/bookings/:id
router.delete('/:id', isAuthenticated, cancelBooking);


export default router;
