import multer from "multer";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  /* ---------- Express Validator ---------- */
  if (Array.isArray(err)) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.map(e => ({
      field: e.param,
      message: e.msg
    }));
  }

  /* ---------- JWT ---------- */
  if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
  }

  /* ---------- Multer ---------- */
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.message;
  }

  /* ---------- Mongo ---------- */
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
    errors = Object.keys(err.keyValue);
  }

  console.error("ERROR:", err);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

export default errorHandler;
