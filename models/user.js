const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    pseudo: {
      type: String,
      unique: true,
      require: true,
    },
    autoPost: {
      type: Boolean,
      default: false
    },
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    userID: {
      type: String,
      unique: true
    },
    picture: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);