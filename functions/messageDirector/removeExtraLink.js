import { Markup } from "telegraf";
import { errorConsole } from "../errorConsole.js";
import { updateLastMessage } from "../updateLastMessage.js";
import extraLink from "../../models/extraLink.module.js";



export const removeExtraLink = async (ctx) => {
    try {
        const message = ctx.message.text;
        let newMessage;
        const isEmpty = await extraLink.findOne({ url: message });
        if (isEmpty) {
            await extraLink.deleteOne({ url: message });
            newMessage = await ctx.reply("✅ Link o'chirib tashlandi", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
        } else {
            newMessage = await ctx.reply("⚠️ Kechirasiz, bu link mavjud emas:", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
        }


        await updateLastMessage(newMessage, ctx.from.id);
    } catch (err) {
        await errorConsole(err, "Qo'shimcha link o'chirishda xatolik mavjud: ", ctx);
    }
}