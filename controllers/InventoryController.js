
const express = require('express')
const router = express.Router()

const Inventory = require('../models/Inventory')
const Dose = require('../models/Dose')

router.get('/doGetWholeInventories', (req, res) => {
    Inventory.aggregate([
        { $match: {} },
        {
            $lookup: {
                from: "doses",
                localField: "pellet_receipt_id",
                foreignField: "pellet_receipt_id",
                as: "doseInfo"
            },
        },
    ], (err, data) => {
        if (err) return res.json(err)
        else return res.json(data)
    })
})

router.post('/doAddNewInventory', (req, res) => {
    const selDoses = req.body.selDoses
    const newRecord = new Inventory(req.body.invData)
    newRecord.save(function (err, added) {
        if (err) res.json({ success: false })
        else {
            selDoses.forEach((selItem, i) => {
                Dose.findByIdAndUpdate(selItem._id, { dose_qty: selItem.dose_qty }, function (err, consumedDose) {
                    if (i === selDoses.length - 1 && !err)
                        Inventory.aggregate([
                            { $match: {} },
                            {
                                $lookup: {
                                    from: "doses",
                                    localField: "inv_id",
                                    foreignField: "inv_id",
                                    as: "doseInfo"
                                },
                            },
                        ], (err, data) => {
                            if (err) return res.json(err)
                            else res.json({ success: true, inventories: data })
                        })
                })
            })
        }
    })
})

router.post('/doUpdateInventory', (req, res) => {
    const selDoses = req.body.selDoses
    const where = req.body.where
    Inventory.findByIdAndUpdate(where, req.body.invData, function (err, docs) {
        Inventory.findById(where, function (err, updated) {
            console.log(selDoses)
            selDoses.forEach((selItem, i) => {
                Dose.findByIdAndUpdate(selItem._id, { dose_qty: selItem.dose_qty }, function (erra, consumedDose) {
                })
            })
            res.json({ success: true })
        })
    })
})

router.post('/doDeleteInventory', (req, res) => {
    Inventory.findByIdAndRemove(req.body.id, function (err, removed) {
        if (err) return res.json({ success: false })
        else return res.json({ success: true })
    })
})

module.exports = router