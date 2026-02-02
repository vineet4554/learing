import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";


// REGISTER 

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use"
      });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};


//  LOGIN 

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const user = await User
      .findOne({ email })
      .select("+password");  

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};


//  PROFILE 

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
      }
    }
    });

  } catch (error) {
    next(error);
  }
};


//  UPDATE PROFILE 

export const updateProfile = async (req, res, next) => {
  try {
    const { username, email,profileImage } = req.body;

    const user = await User.findById(req.user.id);

    if (username) user.username = username;
    if (email) user.email = email;
    if(profileImage) user.profileImage=profileImage

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
      }
    }
    });

  } catch (error) {
    next(error);
  }
};


//  CHANGE PASSWORD

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if(!currentPassword || !newPassword){
         return res.status(400).json({
        success: false,
        message: "Please provide password"
      });
    }

    const user = await User
      .findById(req.user.id)
      .select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: "Current password incorrect"
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    next(error);
  }
};
