
const express = require('express')
const router = express.Router()

const PatientDispense = require('../models/PatientDispense')
const Address = require('../models/Address')
const Dose = require('../models/Dose')

router.get('/doGetWholeDispense', (req, res) => {
    PatientDispense.aggregate([
        { $match: {} },
        {
            $lookup: {
                from: "doses",
                localField: "patient_pellet_dispense_id",
                foreignField: "patient_pellet_dispense_id",
                as: "doseInfo"
            },
        },
        {
            $lookup: {
                from: "addresses",
                localField: "address_id",
                foreignField: "address_id",
                as: "addressInfo"
            },
        },
    ], (err, data) => {
        if (err) return res.json(err)
        else return res.json(data)
    })
})

router.post('/doAddNewDispense', (req, res) => {
    const selDoses = req.body.selDoses
    const addressSummary = req.body.dispenseData.address.split('/')
    const newRecord = new PatientDispense(req.body.dispenseData)
    const newAddress = new Address({
        'city': addressSummary[0],
        'street': addressSummary[1],
        'state': addressSummary[2],
        'zip': addressSummary[3],
    })
    if (req.body.dispenseData.address !== '')
        newAddress.save(function (err, address) {
            if (err) res.json({ success: false })
            else {
                newRecord.address_id = address.address_id
                newRecord.patient_phone_number = Math.round(parseInt(newRecord.patient_phone_number))
                newRecord.save(function (err, added) {
                    if (err) res.json({ success: false })
                    else {
                        selDoses.forEach((selItem, i) => {
                            Dose.findByIdAndUpdate(selItem._id, { dose_qty: selItem.dose_qty }, function (err, consumedDose) {
                                if (i === selDoses.length - 1 && !err)
                                    PatientDispense.aggregate([
                                        { $match: {} },
                                        {
                                            $lookup: {
                                                from: "doses",
                                                localField: "patient_pellet_dispense_id",
                                                foreignField: "patient_pellet_dispense_id",
                                                as: "doseInfo"
                                            },
                                        },
                                        {
                                            $lookup: {
                                                from: "addresses",
                                                localField: "address_id",
                                                foreignField: "address_id",
                                                as: "addressInfo"
                                            },
                                        },
                                    ], (err, data) => {
                                        if (err) return res.json(err)
                                        else return res.json({ success: true, dispense: data })
                                    })
                            })
                        })
                    }
                })
            }
        })
    else {
        newRecord.address_id = -1
        newRecord.patient_phone_number = Math.round(parseInt(newRecord.patient_phone_number))
        newRecord.save(function (err, added) {
            if (err) res.json({ success: false })
            else {
                selDoses.forEach((selItem, i) => {
                    Dose.findByIdAndUpdate(selItem._id, { dose_qty: selItem.dose_qty }, function (err, consumedDose) {
                        if (i === selDoses.length - 1 && !err)
                            PatientDispense.aggregate([
                                { $match: {} },
                                {
                                    $lookup: {
                                        from: "doses",
                                        localField: "patient_pellet_dispense_id",
                                        foreignField: "patient_pellet_dispense_id",
                                        as: "doseInfo"
                                    },
                                },
                                {
                                    $lookup: {
                                        from: "addresses",
                                        localField: "address_id",
                                        foreignField: "address_id",
                                        as: "addressInfo"
                                    },
                                },
                            ], (err, data) => {
                                if (err) return res.json(err)
                                else return res.json({ success: true, dispense: data })
                            })
                    })
                })
            }
        })
    }
})

router.post('/doUpdateDispense', (req, res) => {
    const selDoses = req.body.selDoses
    const where = req.body.where
    PatientDispense.findById(where, function (err, oldDispense) {
        if (err) return res.json({ success: false })
        else {
            const addressSummary = req.body.dispenseData.address.split('/')
            const newAddress = new Address({
                'city': addressSummary[0],
                'street': addressSummary[1],
                'state': addressSummary[2],
                'zip': addressSummary[3],
            })
            if (oldDispense.address_id !== -1) {
                PatientDispense.findByIdAndUpdate(where, req.body.dispenseData, function (err, docs) {
                    PatientDispense.findById(where, function (err, updated) {
                        const query = {
                            'city': addressSummary[0],
                            'street': addressSummary[1],
                            'state': addressSummary[2],
                            'zip': addressSummary[3],
                        }
                        Address.updateOne({ address_id: updated.address_id }, query, function (err, updatedAddress) {
                            if (err) console.log(err)
                            else selDoses.forEach((selItem, i) => {
                                Dose.findByIdAndUpdate(selItem._id, { dose_qty: selItem.dose_qty }, function (err, consumedDose) {
                                    if (i === selDoses.length - 1 && !err)
                                        return res.json({ success: true })
                                })
                            })
                        })
                    })
                })
            }
            else {
                newAddress.save(function (err, address) {
                    if (err) res.json({ success: false })
                    else {
                        const query = req.body.dispenseData
                        query.address_id = address.address_id
                        PatientDispense.findByIdAndUpdate(where, query, function (err, docs) {
                            PatientDispense.findById(where, function (err, updated) {
                                if (err) console.log(err)
                                else selDoses.forEach((selItem, i) => {
                                    Dose.findByIdAndUpdate(selItem._id, { dose_qty: selItem.dose_qty }, function (err, consumedDose) {
                                        if (i === selDoses.length - 1 && !err)
                                            return res.json({ success: true })
                                    })
                                })
                            })
                        })
                    }
                })
            }
        }
    })
})

router.post('/doDeleteDispense', (req, res) => {
    PatientDispense.findByIdAndRemove(req.body.id, function (err, updated) {
        if (err) return res.json({ success: false })
        else return res.json({ success: true })
    })
})

router.get('/doGetWholeDoses', (req, res) => {
    Dose.find({ pellet_receipt_id: { $ne: undefined } }, function (err, data) {
        if (err) res.json({ success: false, err: err })
        else res.json({ success: true, doses: data })
    })
})

module.exports = router