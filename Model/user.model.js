const { Schema, model } = require("mongoose");
const UserSchema = new Schema({
  email: { type: String, unique: true },
  pass: String,
  name: String,
});
const UserModel = model("user", UserSchema);
module.exports = UserModel;
