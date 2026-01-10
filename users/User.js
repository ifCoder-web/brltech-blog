const mongoose = require("mongoose");
const { Schema } = mongoose;

const User = new Schema ({
  nick: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  pass: {
    type: String,
    require: true
  },
  articles: [{
    type: mongoose.ObjectId,
    ref: "Article",
    require: true
  }],
  createdAt: {
    type: Date,
    required: true,
    default: new Date()
  }
})

const Users = mongoose.model("User", User);

module.exports = Users;