import { Context, Markup } from "telegraf";
import { Message } from "telegraf/types";
import { errorConsole } from "../errorConsole.ts";
import language from "../../models/language.module.js";
import { updateLastMessage } from "../updateLastMessage.ts";


export const addLanguage = async (ctx: Context, message: string, newMessage: Message) => {
    try {
        if (!ctx || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const isEmpty = await language.findOne({ language: message });
        if (isEmpty) {
            newMessage = await ctx.reply("Kechirasiz, bu til oldin kiritilgan: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        } else {
            await language.create({ language: message });
            newMessage = await ctx.reply("Yangi til muvofiqiyatli kiritildi: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        }

        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Til qo'shishda xatolik mavjud: ", ctx)
    }
}