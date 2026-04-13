require("dotenv").config()
const express = require('express')
const cors = require("cors")
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const app = express()

const router = require('./router')
const authRouter = require('./routes/auth')

// Start the email worker alongside the server. In a scaled deployment this
// would run as a separate process (e.g. a dedicated worker Dockerfile), but
// for a single-instance setup requiring it here is sufficient.
require('./workers/emailWorker')

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/todos"

app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    process.env.CLOUDFRONT_URL,
  ].filter(Boolean),
  credentials: true,
}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api', router)

mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB connection succeed"))
  .catch((err) => console.error("MongoDB connection failed", err))

app.listen(5000, () => {
    console.log('express server running at http://127.0.0.1:5000')
})

