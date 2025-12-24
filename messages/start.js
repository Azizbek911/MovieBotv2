import { admin, UserMainButton } from "../functions/buttons/userButtons.js";
import { clearSession } from "../functions/clearSession.ts";
import User from "../models/user.module.js";
import { Input } from "telegraf";

export const startMessage = async (ctx) => {
    try {
        const userID = ctx.from.id;
        const targetUser = await User.findOne({ id: userID });
        clearSession(ctx)
        const videoMessage = await ctx.replyWithPhoto(
            Input.fromLocalFile("./database/photos/welcome.jpg"),
            {
                caption: `• Assalomu alaykum, ${ctx.from.first_name} Botimizga xush kelibsiz!\n\n✍🏻 | O'zingizga kerakli bo'lgan film kodini yuboring!`,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard:
                        targetUser.role === "owner" || targetUser.role === "admin"
                            ? admin
                            : UserMainButton
                }
            }
        );

        User.findOneAndUpdate(
            { id: userID },
            { last_message_id: videoMessage.message_id }
        ).exec();

    } catch (error) {
        console.error("Error in startMessage:", error);
        ctx.reply("Kechirasiz, xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
    }
};
