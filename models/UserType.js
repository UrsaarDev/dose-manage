const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
let counter = 0;
const schema = new Schema(
    {
        user_type_id: {
            type: Number,
            require: true,
            default: () => counter++,
        },
        user_type_name: {
            type: String,
            require: true,
            maxLength: 50,
        },
        user_type_description: {
            type: String,
            require: true,
            maxLength: 500,
        },
    },
    { versionKey: false, timestamps: true },
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("user_types", schema);