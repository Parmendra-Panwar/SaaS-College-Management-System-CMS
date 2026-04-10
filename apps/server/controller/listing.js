import mongoose from 'mongoose';
import { ExpressError } from "../utils/ExpressError.js";
import Listing from "../models/listing.js";
import Review from "../models/review.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";
import processImage from "../utils/imageProcess.js";
import { invalidateNearbyCache } from "../services/cacheServiceRemove.js";

export const index = async (req, res) => {
  // lastId ko string rehne dein, parseInt na karein
  let { lastId, limit = 12 } = req.query;
  limit = parseInt(limit);

  // Dynamic Query: Agar lastId hai toh usse purani listings uthao
  let query = {};
  if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
    query = { _id: { $lt: lastId } }; // $lt (less than) kyuki _id creation time based hoti hai
  }

  // Fetch Listings
  const listings = await Listing.find(query)
    .sort({ _id: -1 }) // Latest first
    .limit(limit);

  // Next Cursor taiyar karein (Aakhri item ki ID)
  const nextCursor = listings.length > 0 ? listings[listings.length - 1]._id : null;

  res.json({
    listings: listings,
    nextCursor: nextCursor,
    hasNextPage: listings.length === limit
  });
};

export const showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author", select: "username" } })
        .populate("user");

    if (!listing) throw new ExpressError(404, "Listing not found");

    res.json({ 
        listing, 
        nearbyActivities,
        nearbyListings,    
        latitude,
        longitude
    });
};

export const createNewpost = async (req, res) => {
    if (!req.files || req.files.length === 0) throw new ExpressError(400, "At least one image is required");

    const newList = new Listing(req.body.listing);
    newList.user = req.user._id;

    // 2. Process and upload images (Sharp)
    const uploadPromises = req.files.map(async (file) => {
        const processedBuffer = await processImage(file.buffer);

        const result = await uploadToCloudinary(processedBuffer);
        return { url: result.secure_url, filename: result.public_id };
    });

    newList.images = await Promise.all(uploadPromises);
    await newList.save();
    res.status(201).json(newList);
};

export const updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, "Listing not found");

    // 2. Selective Image Deletion (Cloudinary Sync)
    if (req.body.remainingImages) {
        const remaining = JSON.parse(req.body.remainingImages);
        
        // Find images to delete (Jo purani list mein thi par new "remaining" list mein nahi hain)
        const imagesToDelete = listing.images.filter(img => 
            !remaining.some(rem => rem.filename === img.filename)
        );

        if (imagesToDelete.length > 0) {
            await deleteFromCloudinary(imagesToDelete); 
        }
        
        // DB update with remaining images
        listing.images = remaining;
    }

    // 3. Append New Images (If any)
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
            const processedBuffer = await processImage(file.buffer);
            const result = await uploadToCloudinary(processedBuffer);
            return { url: result.secure_url, filename: result.public_id };
        });

        const newImages = await Promise.all(uploadPromises);
        listing.images.push(...newImages); 
    }

    // 4. Update Other Text Fields (Title, Price, etc.)
    const updateData = { ...req.body.listing };
    delete updateData.images; // Safety: images array humne upar handle kar liya hai

    Object.assign(listing, updateData);

    await listing.save();
    await invalidateNearbyCache(id);

    res.json({ message: "Listing Updated Successfully", listing });
};

export const destroy = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, "Listing not found");

    // Loop through the 'images' array to delete from Cloudinary
    await deleteFromCloudinary(listing.images);

    // Associated Reviews delete
    if (listing.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }

    await Listing.findByIdAndDelete(id);
    await invalidateNearbyCache(id);
    res.json({ message: "Listing and all associated data deleted" });
};