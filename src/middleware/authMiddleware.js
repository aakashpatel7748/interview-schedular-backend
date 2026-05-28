import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncError } from './catchAsyncError.js';

// Protect routes
export const isAuthenticated = catchAsyncError(async (req, res, next) => {
 
   let { token } = req.cookies;

   if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    
     if (!token) {
        return next(new ErrorHandler("Please login to access the resource", 401));
    }
    //  Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return next(new ErrorHandler('Not authorized, user not found', 401));
      }

     req.id = decoded.id;
      next();
    
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler('Not authorized, no user session', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`User role '${req.user.role}' is not authorized to access this route`, 403) );
    }
    next();
  };
};


