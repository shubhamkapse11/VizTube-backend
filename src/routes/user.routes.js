import { Router } from "express";
import { resgisterUser, logOutUser, loginUser 
  ,refreshAccessToken ,changeCurrentPassword, getCurrentUser,
   updateAccountdetails,updateUserAvatar
  ,updateUserCoverImg,getWatchHistory,getUserChannelProfile
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(upload.fields([
    { name: "avatar", maxCount: 1 },
     {name:"coverImage" ,
        maxCount:1
     }
]), resgisterUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountdetails);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImg);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);


export default router;
