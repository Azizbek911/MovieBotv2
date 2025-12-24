import mongoose from "mongoose";


const languageSchema = new mongoose.Schema({
    language: {
        type: String,
        unique: true,
        trim: true,
    }
}, { timestamps: true });

const language = mongoose.model("language", languageSchema);

export default language;