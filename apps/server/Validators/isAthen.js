import Listing from "../models/listing.js";
import Review from "../models/review.js"
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isloggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access Denied, No token Provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    // JWT Invalidation check
    if (req.user.passwordChangedAt && decoded.iat) {
       // Convert Date to timestamp in seconds
       const changedTimestamp = parseInt(req.user.passwordChangedAt.getTime() / 1000, 10);
       if (decoded.iat < changedTimestamp) {
           return res.status(401).json({ error: "Password was changed. Please log in again." });
       }
    }

    // TENANT INTERCEPTOR LOGIC
    // Extract collegeId to enforce strict tenant isolation in subsequent queries
    req.collegeId = req.user.collegeId;

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export const isOwner = async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // req.user ab isloggedIn se aa raha hai
    if (!listing.user._id.equals(req.user._id)) {
      return res.status(403).json({ error: "You are not the owner" });
    }
    next();
  } catch (err) {
    next(err); // Central error handler ko bhej do
  }
};

export const isReviewAuthor = async (req, res, next) => {
  try {
    let { reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) return res.status(404).json({ error: "Review not found" });

    if (!review.author._id.equals(req.user._id)) {
      return res.status(403).json({ error: "You are not the author" });
    }
    next();
  } catch (err) {
    next(err);
  }
};
