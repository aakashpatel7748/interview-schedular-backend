import express from 'express';
import { authContoller } from '../controller/auth.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
const router = express.Router();


// get user details
router.get('/get-user',isAuthenticated,authContoller);

// user signup / register
router.post('/signup',authContoller);
router.post('/register',authContoller);

// user signin / login
router.post('/signin',authContoller);
router.post('/login',authContoller);

// user signout / logout
router.post('/signout',authContoller);
router.post('/logout',authContoller);

export default router;
