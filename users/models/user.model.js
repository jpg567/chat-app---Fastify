const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: String,
    username: String,
    password: String
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model("User", userSchema);