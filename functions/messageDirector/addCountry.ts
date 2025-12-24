import { Context, Markup } from "telegraf";
import { errorConsole } from "../errorConsole";
import country from "../../models/country.module";
import { Message } from "telegraf/types";
import { updateLastMessage } from "../updateLastMessage";


export const addCountry = async (ctx: Context, message: string, newMessage: Message) => {
    try {
        if (!ctx || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start")
        const isEmpty = await country.findOne({ country: message });
        if (isEmpty) {
            newMessage = await ctx.reply("Kechirasiz, bu davlat oldin ham kritilgan: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]))
        } else {
            await country.create({ country: message });
            newMessage = await ctx.reply("Davlat muvofiqiyatli kiritildi: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        }

        await updateLastMessage(newMessage, ctx.from.id)
    } catch (err) {
        await errorConsole(err, "Davlat qo'shishda xatolik mavjud:", ctx)
    }
}