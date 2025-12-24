import mongoose from "mongoose";

const yearSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: [true, "Year is required"],
        unique: [true, "Year must be unique"],
        trim: true
    }
}, { timestamps: true });

const Year = mongoose.model("Year", yearSchema);

export default Year;