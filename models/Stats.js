const mongoose = require("mongoose");

const statSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  commands: {
    type: [
      {
        value: String,
        timestamp: Number,
        userId: String,
        guildId: String
      }
    ],
    require: true
  },
  dms: {
    type: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        value: String,
        timestamp: Number,
        userId: String
      }
    ],
    require: true
  },
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Stats", statSchema);