const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim:true,
    lowercase:true,
    unique:true,
    minlength:[8,'username must be at least 8 characters long']
  },
  email: {
    type: String,
    required: true,
    trim:true,
    lowercase:true,
    unique:true,
    minlength:[12,'email must be at least 12 characters long']
  },
  password: {
    type: String,
    required: true,
    trim:true,
    unique:true,
    minlength:[8,'password must be at least 8 characters long']
  }
});

const user = mongoose.model('user',userSchema);
module.exports = user;