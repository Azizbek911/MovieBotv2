import mongoose from "mongoose";

const forceSubscriptionSchema = new mongoose.Schema({
    url: {
        type: String,
        unique: true,
        trim: true
    }
}, {timestamps: true});


const forceSubscription = mongoose.model("forceSubscription", forceSubscriptionSchema);

export default forceSubscription;