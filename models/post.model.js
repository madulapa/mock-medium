const mongoose = require("mongoose") 
const db = require('../db.js');

let PostSchema = new mongoose.Schema({
    title: {
        type:String, 
        require:true
    } ,
    body: {
        type: String, 
        require: true, 
        unique: true
    },
   // createdAt: new Date(),
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

module.exports = mongoose.model('Post', PostSchema)