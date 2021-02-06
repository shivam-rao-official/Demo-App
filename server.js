// Import Modules
const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')

// Local Imports
require('dotenv/config')
const UserAPI = require('./routes/user.routes')

// Variables
const app = express();
const port = process.env.PORT || 5000


// MongoDB Connected
mongoose.connect(process.env.MONGOURI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log('MongoDB Connected');
    })
    
app
.listen(port, () => {
    console.log('Server started at Port 5000');
})

// Passport MiddleWare
app.use(passport.initialize())

// Passport Config
require('./config/passport')(passport);
app
    .use(express.json())
    .use('/user/api', UserAPI)