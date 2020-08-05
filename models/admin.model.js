const mongoose = require("mongoose");

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
    createdBy: {
        type: String, 
        require:false
    },
    updatedBy: {
        type: String, 
        require:false
    }
}, {timestamps:true})

module.exports = mongoose.model('Admin', AdminSchema)