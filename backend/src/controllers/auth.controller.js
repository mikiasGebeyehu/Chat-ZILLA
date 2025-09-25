import User from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import jwt from "jsonwebtoken";
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
  try {
    const { username, email, password, profilePic } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create + save user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profilePic,
    });

    await user.save();

    // Generate token after saving
    generateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    });

  } catch (err) {
    console.error('Signup error:', err.message);  // <--- show the cause
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
       generateToken(user._id, res);
        res.status(200).json({ user: { id: user._id, username: user.username, email: user.email ,profilePic: user.profilePic } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current user profile
export const profile = async (req, res) => {
    // try {
    //     const user = await User.findById(req.user.userId).select('-password');
    //     if (!user) {
    //         return res.status(404).json({ message: 'User not found' });
    //     }
    //     res.json(user);
    // } catch (err) {
    //     res.status(500).json({ message: 'Server error' });
    // }
}

export const updateProfile = async (req, res) => {
  try {
    const { username, email, profilePic } = req.body;

    if (!username && !email && !profilePic) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Validate uniqueness if changing email/username
    if (email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser && existingEmailUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (username) {
      const existingUsernameUser = await User.findOne({ username });
      if (existingUsernameUser && existingUsernameUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: "Username already in use" });
      }
    }

    let profilePicUrl;
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      profilePicUrl = uploadResponse.secure_url;
    }

    const updatePayload = {};
    if (typeof username === 'string' && username.trim()) updatePayload.username = username.trim();
    if (typeof email === 'string' && email.trim()) updatePayload.email = email.trim().toLowerCase();
    if (profilePicUrl) updatePayload.profilePic = profilePicUrl;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const checkAuth = async (req, res) => {
    const token = req.cookies.jwt; // must match cookie name
    console.log("Cookie token from client:", token);

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded from checkAuth:", decoded);

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Authenticated",
            userId: decoded.userId,
            user
        });
    } catch (err) {
        console.error("JWT verify failed:", err.message);
        res.status(401).json({ message: "Invalid token" });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};