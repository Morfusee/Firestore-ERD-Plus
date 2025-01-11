import mongoose from "mongoose";

// Define a schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
});

// Create a model
const User = mongoose.model("User", userSchema);

export default User;