const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
let counter = 0;
const schema = new Schema(
    {
        user_id: {
            type: Number,
            require: true,
            default: () => counter++,
        },
        user_type: {
            type: String,
            require: true,
            maxLength: 50,
        },
        user_name: {
            type: String,
            require: true,
            maxLength: 50,
        },
        user_first_name: {
            type: String,
            require: true,
            maxLength: 50,
        },
        user_last_name: {
            type: String,
            require: true,
            maxLength: 50,
        },
        password: {
            type: String,
            require: true,
        },
        permission: {
            type: Boolean,
            require: true,
        },
        permission_time:{
            type:Date,
            require:true,
        },
        flag_delete: {
            type: Boolean,
            require: false,
        },
        flag_permission_time:{
            type:Number,
            require: true
        }
    },
    { versionKey: false, timestamps: true },
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("users", schema);