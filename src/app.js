const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({ extented: true, limit: "16kb" }))
app.use(express.static("public"));  // This line tells Express to serve static files from the public folder.
app.use(cookieParser())

// import routes 

const userRouter = require('./routes/user.routes.js')
const healthcheckRouter = require('./routes/healthcheck.routes.js')
const tweetRouter = require('./routes/tweet.routes.js')
const subscriptionRouter = require('./routes/subscription.routes.js')
const videoRouter = require('./routes/video.routes.js')
const commentRouter = require('./routes/comment.routes.js')
const likeRouter = require('./routes/like.routes.js')
const playlistRouter = require('./routes/playlist.routes.js')
const dashboardRouter = require('./routes/dashboard.routes.js')

// Routes Declareation
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)



module.exports = { app }
