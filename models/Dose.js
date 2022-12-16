const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
let counter = 0;
const schema = new Schema(
    {
        dose_id: {
            type: Number,
            require: true,
            default: () => counter++,
        },
        dose_name_type: {
            type: String,
            require: true,
            maxLength: 50,
        },
        dose_size: {
            type: String,
            require: true,
            maxLength: 50,
        },
        dose_qty: {
            type: String,
            require: true,
            maxLength: 50,
        },
        dose_lot_number: {
            type: String,
            require: true,
            maxLength: 50,
        },
        pellet_exp_date: {
            type: String,
            require: true,
            maxLength: 50,
        },
        pellet_receipt_id: {
            type: Number,
        },
        patient_pellet_dispense_id: {
            type: Number,
        },
        inv_id: {
            type: Number,
        },
        original_qty: {
            type: String,
            require: true,
            maxLength: 100,
        },
    },
    { versionKey: false, timestamps: true },
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("doses", schema);