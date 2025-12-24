import { Message } from "telegraf/types";
import { errorConsole } from "../errorConsole";
import { Markup, type Context } from "telegraf"
import Year from "../../models/years.module";
import { updateLastMessage } from "../updateLastMessage";

export const removeYear = async (ctx:Context, message:string, newMessage:Message) => {
    try {
        if (isNaN(parseInt(message))) {
            newMessage = await ctx.reply("Iltimos yaroqli yil kiriting: (EG: 2024)", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]))
        } else {
            const isAvaible = await Year.findOne({ year: parseInt(message) });
            if (!isAvaible) {
                newMessage = await ctx.reply("Kechirasiz siz kiritgan yil hali yaratilmagan: ", Markup.inlineKeyboard([
                    [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
                ]));
            } else {
                await Year.deleteOne({ year: parseInt(message) });
                newMessage = await ctx.reply(`Yil muvofiqiyatli o'chirildi, hohlasangiz yana o'chirshingiz mumkin: \n\n${message}`, Markup.inlineKeyboard([
                    [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
                ]))
            }
        }
        if (!ctx || !ctx.from) return;
        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Yil o'chirishda xatolik mavjud: ", ctx);
    }
}