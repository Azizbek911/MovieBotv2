import mongoose from "mongoose";

const mainChannelSchema = new mongoose.Schema({
    channel: {
        type: String,
        trim: true,
        unique: true
    },
    url: {
        type: String,
        trim: true,
        unique: true
    }
}, { timestamps: true });


const mainChannel = mongoose.model("mainChannel", mainChannelSchema);

export default mainChannel;