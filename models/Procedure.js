const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
let counter = 0;
const schema = new Schema(
    {
        procedure_id: {
            type: Number,
            require: true,
            default: () => counter++,
        },
        procedure_name: {
            type: String,
            require: true,
            maxLength: 100,
        },
    },
    { versionKey: false, timestamps: true },
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("procedures", schema);