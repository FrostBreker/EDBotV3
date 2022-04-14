const mongoose = require("mongoose");

const guildSchema = mongoose.Schema({

  _id: mongoose.Schema.Types.ObjectId,
  guildID: String,
  guildName: String,
  ownerId: String,
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Guild", guildSchema);