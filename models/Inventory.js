const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
let counter = 0;
const schema = new Schema(
    {
        inv_id: {
            type: Number,
            require: true,
            default: () => counter++,
        },
        inv_date: {
            type: Date,
            require: true,
        },
        inv_receipt_invoice: {
            type: String,
            require: true,
            maxLength: 50,
        },
        inv_receipt_verified_by: {
            type: String,
            require: true,
            maxLength: 50,
        },
        isDelete: {
            type: Boolean,
            require: true,
            default: () => false,
        },
        inputedDoses: {
            type: Array,
            require: true,
        }
    },
    { versionKey: false, timestamps: true },
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("inv_adjustments", schema);