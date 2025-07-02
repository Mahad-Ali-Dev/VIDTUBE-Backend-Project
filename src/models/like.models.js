import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

// Ensure only one of video, comment, or tweet is set
likeSchema.pre("validate", function (next) {
    const fields = [this.video, this.comment, this.tweet].filter(Boolean)
    if (fields.length !== 1) {
        return next(new Error("A like must reference exactly one of video, comment, or tweet."));
    }
    next()
})

// Unique indexes to prevent duplicate likes
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true })
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true })
likeSchema.index({ tweet: 1, likedBy: 1 }, { unique: true, sparse: true })

export const Like = mongoose.model("Like", likeSchema)