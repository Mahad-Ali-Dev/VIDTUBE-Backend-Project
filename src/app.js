import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)
// common middleware
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true , limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//import rotues 
import healthcheckRouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import TweetRouter from "./routes/tweet.routes.js"
import VideoRouter from"./routes/video.routes.js"
import PlayListRouter from "./routes/playlist.routes.js"
import SubscriptionRouter from "./routes/subscription.routes.js"
import LikeRouter from "./routes/like.routes.js"
import CommentRouter from "./routes/comment.routes.js"
import { errorHandler } from "./middlerwares/error.middlewares.js"
//routes

app.use("/api/v1/healthcheck" , healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", TweetRouter)
app.use("/api/v1/videos",VideoRouter)
app.use("/api/v1/playlist",PlayListRouter)
app.use("/api/v1/subscription",SubscriptionRouter)
app.use("/api/v1/likes",LikeRouter)
app.use("/api/v1/Comments", CommentRouter)

// app.use(errorHandler)
export {app}