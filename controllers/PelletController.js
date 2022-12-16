
const express = require('express')
const router = express.Router()

const PatientDispense = require('../models/PatientDispense')
const PelletReceipt = require('../models/PelletReceipt')
const Dose = require('../models/Dose')

router.get('/doGetWholeReceipts', (req, res) => {
    PelletReceipt.aggregate([
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

router.post('/doAddNewReceipt', (req, res) => {
    const newRecord = new PelletReceipt(req.body.receiptData)
    const doseData = req.body.doseData
    newRecord.save(function (err, added) {
        if (err) res.json({ success: false })
        else {
            doseData.forEach((each, i) => {
                each.pellet_receipt_id = added.pellet_receipt_id
                const newDose = new Dose(each)
                newDose.original_qty = newDose.dose_qty
                newDose.save(function (err, addedDose) {
                    if (err) res.json({ success: false })
                    else
                        if (i === doseData.length - 1) {
                            PelletReceipt.aggregate([
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
                                else res.json({ success: true, receipts: data })
                            })
                        }
                })
            })
        }
    })
})

router.post('/doUpdateReceipt', (req, res) => {
    const doseData = req.body.doseData
    const where = req.body.where
    PelletReceipt.findByIdAndUpdate(where, req.body.receiptData, function (err, docs) {
        PelletReceipt.findById(where, function (err, updated) {
            Dose.deleteMany({ pellet_receipt_id: updated.pellet_receipt_id }, function (err, removed) {
                if (err) return res.json({ success: false })
                else {
                    doseData.forEach((each, i) => {
                        each.pellet_receipt_id = updated.pellet_receipt_id
                        const newDose = new Dose(each)
                        newDose.save(function (err, addedDose) {
                            if (err) res.json({ success: false })
                            else
                                if (i === doseData.length - 1) res.json({ success: true })
                        })
                    })
                }
            })
        })
    })
})

router.post('/doAddNewReceiptForPharmacy', (req, res) => {
    const selDoses = req.body.selDoses
    const newRecord = new PelletReceipt(req.body.receiptData)
    newRecord.save(function (err, added) {
        if (err) res.json({ success: false })
        else {
            selDoses.forEach((selItem, i) => {
                Dose.findByIdAndUpdate(selItem._id, { dose_qty: selItem.dose_qty }, function (err, consumedDose) {
                    if (i === selDoses.length - 1 && !err)
                        PelletReceipt.aggregate([
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
                            else res.json({ success: true, receipts: data })
                        })
                })
            })
        }
    })
})

router.post('/doUpdateReceiptForPharmacy', (req, res) => {
    const selDoses = req.body.selDoses
    const where = req.body.where
    PelletReceipt.findByIdAndUpdate(where, req.body.receiptData, function (err, docs) {
        PelletReceipt.findById(where, function (err, updated) {
            selDoses.forEach((selItem, i) => {
                Dose.findByIdAndUpdate(selItem._id, { dose_qty: selItem.dose_qty }, function (err, consumedDose) {
                    if (i === selDoses.length - 1 && !err)
                        res.json({ success: true })
                })
            })
        })
    })
})

router.post('/doDeleteReceipt', (req, res) => {
    PelletReceipt.findByIdAndRemove(req.body.id, function (err, removed) {
        if (err) return res.json({ success: false })
        else return res.json({ success: true })
    })
})

router.post('/doSetPharmacy', (req, res) => {
    PelletReceipt.findByIdAndUpdate(req.body.where, {
        pellet_return_pharmacy: !req.body.value
    }, function (err, removed) {
        if (err) return res.json({ success: false })
        else return res.json({ success: true })
    })
})

module.exports = router