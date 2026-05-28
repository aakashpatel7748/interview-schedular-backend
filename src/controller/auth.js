import { logger } from "../../lib/logger.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendToken } from "../utils/SendToken.js";



export const authContoller = catchAsyncError(async (req, res, next) => {
    const { actionType } = req.query;

    if (actionType == "getUser") {
        const TAG = "Get User Details"
        logger.info(TAG)
        const user = await User.findById(req.id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        res.status(200).json({
            success: true,
            user
        })
    }
    else if (actionType == "save") {
        const { name, email, password, role } = req.body;

        // Basic validation
        if (!name || !email || !password || !role) {
            return next(new ErrorHandler('Please provide all required fields', 400));
        }

        if (password.length < 6) {
            return next(new ErrorHandler('Password must be at least 6 characters', 400));
        }

        if (!['recruiter', 'candidate'].includes(role)) {
            return next(new ErrorHandler('Invalid user role', 400));
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new ErrorHandler('User already exists with this email', 400));
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        await sendToken(user, 201, res)


    }
    else if (actionType == "login") {
        const TAG = "user Login"
        logger.info(TAG)
        const { email, password } = req.body

        let user = await User.findOne({ email }).select("+password").exec();

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 400))
        }

        const isMatch =await user.ComparePassword(password)
        if (!isMatch) return next(new ErrorHandler("wrong credientials", 500))
        await sendToken(user, 200, res)
    }
    else if (actionType == "logout") {
        const TAG = "user Logout"
        logger.info(TAG)
        res.clearCookie("token");
        res.json({ message: "successfully signout" })
    }

    else {
        return res.status(400).json({ success: false, message: "Invalid ActionType" });
    }

})