import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    if(!name || !description){
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: req.user._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"))
})


const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if (!userId) {
        throw new ApiError(400, "User ID is required")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID")
    }

    const playlists = await Playlist.find({ owner: userId })
        .populate("owner", "username avatar")
        .populate("videos", "title thumbnail duration views")

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("owner", "username avatar")
        .populate("videos", "title thumbnail duration views isPublished")

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required")
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID")
    }

    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist")
    }

    // Check if video exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check if video is already in playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video is already in the playlist")
    }

    // Add video to playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: { videos: videoId }
        },
        { new: true }
    ).populate("owner", "username avatar")
     .populate("videos", "title thumbnail duration views isPublished")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required")
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID")
    }

    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist")
    }

    // Check if video exists in playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video is not in the playlist")
    }

    // Remove video from playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    ).populate("owner", "username avatar")
     .populate("videos", "title thumbnail duration views isPublished")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID")
    }

    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist")
    }

    // Delete the playlist
    await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID")
    }

    // Check if at least one field is provided
    if (!name && !description) {
        throw new ApiError(400, "At least one field (name or description) is required")
    }

    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist")
    }

    // Prepare update object with only provided fields
    const updateFields = {}
    if (name !== undefined) {
        updateFields.name = name.trim()
    }
    if (description !== undefined) {
        updateFields.description = description.trim()
    }

    // Update the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: updateFields
        },
        { new: true }
    ).populate("owner", "username avatar")
     .populate("videos", "title thumbnail duration views isPublished")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}