const mongoose = require("mongoose") 
const db = require('../db.js');

let UserSchema = new mongoose.Schema({
    name: {
        type:String, 
        require:true,
        unique:true 
    },
    email: {
        type: String, 
        require: true, 
        unique: true
    }, 
    //createdAt: new Date(),
    //updatedAt: new Date(),
    createdBy: {
        type: String, 
        require:false
    },
    updatedBy: {
        type: String, 
        require:false
    }
})

module.exports = mongoose.model('User', UserSchema)