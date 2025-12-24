import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true
    },
    lastID: {
        type: Number,
        default: 1,
        trim: true,
        unique: true
    }
}, { timestamps: true });

const last_id = mongoose.model("counter", CounterSchema);

export default last_id;