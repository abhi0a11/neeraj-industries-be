import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../middlewares/error.js";
import jwt from "jsonwebtoken";

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("Invalid Credentials", 404));

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return next(new ErrorHandler("Invalid Credentials", 404));
    if (user.role !== role)
      return next(new ErrorHandler("Invalid Credentials", 404));
    if (user.block) return next(new ErrorHandler("User is blocked", 404));

    sendCookie(user, res, `Welcome back ${user.name}`, 200);
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email, role });
    if (user) return next(new ErrorHandler("User already exit", 404));

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    sendCookie(user, res, "successfully registered", 201);
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (Date.now() >= decoded.exp * 1000) {
      return res
        .status(401)
        .json({ success: false, message: "Token expired." });
    }
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};
export const logout = (req, res) => {
  // res
  //   .status(200)
  //   .cookie("token", "", {
  //     expires: new Date(Date.now()),
  //     sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
  //     secure: process.env.NODE_ENV === "Development" ? false : true,
  //     path: "/", // Clear across the app
  //     httpOnly: true, // Same as when set
  //   })
  //   .json({
  //     success: true,
  //     message: "Logged out successfully",
  //   });
  // res.setHeader("Cache-Control", "no-store");
  res
    .clearCookie("token", {
      path: "/",
      sameSite: "Strict",
      secure: true,
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
  console.log(res);
};
