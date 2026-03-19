const express = require('express')
const cors = require("cors");
const app = express()

const router = require('./router')

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api', router)



app.listen(5000, ()=>{
    console.log('express server running at http://127.0.0.1')
})

