import express from 'express';
import { createSlots, deleteSlot, getSingleSlot, getSlots, updateSlot } from '../controller/slots.js';
import { authorize, isAuthenticated } from '../middleware/authMiddleware.js';
const router = express.Router();

// POST /api/slots (recruiter)
router.post('/', isAuthenticated, authorize('recruiter'), createSlots);

// GET /api/slots
router.get('/', isAuthenticated, getSlots);
  
//  GET /api/slots/:id
router.get('/:id', isAuthenticated, getSingleSlot);

//  PUT /api/slots/:id
router.put('/:id', isAuthenticated, authorize('recruiter'), updateSlot);
 
// DELETE /api/slots/:id
router.delete('/:id', isAuthenticated, authorize('recruiter'), deleteSlot);

export default router;
