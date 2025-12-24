import mongoose from "mongoose";

const janrSchema = new mongoose.Schema({
    janr: {
        type: String,
        trim: true,
        unique: true
    }
}, { timestamps: true });

const janr = mongoose.model("janr", janrSchema);

export default janr;