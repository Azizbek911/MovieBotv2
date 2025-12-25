import User from "../models/user.module.js";



export const updateLastMessage = async (newMessage, userID) => {
    if (!newMessage.message_id) return;
    if (newMessage) {
        await User.findOneAndUpdate(
            { id: userID },
            { last_message_id: newMessage.message_id }
        ).exec();
        console.warn("Xabar saqlandi!")
    }
}