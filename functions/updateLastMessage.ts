import User from "../models/user.module";
import type { Message } from "telegraf/types"



export const updateLastMessage = async (newMessage: Message, userID: number) => {
    if (!newMessage.message_id) return;
    if (newMessage) {
        await User.findOneAndUpdate(
            { id: userID },
            { last_message_id: newMessage.message_id }
        ).exec();
        console.warn("Xabar saqlandi!")
    }
}