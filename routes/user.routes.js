// Modules Import
const express = require('express')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const passport = require('passport')

// Import UserModel
const UserModel = require('../models/User')
const key = require('../config/keys');

// Variable
const router = express.Router()


// @route       POST('/user/api/register')
// @desc        Creating a new User
// @access      Public
router.route('/register').post(async (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    const emailExist = await UserModel.findOne({ email: email })
    if (emailExist) {
        return res.status(400)
            .json({
                success: 'False',
                msg: 'Email already Exists'
            })
    } else {

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        
        let userModelInstance = new UserModel({
            name: name,
            email: email,
            password: hashedPassword
        })

        userModelInstance.save()
            .then(() => {
                return res.status(200)
                    .json({
                        success: 'True',
                        msg: 'User Registered',
                    })
            })
            .catch((err) => {
                return res
                    .json({
                        success: 'False',
                        msg: err
                    })
            })
    }
});


// @route       POST('/user/api/login')
// @desc        Login User
// @access      Public
router.route('/login').post(async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    
    UserModel.findOne({ email: email })
        .then((user) => {
            if (!user) {
                return res.status(404)
                    .json({
                        success: false,
                        msg: 'Email incorrect'
                    })
            }

            bcrypt.compare(password, user.password)
                .then((isMatched) => {
                    if (isMatched) {
                        const payload = {
                            id: user._id,
                            name: user.name,
                        }

                        const token = JWT.sign(payload, key.secretOrKey)

                        res.json({
                            token: 'Bearer ' + token
                        })
                    } else {
                         res.json({
                           msg: 'Password Incorrect'
                        })
                    }
                   
                })
        })
})


// @route       POST('/user/api/current')
// @desc        Return Current User
// @access      Private
router.route('/current').get(
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user._id,
            name: req.user.name
        })
    })


// @route       GET('/user/api/viewUsers')
// @desc        Accessing the List of all users
// @access      Public
router.route('/viewUsers').get((req, res) => {
    UserModel.find((err, docs) => {
        if (err) {
            return res.status(400)
                .json({
                    success: 'False',
                    msg: err
                })
        } else {
            return res.send(docs)
        }
    })
})

module.exports = router