import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const existsLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    let message;
    if (existsLike) {
        await Like.findByIdAndDelete(existsLike._id)
        message = "You unliked the video";
    } else {
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        });
        message = "You liked the video"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, message))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }

    const existsLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    let message
    if (existsLike) {
        await Like.findByIdAndDelete(existsLike._id)
        message = "You unliked the comment"
    } else {
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        message = "You liked the comment"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, message));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }

    const existsLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    let message;
    if (existsLike) {
        await Like.findByIdAndDelete(existsLike._id)
        message = "You unliked the tweet"
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        message = "You liked the tweet"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, message))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true, $ne: null }
    }).populate({
        path: "video",
        select: "title thumbnail owner",
        populate: { path: "owner", select: "username avatar" }
    })

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Here is the list of liked videos"))
})
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}