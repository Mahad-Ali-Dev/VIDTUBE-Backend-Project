import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadonCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"

const allowedSortFields = [
    "title",
    "duration",
    "views",
    "isPublished",
    "createdAt",
    "updatedAt"
]

const getAllVideos = asyncHandler(async (req, res) => {
    const { 
        page = 1,
        limit = 10,
        query, 
        sortBy = "createdAt",
        sortType = "desc",
        userId 
    } = req.query;

    const filters = {}

    // Search filter
    if (query) {
        filters.title = { $regex: query, $options: "i" }
    }

    // User filter - if userId is provided, filter by that user, otherwise show all videos
    if (userId) {
        filters.owner = userId;
    }

    // Sorting
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt"
    const sortOptions = {};
    sortOptions[sortField] = sortType === "asc" ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Finding the videos from database
    const videos = await Video.find(filters)
        .populate("owner", "username avatar")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))

    const total = await Video.countDocuments(filters)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                page: Number(page),
                limit: Number(limit),
                total,
            },
            "Videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // get video and thumbnail files
    if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    // grabbing the files 
    const videoPath = req.files.videoFile[0]?.path
    const thumbnailPath = req.files.thumbnail[0]?.path

    // uploading video and thumbnail to the server 
    const uploadVideo = await uploadonCloudinary(videoPath)
    const uploadThumbnail = await uploadonCloudinary(thumbnailPath)

    if (!uploadVideo?.url || !uploadThumbnail?.url) {
        throw new ApiError(500, "Failed to upload files to Cloudinary")
    }

    // creating a video 
    const video = await Video.create({
        title,
        description,
        videoFile: uploadVideo.url,    
        thumbnail: uploadThumbnail.url, 
        duration: uploadVideo.duration,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "VideoId is required");
    }

    // Find the video by ID and ensure it belongs to the current user
    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id // assuming authentication middleware sets req.user
    }).populate("owner", "username avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "User video loaded successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description, isPublished } = req.body

    if (!videoId) {
        throw new ApiError(404, "Video not found")
    }

    // Check if a new thumbnail file was uploaded
    let thumbnailUrl = undefined;
    if (req.file) {
        const uploadThumbnail = await uploadonCloudinary(req.file.path);
        if (!uploadThumbnail?.url) {
            throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
        }
        thumbnailUrl = uploadThumbnail.url;
    }

    const updatedVideo = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        {
            $set: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(thumbnailUrl !== undefined && { thumbnail: thumbnailUrl }),
                ...(isPublished !== undefined && { isPublished }),
            }
        },
        { new: true }
    )

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found or you are not authorized to update this video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video content updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    // Find the video
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    // Extract public IDs from Cloudinary URLs
    const extractPublicId = (url) => {
        if (!url) return null;
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0]; // Remove file extension
        return publicId;
    }

    // Delete from Cloudinary
    const videoPublicId = extractPublicId(video.videoFile);
    const thumbnailPublicId = extractPublicId(video.thumbnail);

    if (videoPublicId) {
        await deleteFromCloudinary(videoPublicId);
    }
    if (thumbnailPublicId) {
        await deleteFromCloudinary(thumbnailPublicId);
    }

    // Delete the video from database
    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    // Find the video
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    //check ownership
    if(video.owner.toString()!== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to publish this video")
    }
    // toggle publish status
     video.isPublished = !video.isPublished
     await video.save()

     return res 
        .status(200).json(new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unPublished"}`))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}