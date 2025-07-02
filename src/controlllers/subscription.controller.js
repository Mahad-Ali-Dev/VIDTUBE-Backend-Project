import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID")
    }

    // Check if channel exists
    const channelUser = await User.findById(channelId)
    if (!channelUser) {
        throw new ApiError(404, "Channel (user) not found")
    }

    if (req.user._id.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }

    // Check if a subscription already exists
    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    });

    let message;
    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)
        message = "You have unsubscribed from this channel"
    } else {
        await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        });
        message = "You have subscribed to the channel"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, message))
});

// Get all subscribers for a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID")
    }

    // Check if channel exists
    const channelUser = await User.findById(channelId)
    if (!channelUser) {
        throw new ApiError(404, "Channel (user) not found")
    }

    // Only allow channel owner to view subscribers
    if (req.user._id.toString() !== channelId) {
        throw new ApiError(403, "You are not authorized to view this channel's subscribers")
    }

    const subscribers = await Subscription.find({
        channel: channelId
    }).populate("subscriber", "username avatar email")

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Here is the list of all the subscribers"))
});

// Get all channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID")
    }

    // Check if subscriber exists
    const subscriberUser = await User.findById(subscriberId)
    if (!subscriberUser) {
        throw new ApiError(404, "Subscriber (user) not found")
    }

    const subscribed = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "username avatar email")

    return res
        .status(200)
        .json(new ApiResponse(200, subscribed, "Here is the list of all the subscribed channels"))
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}