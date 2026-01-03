const { Router } = require("express");
const { resgisterUser, logOutUser, loginUser 
  ,refreshAccessToken ,changeCurrentPassword, getCurrentUser,
   updateAccountdetails,updateUserAvatar
  ,updateUserCoverImg,getWatchHistory,getUserChannelProfile
} = require("../controllers/user.controller.js");
const { upload } = require("../middlewares/multer.middleware.js");
const { verifyJWT } = require("../middlewares/auth.middleware.js");

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


module.exports = router;
