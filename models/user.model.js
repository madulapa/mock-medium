const mongoose = require("mongoose") 
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
    createdBy: {
        type: String, 
        require:false
    },
    updatedBy: {
        type: String, 
        require:false
    }
}, {timestamps:true})

module.exports = mongoose.model('User', UserSchema)