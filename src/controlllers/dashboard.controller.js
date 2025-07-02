import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {isValidObjectId} from "mongoose"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {         
        throw new ApiError(400, "Invalid Channel ID")
    }

    // Get all videos for the channel
    const videos = await Video.find({ owner: channelId }, '_id views')
    const videoIds = videos.map(v=>v._id)

    // Total videos
    const totalVideos = videoIds.length 

    //total views 
    const totalViews = videos.reduce((sum ,v)=> sum + (v.views ||0) , 0)
    // total subscribers
    const totalSubscribers = await Subscription.countDocumnets({ channelId: channelId})
    
    //totalLikes
    const totalLikes = await Like.countDocumnets({
        video: {
            $in: videoIds
        }
    })
    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalViews,
            totalSubscribers,
            totalLikes
        }, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid Channel ID")
    }

    const videos = await Video.find({
        owner:channelId
    }).select("title thumbnail views duration ")


    const videoIds = videos.map(v=>v._id)
    const totalVideos  = videoIds.length

    return res 
        .status(200)
        .json(new ApiResponse(200,{
            totalVideos :videos.length,
            videos
    }, "All videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }

