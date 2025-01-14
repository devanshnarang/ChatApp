import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const protectMiddleware = async (req, res, next) => {
  let token;

  // Check if the Authorization header is present and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get the token by splitting the Authorization header
      token = req.headers.authorization.split(" ")[1];

      // If there's no token, send an error response
      if (!token) {
        return res.status(401).send({
          success: false,
          message: "No token found, authorization failed."
        });
      }


      // Verify the token using the JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add the user from the decoded token to the req object
      req.user = await userModel.findById(decoded.id).select("-password");

      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).send({
          success: false,
          message: 'Token expired. Please log in again.'
        });
      }

      console.error('Error verifying token:', error); // Log the error for debugging

      return res.status(401).send({
        success: false,
        message: "Not authorized, token verification failed.",
        error: error.message, // Send the error message for better understanding
      });
    }
  } else {
    // If there's no token in the header, send an error response
    return res.status(401).send({
      success: false,
      message: "No token, authorization denied."
    });
  }
};

export default protectMiddleware;