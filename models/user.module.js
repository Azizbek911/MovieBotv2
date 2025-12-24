import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id : {
        type: Number,
        required: [true, "User ID is required"],
        unique: true,
        trim: true,
    },
    first_name: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
    },
    last_name: {
        type: String,   
        trim: true
    },
    username: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user'
    },
    ispremium: {
        type: Boolean,
        default: false
    },
    subscription_start: {
        type: Date,
        default: null
    },
    saved: {
        type: Array,
        default: []
    },
    subscription_end: {
        type: Date,
        default: null
    },
    last_message_id: {
        type: Number,
        default: null
    },
    status: {
        type: Boolean,
        trim: true,
        default: true
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;