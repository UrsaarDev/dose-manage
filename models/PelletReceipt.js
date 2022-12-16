const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
let counter = 0;
const schema = new Schema(
    {
        pellet_receipt_id: {
            type: Number,
            require: true,
            default: () => counter++,
        },
        pellet_date: {
            type: Date,
            require: true,
        },
        pellet_receipt_invoice: {
            type: String,
            require: true,
            maxLength: 50,
        },
        pellet_receipt_verified_by: {
            type: String,
            require: true,
            maxLength: 50,
        },
        isDelete: {
            type: Boolean,
            require: true,
            default: () => false,
        },
        pellet_return_pharmacy: {
            type: Boolean,
            require: true,
            default: () => false,
        }
    },
    { versionKey: false, timestamps: true },
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("pellet_receipt_records", schema);