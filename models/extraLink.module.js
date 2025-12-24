import mongoose from "mongoose";


const extraLinkSchema = new mongoose.Schema({
    url: {
        type: String,
        trim: true,
        unique: true
    }
}, { timestamps: true });


const extraLink = mongoose.model("extraLink", extraLinkSchema);

export default extraLink;