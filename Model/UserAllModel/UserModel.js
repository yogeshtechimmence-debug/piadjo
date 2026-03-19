import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String },
  mobile: { type: Number },
  password: { type: String, required: true },
  image: { type: String },
});

export default mongoose.model("newuser", UserSchema);
