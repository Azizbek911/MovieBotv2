import { Context, Markup } from "telegraf"
import { errorConsole } from "../errorConsole.ts"
import country from "../../models/country.module.js";
import { Message } from "telegraf/types";
import { updateLastMessage } from "../updateLastMessage.ts";


export const removeCountry = async (ctx: Context, message: string, newMessage: Message) => {
    try {
        if (!ctx || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        const isEmpty = await country.findOne({ country: message });
        if (!isEmpty) {
            newMessage = await ctx.reply("Kechirasiz, bu davlatni kiritmagansiz: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        } else {
            await country.deleteOne({ country: message });
            newMessage = await ctx.reply("Siz kiritgan davlat o'chirib tashlandi: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        }

        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Davlat o'chirishda xatolik mavjud: ", ctx)
    }
}