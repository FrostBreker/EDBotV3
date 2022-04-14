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
    discordRefresh: {
      type: String,
      unique: true,
      require: true,
    },
    discordType: {
      type: String,
      unique: true,
      require: true,
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
    discordToken: {
      type: String,
      unique: true
    },
    photo: {
      type: String,
    },
    picture: {
      type: String,
    },
    tokenExpire: {
      type: Number
    },
    ppv: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);