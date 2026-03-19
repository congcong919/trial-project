const express = require('express')
const cors = require("cors")
const mongoose = require("mongoose")
const app = express()

const router = require('./router')

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/todos"

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/api', router)

mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB connection succeed"))
  .catch((err) => console.error("MongoDB connection failed", err))

app.listen(5000, () => {
    console.log('express server running at http://127.0.0.1:5000')
})

