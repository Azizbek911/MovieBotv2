import { Context, Markup } from "telegraf";
import { Message } from "telegraf/types";
import { errorConsole } from "../errorConsole";
import language from "../../models/language.module";
import { updateLastMessage } from "../updateLastMessage";



export const removeLanguage = async (ctx: Context, message: string, newMessage: Message) => {
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