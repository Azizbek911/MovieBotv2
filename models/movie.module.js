import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    // description: {
    //     type: String,
    //     minLength: 15,
    //     maxLength: 1024
    // },
    parts: {
        type: Number,
        default: 1
    },
    country: {
        type: String,
        trim: true,
        required: true,
    },
    language: {
        type: String,
        trim: true,
        required: true
    },
    janr: {
        type: String,
        trim: true,
        requried: true
    },
    year: {
        type: Number,
        trim: true,
        requried: true
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    videos: {
        type: Array,
        required: true
    },
    views: {
        type: Array,
        default: []
    },
    likes: {
        type: Array,
        default: []
    },
    dislikes: {
        type: Array,
        default: []
    },
    instagramLink: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const movie = mongoose.model("movies", movieSchema);

export default movie;