const mongoose = require("mongoose") ;
const config = require('./config.json');

mongoose
.connect(
    config.DB.URL, 
    config.DB.options
)

.then(() => {
    console.log("mongoDB connected....")
})
.catch(err => console.log(err));