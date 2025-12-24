import mongoose from "mongoose";


const zayafkaSchema = new mongoose.Schema({
    url: {
        type: String,
        trim: true,
        unique: true,
    },
    id: {
        type: String,
        trim: true,
        unique: true,
    },
    storage: {
        type: Array,
        trim: true,
        default: []
    }
}, {timestamps: true});

const zayafka = mongoose.model("zayafka", zayafkaSchema);

export default zayafka;