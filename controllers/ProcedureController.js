
const express = require('express')
const router = express.Router()

const Procedure = require('../models/Procedure')

router.get('/doGetWholeProcedure', (req, res) => {
    Procedure.find((err, data) => {
        if (err) return res.json(err)
        else return res.json(data)
    })
})

module.exports = router