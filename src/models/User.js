import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['recruiter', 'candidate'],
    required: [true, 'Please select a role']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.ComparePassword = function (enteredPassword) {
    return bcrypt.compareSync(enteredPassword, this.password)
}

userSchema.methods.getJwtToken = async function () {
    return jwt.sign(
        {
            id: this._id,
            role: this.role,
        },
        process.env.jWt_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE,
        })
}



export default mongoose.model("user", userSchema);
