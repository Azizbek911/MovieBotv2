import { Context, Markup } from "telegraf"
import { errorConsole } from "../errorConsole"
import { Message } from "telegraf/types";
import janr from "../../models/janr.module.js";
import { updateLastMessage } from "../updateLastMessage.js";


export const addJanr = async (ctx: Context, message: string, newMessage: Message) => {
    if (!ctx || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
    try {
        const isEmpty = await janr.findOne({ janr: message });
        if (isEmpty) {
            newMessage = await ctx.reply("Kechirasiz bu janr oldin kiritilgan: ", Markup.inlineKeyboard([
                [Markup.button.callback("🔙 Orqaga", "back")]
            ]))
        } else {
            await janr.create({ janr: message });
            newMessage = await ctx.reply("Janr muvofiqiyatli kirtildi: ", Markup.inlineKeyboard([
                [Markup.button.callback("🔙 Orqaga", "back")]
            ]));
        }

        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Xatolik mavjud Janr qo'shishda", ctx)
    }
}