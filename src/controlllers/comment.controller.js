import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {isValidObjectId} from "mongoose"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    // Optionally: Check if video exists

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const comments = await Comment.find({ video: videoId })
        .populate("user", "username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))

    const total = await Comment.countDocuments({ video: videoId })

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            page: Number(page),
            limit: Number(limit),
            total
        }, "Comments fetched successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }
    if (!content || typeof content !== "string" || !content.trim()) {
        throw new ApiError(400, "Comment text is required")
    }

    // Optionally: Check if video exists
    let comment = await Comment.create({
        video: videoId,
        user: req.user._id,
        content: content.trim()
    })

    comment = await comment.populate("user", "username avatar");

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }
    if (!content || typeof content !== "string" || !content.trim()) {
        throw new ApiError(400, "Comment text is required")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, 
          user: req.user._id
         },
        { 
            $set: {
                 content: content.trim()
                 }
         },
        { new: true }
    ).populate("user", "username avatar")

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or you are not authorized to update this comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }
    const deleteComment = await Comment.findOneAndDelete({
        _id: commentId,
        user: req.user._id
    })
    if(!deleteComment){
        throw new ApiError(403, "you are not authorized to delete this comment")
    }
    return res 
        .status(200)
        .json(new ApiResponse(200, deleteComment , "comment deleted successfully"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }