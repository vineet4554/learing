import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";


const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return next(new ApiError(401, "User not found"));
      }

      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new ApiError(401, "Token expired"));
      }

      return next(new ApiError(401, "Not authorized, token failed"));
    }
  }

  // No token case
  return next(new ApiError(401, "Not authorized, no token"));
};

export { protect };
