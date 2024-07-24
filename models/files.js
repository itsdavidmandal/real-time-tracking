const mongoose = require("mongoose")


const File = mongoose.Schema({
    path :{
        type :String,
        required:  true
    },
    originalFileName:{
        type :String,
        // required:  true
    },
    password: String,
    downloadedCOunt :{
        type : Number,
        required: true,
        default:0
    }
})

module.exports=mongoose.model("File" , File)