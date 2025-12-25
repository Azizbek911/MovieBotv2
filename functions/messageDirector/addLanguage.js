import { Markup } from "telegraf";
import { errorConsole } from "../errorConsole.js";
import language from "../../models/language.module.js";
import { updateLastMessage } from "../updateLastMessage.js";


export const addLanguage = async (ctx, message, newMessage) => {
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