import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body
  
  const user = await User.findById(req.user._id);
if (!user) {
    throw new ApiError(404, "User not found");
}
  if (!content || !content.trim()) {
    throw new ApiError(400, "Content is required")
  }

  const tweet = await Tweet.create({
    content: content.trim(), 
    user: req.user._id,
  })

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet has been posted"))
})

// Get Current Logged-In User's Tweets
const getUserTweets = asyncHandler(async (req, res) => {

  const tweets = await Tweet.find(
    { 
      user: req.user._id
     }).populate("user","username")
  return res.status(200).json(
    new ApiResponse(200, tweets, "User tweets loaded successfully")
  )
})

// Update Tweet
const updateTweet = asyncHandler(async (req, res) => {
  //requesting content from the body 
  const { content } = req.body || {};
  const { tweetId } = req.params;

  if (!content || !content.trim()) {
    throw new ApiError(402, "Content is required");
  }

  const updatedTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, user: req.user._id },
    { $set: { content: content.trim() } },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(
      404,
      "Tweet not found or you are not authorized to update this tweet"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
})

// Delete Tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID")
  }

  const tweet = await Tweet.findById(tweetId)
  if (!tweet) {
    throw new ApiError(404, "Tweet not found")
  }

  if (tweet.user.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to delete this tweet"
    )
  }

  await Tweet.findByIdAndDelete(tweetId)

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
}
