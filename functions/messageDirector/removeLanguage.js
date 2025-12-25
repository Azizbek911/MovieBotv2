import { Markup } from "telegraf";
import { errorConsole } from "../errorConsole.js";
import language from "../../models/language.module.js";
import { updateLastMessage } from "../updateLastMessage.js";



export const removeLanguage = async (ctx, message, newMessage) => {
    try {
        if (!ctx || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");

        const isEmpty = language.findOne({ language: message });
        if (!isEmpty) {
            newMessage = await ctx.reply("Bu til mavjud emas o'chirish uchun: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        } else {
            await language.deleteOne({ language: message });
            newMessage = await ctx.reply("Siz kiritgan til o'chirib tashlandi: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        }

        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Til o'chirishda xatolik mavjud:", ctx)
    }
}