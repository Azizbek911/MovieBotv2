import mongoose from "mongoose";


const SettingSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    book_movie: {
        type: Boolean,
        default: false,
    },
    random_movie: {
        type: Boolean,
        default: false,
    },
    janr_movie: {
        type: Boolean,
        default: false,
    },
    country_movie: {
        type: Boolean,
        default: false
    },
    year_movie: {
        type: Boolean,
        default: false
    },
    language_movie: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


const botSetting = mongoose.model("setting", SettingSchema);


export default botSetting;