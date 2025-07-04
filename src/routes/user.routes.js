import {Router} from "express";

import { registerUser ,
        logoutUser, 
        loginUser, 
        refreshAccessToken, 
        changeCurrentPassword,
        getCurrentUser,
        getUserChannelProfile,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getWatchHistory} from "../controlllers/user.controller.js";

import {upload} from "../middlerwares/multer.middlewares.js";
import { verifyJWT } from "../middlerwares/auth.middlewares.js";


const router = Router()
//unsecured routes 
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        }, {
            name: "coverImage",
            maxCount:1
        }
    ])
    ,registerUser)

router.route("/login").post(loginUser)
router.route("/reftresh-token").post(refreshAccessToken)

//secured routes 
router.route("/logout").post(verifyJWT, 
    logoutUser)

router.route("/change-password").post(verifyJWT, 
    changeCurrentPassword)

router.route("/current-user").get(verifyJWT, 
    getCurrentUser)

router.route("/c/:username").get(verifyJWT, 
    getUserChannelProfile)

router.route("/update-account").patch(verifyJWT,
     updateAccountDetails)

router.route("/avatar").patch(verifyJWT, 
    upload.single("avatar"), updateUserAvatar)

router.route("/coverImage").patch(verifyJWT, 
    upload.single("coverImage"), updateUserCoverImage)

router.route("/history").get(verifyJWT, getWatchHistory)
export default router 