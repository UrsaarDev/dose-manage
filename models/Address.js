const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
let counter = 0;
const schema = new Schema(
    {
        address_id: {
            type: Number,
            require: true,
            default: () => counter++,
        },
        city: {
            type: String,
            require: true,
            maxLength: 50,
        },
        street: {
            type: String,
            require: true,
            maxLength: 50,
        },
        state: {
            type: String,
            require: true,
            maxLength: 50,
        },
        zip: {
            type: String,
            require: true,
            maxLength: 50,
        },
    },
    { versionKey: false, timestamps: true },
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("address", schema);