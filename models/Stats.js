const mongoose = require("mongoose");

const statSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  numberOfRequest: Number,
  numberOfMessages: Number,
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Stats", statSchema);