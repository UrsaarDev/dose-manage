const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
const Schema = mongoose.Schema;

// this will be our data base's data structure 
let counter = 0;
const schema = new Schema(
    {
        patient_pellet_dispense_id: {
            type: Number,
            require: true,
            default: () => counter++,
        },
        dispense_date: {
            type: Date,
            require: true,
        },
        patient_first_name: {
            type: String,
            require: true,
            maxLength: 50,
        },
        patient_last_name: {
            type: String,
            require: true,
            maxLength: 50,
        },
        patient_phone_number: {
            type: SchemaTypes.Long,
            require: true,
            get: v => Math.round(parseInt(v)),
            set: v => Math.round(parseInt(v)),
            alias: 'i',
        },
        patient_dob: {
            type: String,
            require: true,
            maxLength: 50,
        },
        is_new: {
            type: Boolean,
            require: true,
        },
        procedure_id: {
            type: Number,
            require: true,
        },
        address_id: {
            type: Number,
            require: true,
        },
        isDelete: {
            type: Boolean,
            require: true,
        },
        inputedDoses: {
            type: Array,
            require: true,
        }
    }, 
    { versionKey: false, timestamps: true },
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("patient_dispense_records", schema);