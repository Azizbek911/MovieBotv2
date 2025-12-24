import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
    country: {
        type: String,
        unique: true,
        trim: true
    }
}, { timestamps: true });

const country = mongoose.model("country", countrySchema);

export default country;