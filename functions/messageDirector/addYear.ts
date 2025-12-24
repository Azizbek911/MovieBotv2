import { Context, Markup } from "telegraf";
import Year from "../../models/years.module";
import { Message } from "telegraf/types";
import { errorConsole } from "../errorConsole";
import { updateLastMessage } from "../updateLastMessage";

export const addYear = async (message:string, newMessage:Message, ctx:Context) => {
    try {
        if (isNaN(parseInt(message))) {
            newMessage = await ctx.reply("Iltimos togri yil kiriting: (2024)", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
        } else {
            const year = parseInt(message)
            const existYear = await Year.findOne({ year: year });
            if (existYear) {
                newMessage = await ctx.reply("Kechirasiz siz kiritgan yil mavjud: ", Markup.inlineKeyboard([
                    [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
                ]));
            } else {
                const result = await Year.create({ year: year });
                newMessage = await ctx.reply(`Yil muvofiqiyatli kiritildi, siz kiritgan yil: ${result.year}`, Markup.inlineKeyboard([
                    [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
                ]));
            }
        }
        if (!ctx || !ctx.from) return;
        await updateLastMessage(newMessage, ctx.from.id)
    } catch(err) {
        await errorConsole(err, "Yil qo'shishda xatolik mavjud:", ctx)
    }
}