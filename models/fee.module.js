import mongoose from "mongoose";


const feeSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    fee: {
        type: Number,
        default: 0,
        trim: true,
    }
}, { timestamps: true });


const fee = mongoose.model("fee", feeSchema);

export default fee;