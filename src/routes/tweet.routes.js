import { Router } from 'express';
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controlllers/tweet.controller.js";
import { verifyJWT } from "../middlerwares/auth.middlewares.js";

const router = Router();

// 🔐 Secure all routes with JWT
router.use(verifyJWT);

// 🐦 Tweet Routes
router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
