import { Markup } from "telegraf";
import { errorConsole } from "../errorConsole.js";
import janr from "../../models/janr.module.js";
import { updateLastMessage } from "../updateLastMessage.js";


export const removeJanr = async (ctx, message, newMessage) => {
    try {
        if (!ctx || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start")
        const isEmpty = await janr.findOne({ janr: message });
        if (!isEmpty) {
            newMessage = await ctx.reply("Kechirasiz bu janr kitilmagan: ", Markup.inlineKeyboard([
                [Markup.button.callback("🔙 Orqaga", "back")]
            ]));
        } else {
            await janr.deleteOne({ janr: message });
            newMessage = await ctx.reply("janr o'chirib tashlandi: ", Markup.inlineKeyboard([
                [Markup.button.callback("🔙 Orqaga", "back")]
            ]));
        }

        await updateLastMessage(newMessage, ctx.from.id)
    } catch (err) {
        await errorConsole(err, "Janr o'chirishda xatolik mavjud:", ctx)
    }
}