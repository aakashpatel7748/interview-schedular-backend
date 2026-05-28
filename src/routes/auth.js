import express from 'express';
import { authContoller } from '../controller/auth.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
const router = express.Router();


// get user details
router.get('/get-user',isAuthenticated,authContoller);

// user signup
router.post('/signup',authContoller);

// user signin
router.post('/signin',authContoller);

// user signout
router.post('/signout',authContoller);



export default router;
