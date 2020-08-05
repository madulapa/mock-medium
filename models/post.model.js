const mongoose = require("mongoose") 

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
    createdBy: {
        type: String, 
        require:false
    },
    updatedBy: {
        type: String, 
        require:false
    }
}, {timestamps:true})

module.exports = mongoose.model('Post', PostSchema)