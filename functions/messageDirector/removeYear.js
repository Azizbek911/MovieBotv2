import { errorConsole } from "../errorConsole.js";
import { Markup} from "telegraf"
import Year from "../../models/years.module.js";
import { updateLastMessage } from "../updateLastMessage.js";

export const removeYear = async (ctx, message, newMessage) => {
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