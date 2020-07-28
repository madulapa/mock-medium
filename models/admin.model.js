const mongoose = require("mongoose");
const db = require('../db.js');

let AdminSchema = new mongoose.Schema({
    name: {
        type:String, 
        require:true
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

module.exports = mongoose.model('Admin', AdminSchema)