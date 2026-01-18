const mongoose = require("mongoose");

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("connected to mongoDB Successfully.")
    })
}

module.exports = connectToDB;