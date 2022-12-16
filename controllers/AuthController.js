const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const router = express.Router()
require("dotenv").config();

const keys = require("../../config/keys")
const User = require('../models/User')
const UserType = require('../models/UserType')

var SALT_WORK_FACTOR = 10

const sendNewEmail = (newPerson, reset = false, newPassword = '') => {
    console.log('sending email now...')
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    var mailOptions = {
        from: newPerson.user_name,
        to: process.env.MAIL_USER,
        subject: !reset ? 'Verify new user on BiosanaId' : 'Password reset on BiosanaId',
        html:
            !reset ? `Press <a href='${process.env.REACT_APP_CLIENT}/verify/${newPerson._id}'> here </a> to verify your friend: ${newPerson.user_name} <br/>Thanks`
                :
                `Press <a href='${process.env.REACT_APP_CLIENT}/reset/${newPerson._id}/${newPassword}'> here </a> to help your friend: ${newPerson.user_name}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + newPerson.user_name);
        }
    });
}

const sendFirstPassword = (newPerson, firstPassword) => {
    console.log('sending email now...')
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    var mailOptions = {
        from: process.env.MAIL_USER,
        to: newPerson.user_name,
        subject: 'Hi, Welcome to BiosanaId',
        html: `Email adress: ${newPerson.user_name}<br/>Password: ${firstPassword}<br/><br/>Time to <a href='${process.env.REACT_APP_CLIENT}/login'>SIGN IN</a>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + newPerson.user_name);
        }
    });
}

router.post('/doVerifyEmail', (req, res) => {
    User.findOneAndUpdate({ _id: req.body.where }, {
        permission: true
    }, function (err, updated) {
        if (err) return res.json({ success: false, error: err })
        return res.json({ success: true })
    })
})

router.get('/doGetWholeUsers', (req, res) => {
    User.find((err, data) => {
        if (err) return res.json({ success: false, error: err })
        return res.json({ success: true, users: data })
    }).sort({ user_type: 1 })
})

router.get('/doGetWholeUserTypes', (req, res) => {
    UserType.find({ user_type_name: { $ne: 'Client' } }, (err, data) => {
        if (err) return res.json({ success: false, error: err })
        return res.json({ success: true, userTypes: data })
    })
})

router.post('/doRegisterUser', (req, res) => {
    let curDate = new Date(Date.now())
    curDate.setDate(curDate.getDate() + parseInt(process.env.DAYS_TO_ADD))

    User.findOne({ user_name: req.body.user_name }).then((data) => {
        if (data !== null) return res.json({ success: false, error: 'Email already exists' })
        else {
            bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
                if (err) return next(err)

                const newPerson = new User({
                    user_type: req.body.user_type,
                    user_name: req.body.user_name,
                    user_first_name: req.body.user_first_name ? req.body.user_first_name : 'Alexander',
                    user_last_name: req.body.user_last_name ? req.body.user_last_name : 'Graham Bell',
                    password: '0',
                    permission: req.body.permission ? req.body.permission : false,
                    flag_delete: false,
                    flag_permission_time: 1,
                    permission_time: curDate,
                })

                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    if (err) return next(err)
                    else {
                        newPerson.password = hash
                        newPerson.save(function (err, added) {
                            if (err) console.log(err)
                            else {
                                req.body.sendToClient ? sendFirstPassword(added, req.body.password) : sendNewEmail(added)
                                res.json({ success: true, newUser: added, error: 'Please wait being permitted...' })
                            }
                        })
                    }
                })
            })
        }
    })
})

router.post('/doForgotPassword', (req, res) => {
    User.findOne({ user_name: req.body.user_name }).then((data) => {
        if (data === null) return res.json({ success: false, error: 'No email exists' })
        else {
            bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    sendNewEmail(data, true, hash)
                    res.json({ success: true, error: 'Sent success' })
                })
            })
        }
    })
})

router.post('/doResetPassword', (req, res) => {
    let curDate = new Date(Date.now())
    curDate.setDate(curDate.getDate() + parseInt(process.env.DAYS_TO_ADD))
    User.findOneAndUpdate({ _id: req.body.where }, {
        password: req.body.newPassword, permission_time: curDate.toLocaleString()
    }, function (err, updated) {
        if (err) return res.json({ success: false, error: err })
        return res.json({ success: true })
    })
})

router.post('/doDeleteUser', (req, res) => {
    User.findByIdAndUpdate(req.body.id, { flag_delete: true }, function (err, updated) {
        if (err) return res.send(err)
        return res.json({ success: true })
    })
    // User.findByIdAndRemove(req.body.id, (err) => {
    //     if (err) return res.send(err)
    //     return res.json({ success: true })
    // })
})

router.post('/doLoginUser', (req, res) => {
    let date = new Date();
    date.setHours(48);
    User.findOne({ user_name: req.body.email }).then((data) => {
        if (!data) return res.json({ error: 'No user' })
        else {
            if (!data.permission) return res.json({ error: 'No verify' })
            else {
                let a = new Date(Date.now())
                let b = new Date(data.permission_time)
                if (b < a) return res.json({ error: 'Invalid password' })
                else {
                    console.log((b - a) / 1000 / 3600 + " hrs left")
                    bcrypt.compare(req.body.password, data.password).then(isMatch => {
                        if (isMatch) {
                            const payload = {
                                id: data._id,
                                userType: data.user_type,
                                userName: req.body.email,
                                userFName: data.user_first_name,
                                userLName: data.user_last_name,
                                password: req.body.password,
                                createdAt: data.createdAt,
                                lastSigninDate: new Date(),
                            }
                            jwt.sign(
                                payload,
                                keys.secretOrKey,
                                {
                                    expiresIn: 31556926 // 1 year in seconds
                                },
                                (err, token) => {
                                    return res.json({
                                        success: true,
                                        token: "Bearer " + token
                                    })
                                }
                            )
                        } else {
                            return res.json({ error: 'Credential incorrect' })
                        }
                    })
                }
            }
        }
    })
})

router.post('/doUpdateUser', (req, res) => {
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            let updateQuery = {
                'user_name': req.body.user_name,
                'user_first_name': req.body.user_first_name,
                'user_last_name': req.body.user_last_name,
                'user_type': req.body.user_type,
                'permission': req.body.permission,
            }
            if (req.body.password !== '') {
                let curDate = new Date(Date.now())
                curDate.setDate(curDate.getDate() + parseInt(process.env.DAYS_TO_ADD))
                updateQuery.password = hash
                updateQuery.permission_time = curDate
            }
            User.findByIdAndUpdate(req.body._id, updateQuery, function (err, updated) {
                if (err) return res.send(err)
                return res.json({ success: true })
            })
        })
    })
})

router.post('/doAddExpiration', (req, res) => {
    let curDate = new Date(req.body.permission_time)
    curDate.setDate(curDate.getDate() + parseInt(process.env.DAYS_TO_ADD))

    User.findOneAndUpdate({ _id: req.body.where }, {
        permission_time: curDate.toLocaleString()
    }, function (err, updated) {
        if (err) return res.json({ success: false, error: err })
        else {
            User.findById(req.body.where, function (err, updatedUser) {
                return res.json({ success: true, updatedData: updatedUser })
            })
        }
    })
})

router.post('/doSetFullTime', (req, res) => {
    User.findOneAndUpdate({ _id: req.body.where }, {
        flag_permission_time: 2
    }, function (err, updated) {
        if (err) return res.json({ success: false, error: err })
        else {
            User.findById(req.body.where, function (err, updatedUser) {
                return res.json({ success: true, updatedData: updatedUser })
            })
        }
    })
})

module.exports = router